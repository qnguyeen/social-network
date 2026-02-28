import { Avatar, Card } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { BlankAvatar } from "~/assets";
import useGetDetailUserById from "~/hooks/useGetDetailUserById";
import useRenderContentWithHashtags from "~/hooks/useRenderContentWithHashtags";

const SearchPostResult = ({ post, searchKeyword = "" }) => {
  const navigate = useNavigate();
  const { user } = useGetDetailUserById({ id: post?.userId });
  const renderContentWithHashtags = useRenderContentWithHashtags({
    userState: user,
  });

  // Function to highlight keywords in text
  const highlightKeywords = (text, keyword) => {
    if (!keyword || !text) return text;

    // Create a case-insensitive regex with global flag
    const regex = new RegExp(
      `(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );

    // Split the text and create highlighted spans
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <span
            key={index}
            className="bg-yellow-200 text-yellow-800 px-1 rounded font-medium"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Enhanced content renderer that handles both hashtags and keyword highlighting
  const renderContentWithHighlights = (content) => {
    if (!content) return "";

    // First, render hashtags
    const contentWithHashtags = renderContentWithHashtags(content);

    // If there's a search keyword and we're in keywords tab, highlight it
    if (searchKeyword && typeof contentWithHashtags === "string") {
      return highlightKeywords(contentWithHashtags, searchKeyword);
    }

    // If contentWithHashtags is already JSX (from hashtag rendering), we need to handle it differently
    if (
      React.isValidElement(contentWithHashtags) ||
      Array.isArray(contentWithHashtags)
    ) {
      // For now, return as is - you might want to implement more complex highlighting logic
      // that works with the hashtag JSX elements
      return contentWithHashtags;
    }

    return contentWithHashtags;
  };

  return (
    <Card
      onClick={() => navigate(`/post/${post.id}`)}
      className="mb-3 rounded-2xl bg-primary border-1 border-borderNewFeed"
      hoverable
    >
      <div className="flex items-center mb-2">
        <Avatar src={user?.imageUrl || BlankAvatar} className="w-10 h-10" />
        <div className="ml-2">
          <p className=" font-medium text-ascent-1">{user?.username}</p>
          <p className="text-xs text-ascent-2 ">
            {user?.firstName + " " + user?.lastName || "No name"}
          </p>
        </div>
      </div>
      <p className="line-clamp-2 text-ascent-1">
        {renderContentWithHighlights(post?.content)}
      </p>
      {post?.imageUrls && post?.imageUrls?.length > 0 && (
        <div>
          <img
            loading="lazy"
            src={post?.imageUrls[0]}
            alt="post image"
            className="w-full mt-2 rounded-lg cursor-pointer"
          />
        </div>
      )}
    </Card>
  );
};

export default SearchPostResult;
