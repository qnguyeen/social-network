import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { Image, message, Skeleton } from "antd";
import { MenuItem } from "@mui/material";
import { BiDotsHorizontalRounded, BiSolidLockAlt } from "react-icons/bi";
import { RiAttachment2 } from "react-icons/ri";
import { FaEarthAmericas, FaRegTrashCan } from "react-icons/fa6";
import { FiBookmark } from "react-icons/fi";
import { MdOutlineGTranslate } from "react-icons/md";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { BsChat } from "react-icons/bs";
import { CustomizeMenu } from "..";
import { getBase64 } from "~/utils";
import CreateComment from "../CreateComment";
import AlertWelcome from "../AlertWelcome";
import { BlankAvatar } from "~/assets";
import ChangeVisibility from "../ChangeVisibility";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as PostService from "~/services/PostService";
import { FaRegEdit } from "react-icons/fa";
import ConfirmDialog from "~/components/ConfirmDialog";
import { PiShareFat } from "react-icons/pi";
import SharePost from "~/components/SharePost";
import useGetDetailUserById from "~/hooks/useGetDetailUserById";

const SharePostCard = ({ post, isShowImage, handleRefetch }) => {
  const { t } = useTranslation();
  const { theme } = useSelector((state) => state?.theme);
  const userState = useSelector((state) => state?.user);
  const navigate = useNavigate();
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  // States
  const [showAll, setShowAll] = useState(0);
  const [likeCount, setLikeCount] = useState(post?.like || 0);
  const [isLiked, setIsLiked] = useState(
    post?.likedUserIds?.includes(userState?.id) || false
  );
  const [openSharePost, setOpenSharePost] = useState(false);
  const handleCloseSharePost = () => setOpenSharePost(false);
  const [isLiking, setIsLiking] = useState(false);
  const [share, setShare] = useState(post?.share || 0);
  const [openAlert, setOpenAlert] = useState(false);
  const [type, setType] = useState("");
  const [changeVisibility, setChangeVisibility] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isOpenReply, setIsOpenReply] = useState(false);
  const [file, setFile] = useState(null);
  const [img, setImg] = useState("");
  const [save, setSave] = useState(false);
  const [loadingDeletePost, setLoadingDeletePost] = useState(false);
  const [isLoadingTranslate, setIsLoadingTranslate] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const handleCloseConfirmDelete = () => setIsConfirmDelete(false);
  const { user } = useGetDetailUserById({ id: post?.userId });
  const { user: userShare } = useGetDetailUserById({
    id: post?.sharedPost?.[0]?.userId,
  });
  const open = Boolean(anchorEl);

  useEffect(() => {
    setLikeCount(post?.like || 0);
    setIsLiked(post?.likedUserIds?.includes(userState?.id) || false);
  }, [post?.like, post?.likedUserIds, userState?.id]);

  const renderContentWithHashtags = (content) => {
    if (!content) return null;

    const parts = content.split(/(#\w+)/g);

    return parts.map((part, index) => {
      if (part.startsWith("#")) {
        return (
          <span
            key={index}
            className={`text-blue-500 font-medium  ${
              !userState?.token
                ? "cursor-default"
                : "cursor-pointer hover:underline"
            }`}
            onClick={(e) => {
              if (!userState?.token) return;
              e.stopPropagation();
              const hashtag = part.substring(1);
              navigate("/search", {
                state: {
                  stateKeyword: part,
                  activeTab: "hashtags",
                },
              });
            }}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Event handlers
  const handleCloseChangeVisibility = useCallback(
    () => setChangeVisibility(false),
    []
  );
  const handleCloseAlert = useCallback(() => setOpenAlert(false), []);
  const handleCloseReply = useCallback(() => setIsOpenReply(false), []);
  const handleClick = useCallback(
    (event) => setAnchorEl(event.currentTarget),
    []
  );
  const handleClose = useCallback(() => setAnchorEl(null), []);

  const handleComment = useCallback(() => {
    if (!userState?.token) {
      setType("comment");
      setOpenAlert(true);
      return;
    }
    setIsOpenReply(true);
  }, [userState?.token]);

  const handleSaveUrl = useCallback(
    (id) => {
      copyToClipboard(`http://localhost:5173/post/${id}`);
    },
    [copyToClipboard]
  );

  const isSuccessChange = useCallback(
    (commentCount) => {
      post.commentCount = commentCount;
    },
    [post]
  );

  // API mutations
  const mutationDelete = useMutationHook((data) =>
    PostService.deletePost(data)
  );
  const mutationLike = useMutationHook((data) => PostService.like(data));

  // Handle file upload
  useEffect(() => {
    if (file) {
      getBase64(file)
        .then((result) => setImg(result))
        .catch((error) => console.error(error));
    }
  }, [file]);

  useEffect(() => {
    const { isPending, isSuccess, data } = mutationDelete;

    if (isPending) {
      message.open({
        type: "loading",
        content: t("Delete post share..."),
      });
    } else if (isSuccess) {
      handleRefetch(true);
      message.open({
        type: "success",
        content: t("Delete post share success"),
      });
    }
  }, [mutationDelete.isPending, mutationDelete.isSuccess, mutationDelete.data]);

  useEffect(() => {
    const { isSuccess, isError, data, error } = mutationLike;

    if (mutationLike.isPending) {
    } else {
      setIsLiking(false);

      if (isSuccess && data?.code === 200) {
        setLikeCount(data.result.like);
        setIsLiked(data.result.likedUserIds?.includes(userState?.id) || false);
      } else if (isError) {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        message.error(error?.message || "Failed to update like status");
      }
    }
  }, [
    mutationLike.isPending,
    mutationLike.isSuccess,
    mutationLike.isError,
    mutationLike.data,
    mutationLike.error,
    post,
    userState?.id,
    isLiked,
    likeCount,
  ]);

  // Action handlers
  const handleShare = () => {
    if (!userState?.token) {
      setType("share");
      setOpenAlert(true);
      return;
    }
    setOpenSharePost(true);
  };

  const handleOpenConfirmDelete = () => {
    setIsConfirmDelete(true);
    handleClose();
  };

  const handleDeletePost = async () => {
    setLoadingDeletePost(true);
    handleCloseConfirmDelete();
    try {
      const res = await PostService.deletePostShare({ postId: post?.id });
      if (res?.code === 200) {
        message.success({ content: t("Delete post share success") });
        handleRefetch(true);
      }
    } finally {
      setLoadingDeletePost(false);
    }
  };

  const handleLike = useCallback(
    (id) => {
      if (!userState?.token) {
        setType("like");
        setOpenAlert(true);
        return;
      }

      if (isLiking) return;

      setIsLiking(true);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

      mutationLike.mutate(id);
    },
    [isLiked, likeCount, isLiking, mutationLike, userState?.token]
  );

  const handleTranslate = useCallback(
    async ({ id, language }) => {
      setIsLoadingTranslate(true);
      handleClose();

      try {
        const res = await PostService.translatePost({
          id,
          language: language === "vi" ? "en" : "vi",
        });

        if (res?.code === 200) {
          post.language = res?.result?.language;
          post.content = res?.result?.content;
        }
      } finally {
        setIsLoadingTranslate(false);
      }
    },
    [handleClose, post]
  );

  const handleSavePost = useCallback(async (id) => {
    if (!userState?.token) {
      setType("save");
      setOpenAlert(true);
      return;
    }
    const res = await PostService.save(id);
    if (res?.code === 200) {
      setSave(true);
      message.success({ content: res?.message });
    }
  }, []);

  const contentToDisplay = useMemo(() => {
    if (isLoadingTranslate) {
      return <Skeleton variant="text" sx={{ width: "100%" }} />;
    }

    const content = post?.content || "";
    const displayContent =
      showAll === post?.id ? content : content.slice(0, 300);
    const shouldShowMore = content.length > 301;

    return (
      <>
        {renderContentWithHashtags(displayContent)}

        {shouldShowMore && (
          <span
            className="text-blue-700 ml-2 font-medium cursor-pointer"
            onClick={() => setShowAll(showAll === post?.id ? 0 : post?.id)}
          >
            {showAll === post?.id ? t("Hiển thị ít hơn") : t("Xem thêm")}
          </span>
        )}
      </>
    );
  }, [
    isLoadingTranslate,
    post?.content,
    post?.id,
    showAll,
    renderContentWithHashtags,
    t,
  ]);

  const contentShareToDisplay = useMemo(() => {
    const content = post?.sharedPost[0]?.content || "";
    const displayContent =
      showAll === post?.id ? content : content.slice(0, 300);
    const shouldShowMore = content.length > 301;

    return (
      <>
        {renderContentWithHashtags(displayContent)}

        {shouldShowMore && (
          <span
            className="text-blue-700 ml-2 font-medium cursor-pointer"
            onClick={() => setShowAll(showAll === post?.id ? 0 : post?.id)}
          >
            {showAll === post?.id ? t("Hiển thị ít hơn") : t("Xem thêm")}
          </span>
        )}
      </>
    );
  }, [
    post?.sharedPost[0]?.content,
    post?.id,
    showAll,
    renderContentWithHashtags,
    t,
  ]);

  const likeButtonClasses = useMemo(() => {
    const baseClasses =
      "flex gap-x-2 items-center cursor-pointer transition-transform";
    const hoverClasses = "hover:scale-105";
    const animationClasses = isLiking ? "animate-pulse" : "";

    return `${baseClasses} ${hoverClasses} ${animationClasses}`;
  }, [isLiking]);

  const formattedLikeCount = useMemo(() => {
    if (likeCount >= 1000) {
      return `${(likeCount / 1000).toFixed(1)}k`;
    }
    return likeCount;
  }, [likeCount]);

  const handleSuccessSharePost = () => {
    setShare(share + 1);
  };

  return (
    <div className="bg-primary rounded-xl py-3">
      <AlertWelcome
        open={openAlert}
        handleClose={handleCloseAlert}
        type={type}
      />
      <SharePost
        open={openSharePost}
        handleClose={handleCloseSharePost}
        post={post}
        onSuccessSharePost={handleSuccessSharePost}
      />
      <ConfirmDialog
        title="Xóa bài viết"
        confirmText="Xóa"
        variant="danger"
        description="Bạn có chắc chắn muốn xóa bài viết này không?"
        open={isConfirmDelete}
        loading={loadingDeletePost}
        onClose={handleCloseConfirmDelete}
        onConfirm={handleDeletePost}
      />

      <ChangeVisibility
        openChange={changeVisibility}
        handleClose={handleCloseChangeVisibility}
        closeMenu={handleClose}
        post={post}
        handleRefetch={handleRefetch}
      />

      {/* Header */}
      <div
        onClick={() => navigate(`/post/${post.id}`)}
        className="flex gap-3 px-5 items-center cursor-pointer"
      >
        {/* Avatar - Fixed to prevent distortion */}
        <div className="w-[50px] h-[50px] border border-borderNewFeed rounded-full overflow-hidden shadow-newFeed flex-shrink-0">
          <img
            onClick={(e) => e.stopPropagation()}
            src={user?.imageUrl ?? BlankAvatar}
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        </div>

        {/* User info and actions */}
        <div className="w-full flex justify-between">
          <div onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <Link to={`/profile/${post?.userId}`}>
                <p className="font-semibold text-[15px] leading-[21px] text-ascent-1">
                  {user?.username || "No name"}
                </p>
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#A4A8AD] text-sm">
                {moment(post?.createdDate).fromNow()}
              </span>
              {post?.visibility === "PRIVATE" && (
                <BiSolidLockAlt size={14} color="#A4A8AD" />
              )}
              {post?.visibility === "PUBLIC" && (
                <FaEarthAmericas size={14} color="#A4A8AD" />
              )}
            </div>
          </div>

          {/* Menu button */}
          <div
            className="flex justify-center items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1 rounded-full transition-colors duration-200 hover:bg-gradient-to-r hover:from-bgColor hover:via-from-bgColor hover:to-from-bgColor">
              <BiDotsHorizontalRounded
                size={25}
                color="#686868"
                className="cursor-pointer"
                onClick={handleClick}
                aria-controls={open ? "demo-customized-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              />
              <CustomizeMenu
                handleClose={handleClose}
                anchorEl={anchorEl}
                open={open}
                anchor={{ vertical: "top", horizontal: "right" }}
              >
                {userState?.token && (
                  <div>
                    <MenuItem
                      onClick={() =>
                        handleTranslate({
                          id: post?.id,
                          language: post?.language,
                        })
                      }
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={
                            theme === "dark" ? "text-white" : "text-black"
                          }
                        >
                          {t("Dịch sang")}{" "}
                          {post?.language === "vi" ? "en" : "vie"}
                        </span>
                        <MdOutlineGTranslate
                          className={
                            theme === "dark" ? "text-white" : "text-black"
                          }
                        />
                      </div>
                    </MenuItem>
                    <div
                      className={`w-full border-t my-2 ${
                        theme === "dark"
                          ? "border-[rgb(255,255,255,0.1)]"
                          : "border-[rgba(0,0,0,0.1)]"
                      }`}
                    ></div>

                    {userState?.id === post?.userId && (
                      <div>
                        <MenuItem
                          onClick={() => handleOpenConfirmDelete()}
                          disableRipple
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-red-600">{t("Xóa")}</span>
                            <FaRegTrashCan color="red" />
                          </div>
                        </MenuItem>
                        <MenuItem
                          onClick={() => setChangeVisibility(true)}
                          disableRipple
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-red-600">
                              {t("Hiển thị")}
                            </span>
                            <FaRegEdit color="red" />
                          </div>
                        </MenuItem>
                      </div>
                    )}
                  </div>
                )}
                <MenuItem onClick={() => handleSaveUrl(post?.id)}>
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={theme === "dark" ? "text-white" : "text-black"}
                    >
                      {isCopied ? t("Đã sao chép") : t("Sao chép")}
                    </span>
                    <RiAttachment2
                      className={theme === "dark" ? "text-white" : "text-black"}
                    />
                  </div>
                </MenuItem>
              </CustomizeMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 mt-1">
        <p className="text-ascent-1 text-sm font-normal leading-[21px]">
          {contentToDisplay}
        </p>

        <div className="bg-bgColor p-5 border-1 border-borderNewFeed rounded-2xl">
          {/* Header */}
          <div
            onClick={() => navigate(`/post/${post?.sharedPost[0]?.id}`)}
            className="flex gap-3 items-center cursor-pointer"
          >
            {/* Avatar - Fixed to prevent distortion */}
            <div className="w-[50px] h-[50px] border border-borderNewFeed rounded-full overflow-hidden shadow-newFeed flex-shrink-0">
              <img
                onClick={(e) => e.stopPropagation()}
                src={userShare?.imageUrl ?? BlankAvatar}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            {/* User info and actions */}
            <div className="w-full flex justify-between">
              <div onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <Link to={`/profile/${post?.sharedPost[0]?.id}`}>
                    <p className="font-semibold text-[15px] leading-[21px] text-ascent-1">
                      {userShare?.username || "No name"}
                    </p>
                  </Link>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#A4A8AD] text-sm">
                    {moment(post?.createdDate).fromNow()}
                  </span>
                  {post?.sharedPost[0]?.visibility === "PRIVATE" && (
                    <BiSolidLockAlt size={14} color="#A4A8AD" />
                  )}
                  {post?.sharedPost[0]?.visibility === "PUBLIC" && (
                    <FaEarthAmericas size={14} color="#A4A8AD" />
                  )}
                </div>
              </div>

              {/* Menu button */}
              <div
                className="flex justify-center items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-1 rounded-full transition-colors duration-200 hover:bg-gradient-to-r hover:from-bgColor hover:via-from-bgColor hover:to-from-bgColor">
                  <BiDotsHorizontalRounded
                    size={25}
                    color="#686868"
                    className="cursor-pointer"
                    aria-haspopup="true"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-1">
            <p className="text-ascent-1 text-sm font-normal leading-[21px]">
              {contentShareToDisplay}
            </p>

            {post?.sharedPost[0]?.imageUrls &&
              post?.sharedPost[0]?.imageUrls?.length > 0 &&
              !isShowImage && (
                <div>
                  <img
                    loading="lazy"
                    src={post?.sharedPost[0]?.imageUrls[0]}
                    alt="post image"
                    className="w-full mt-2 rounded-lg cursor-pointer"
                  />
                </div>
              )}

            {post?.sharedPost[0]?.video && !isShowImage && (
              <div className="relative">
                <video
                  width="100%"
                  controls
                  className="w-full mt-2 rounded-lg cursor-pointer"
                >
                  <source src={post?.sharedPost[0]?.video} />
                </video>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="w-full flex items-center justify-between">
            <div className="flex mt-2 items-center gap-x-4 text-ascent-2 text-base">
              <div className={likeButtonClasses}>
                <GoHeart size={20} className={`transition-all duration-300`} />

                <span className="transition-all duration-300">
                  {post?.sharedPost[0]?.like}
                </span>
              </div>

              {/* Comment */}
              <div className="flex gap-x-2 items-center cursor-pointer hover:scale-105 transition-transform">
                <BsChat size={17} className="cursor-pointer" />
                <span>{post?.sharedPost[0]?.commentCount}</span>
              </div>

              {/* Share */}
              <div className="flex gap-2 items-center hover:scale-105 text-base cursor-pointer transition-transform">
                <PiShareFat size={20} />
                <span>{post?.sharedPost[0]?.share}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full px-5 flex items-center justify-between">
        <div className="flex mt-2 items-center gap-x-4 text-ascent-2 text-base">
          <div
            onClick={() => handleLike(post?.id)}
            className={likeButtonClasses}
          >
            {isLiked ? (
              <GoHeartFill
                size={20}
                className={`text-red-600 ${
                  isLiking ? "animate-ping" : "transition-all duration-300"
                }`}
              />
            ) : (
              <GoHeart
                size={20}
                className={`transition-all duration-300 ${
                  isLiking ? "animate-pulse" : ""
                }`}
              />
            )}

            <span className="transition-all duration-300">
              {formattedLikeCount}
            </span>
          </div>

          {/* Comment */}
          <div className="flex gap-x-2 items-center cursor-pointer hover:scale-105 transition-transform">
            <BsChat
              size={17}
              onClick={() => handleComment(post?.id)}
              className="cursor-pointer"
            />
            <span>{post?.commentCount}</span>

            <CreateComment
              open={isOpenReply}
              handleClose={handleCloseReply}
              id={post?.id}
              post={post}
              comments={post?.comments}
              isSuccessChange={isSuccessChange}
            />
          </div>

          {/* Share */}
          <div
            onClick={() => handleShare()}
            className="flex gap-2 items-center hover:scale-105 text-base cursor-pointer transition-transform"
          >
            <PiShareFat size={20} />
            <span>{share}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#66666645] mt-3"></div>
    </div>
  );
};

export default SharePostCard;
