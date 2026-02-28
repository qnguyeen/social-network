import { useSelector } from "react-redux";
import * as PostService from "~/services/PostService";
import * as AdminService from "~/services/AdminService";
import * as UserService from "~/services/UserService";
import {
  PostCard,
  TopBar,
  CreatePost,
  Welcome,
  PostCardSkeleton,
  PageMeta,
} from "~/components";
import StoryRow from "~/components/StoryRow";
import { BlankAvatar } from "~/assets/index";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import { APP_NAME } from "~/utils";
import PopupAI from "~/components/PopupAI";
import { useMemo, useCallback, useState } from "react";
import LeftSideBar from "~/layouts/LeftSideBar";
import RightSideBar from "~/layouts/RightSideBar";
import FriendSuggestRow from "~/components/FriendSuggestRow";

const HomePage = () => {
  const user = useSelector((state) => state?.user);
  const { t } = useTranslation();
  const isAuthenticated = Boolean(user?.token);
  const [newPosts, setNewPosts] = useState([]);
  const [deletedPostIds, setDeletedPostIds] = useState(new Set());
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  let sentiment = useSelector((state) => state.post.sentiment);

  const { data: blocks = [] } = useQuery({
    queryKey: ["ListBlock"],
    queryFn: UserService.blockList,
    enabled: isAuthenticated,
  });

  const blockedUserIds = useMemo(() => {
    if (!blocks || !Array.isArray(blocks)) return new Set();
    return new Set(blocks.map((block) => block?.userId));
  }, [blocks]);

  const { data: listAdsPost } = useQuery({
    queryKey: ["adPosts"],
    queryFn: async () => {
      const res = await AdminService.getAllAdsPosts();
      return res?.result || [];
    },
    enabled: isAuthenticated,
  });

  const fetchPosts = async ({ pageParam = 1 }) => {
    const sentimentParam = sentiment.toUpperCase();
    let res;
    if (sentimentParam === "FOR YOU") {
      res = await PostService.getAllPosts(pageParam, { sort: "newest" });
    } else {
      res = await PostService.getPostsBySentiment({
        page: pageParam,
        sentiment: sentimentParam,
        sort: "newest",
      });
    }
    return {
      ...res.result,
      prevOffset: pageParam,
    };
  };

  const { data, fetchNextPage, hasNextPage, isLoading, refetch } =
    useInfiniteQuery({
      queryKey: ["posts", sentiment],
      queryFn: fetchPosts,
      staleTime: 0,
      getNextPageParam: (lastPage) => {
        if (lastPage.currentPage >= lastPage.totalPage) {
          return undefined;
        }
        return lastPage.currentPage + 1;
      },
    });

  const isDeletePostSuccess = useCallback(({ isDelete, postId }) => {
    if (isDelete && postId) {
      setNewPosts((prev) => prev.filter((post) => post.id !== postId));
      setDeletedPostIds((prev) => new Set([...prev, postId]));
    }
  }, []);

  const handleRefetch = useCallback(({ isCreated, newPost }) => {
    if (isCreated && newPost) {
      if (newPost?.visibility !== "PRIVATE") {
        setNewPosts((prev) => [newPost, ...prev]);
      }
    }
  }, []);

  const isPostBlocked = useCallback(
    (post) => {
      if (!post || !post.userId) return false;

      const authorId = post.userId;
      return blockedUserIds.has(authorId);
    },
    [blockedUserIds]
  );

  const posts = useMemo(() => {
    const allPosts = data?.pages.flatMap((page) => page.data) || [];

    const filteredNewPosts = newPosts.filter(
      (post) => !deletedPostIds.has(post.id) && !isPostBlocked(post)
    );

    const filteredFetchedPosts = allPosts.filter(
      (post) => !deletedPostIds.has(post.id) && !isPostBlocked(post)
    );

    return [...filteredNewPosts, ...filteredFetchedPosts];
  }, [data?.pages, newPosts, deletedPostIds, isPostBlocked]);

  const shouldShowFriendSuggestion = useCallback((index) => {
    return index === 5;
  }, []);

  const CreatePostSection = useCallback(() => {
    if (!isAuthenticated) return null;

    return (
      <div className="w-full flex items-center justify-between gap-3 py-4 px-5 border-b border-borderNewFeed">
        <div className="flex items-center gap-4">
          <div className="w-[50px] h-[50px] border-1 border-borderNewFeed rounded-full overflow-hidden shadow-newFeed">
            <img
              src={user?.imageUrl ?? BlankAvatar}
              alt="User Image"
              className="w-full h-full object-cover bg-center"
            />
          </div>
          <span className="text-ascent-2 text-sm cursor-pointer">
            {t("Có gì mới ?")}
          </span>
        </div>
        <CreatePost homePage handleRefetch={handleRefetch} />
      </div>
    );
  }, [isAuthenticated, user?.imageUrl, t, handleRefetch]);

  const StorySection = useCallback(() => {
    if (!isAuthenticated) return null;
    return <StoryRow />;
  }, [isAuthenticated]);

  const PostsList = useCallback(() => {
    if (isLoading) {
      return (
        <div className="w-full flex flex-col gap-y-6">
          {Array.from({ length: 3 }, (_, index) => (
            <PostCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      );
    }

    const postsWithSuggestions = [];

    posts.forEach((post, index) => {
      const adPost = listAdsPost?.find(
        (ad) => ad?.post_id === post.id && ad?.status === "ACTIVE"
      );

      postsWithSuggestions.push(
        <PostCard
          key={post.id}
          post={post}
          handleRefetch={handleRefetch}
          isAdActive={!!adPost}
          adData={adPost}
          isDeletePostSuccess={isDeletePostSuccess}
        />
      );

      if (shouldShowFriendSuggestion(index) && isAuthenticated) {
        postsWithSuggestions.push(
          <div key={`friend-suggest-${index}`} className="lg:hidden">
            <FriendSuggestRow />
          </div>
        );
      }
    });

    return postsWithSuggestions;
  }, [
    isLoading,
    posts,
    t,
    handleRefetch,
    listAdsPost,
    isDeletePostSuccess,
    shouldShowFriendSuggestion,
    isAuthenticated,
  ]);

  const MobileSidebarToggle = () => {
    if (!isAuthenticated) return null;

    return (
      <button
        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
        className="lg:hidden fixed bottom-4 left-4 z-50 bg-bgStandard text-ascent-3 p-3 shadow rounded-full hover:scale-105 active:scale-95 transition-transform"
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    );
  };

  const MobileSidebar = () => {
    if (!showMobileSidebar || !isAuthenticated) return null;

    return (
      <>
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowMobileSidebar(false)}
        />
        <div className="lg:hidden fixed left-0 top-0 bottom-0 w-80 bg-bgColor z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out">
          <div className="p-4">
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="absolute top-4 right-4 text-ascent-1 hover:text-ascent-2 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Sidebar content */}
            <div className="mt-8">
              <LeftSideBar />
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div>
      <PageMeta
        title={t(`Trang chủ - ${APP_NAME}`)}
        description="Truy cập LinkVerse ngay hôm nay! Kết nối với bạn bè, khám phá nội dung thú vị và chia sẻ khoảnh khắc đáng nhớ. Đăng nhập để bắt đầu hành trình của bạn!"
      />
      <PopupAI />

      <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
        <TopBar selectPosts title={sentiment} />
        <Welcome />

        <div className="w-full flex gap-2 pb-8 lg:gap-8 h-full">
          {/* Desktop Left Sidebar - unchanged */}
          <div className="hidden w-1/4 lg:w-1/5 h-full md:flex flex-col gap-6 overflow-y-auto">
            {user?.token && <LeftSideBar />}
          </div>

          {/* Main Content */}
          <div
            id="scroll"
            className="flex-1 h-full bg-primary lg:m-0 flex flex-col overflow-y-auto rounded-tl-3xl rounded-tr-3xl shadow-newFeed"
          >
            <CreatePostSection />
            <StorySection />
            <InfiniteScroll
              dataLength={posts.length}
              next={fetchNextPage}
              hasMore={hasNextPage}
              scrollableTarget="scroll"
              loader={<PostCardSkeleton />}
              endMessage={
                <div className="text-center h-screen flex items-center justify-center pb-10 text-gray-500">
                  {t("You've seen all posts")}
                </div>
              }
            >
              <div className="w-full h-full overflow-y-auto">
                <PostsList />
              </div>
            </InfiniteScroll>
          </div>

          {/* Desktop Right Sidebar - unchanged */}
          <div className="hidden w-1/5 h-full lg:flex flex-col gap-6 overflow-y-auto">
            {user?.token && <RightSideBar />}
          </div>
        </div>

        {/* Mobile Components */}
        <MobileSidebarToggle />
        <MobileSidebar />
      </div>
    </div>
  );
};

export default HomePage;
