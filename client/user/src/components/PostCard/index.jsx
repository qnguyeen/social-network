import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { message, Skeleton } from "antd";
import { MenuItem } from "@mui/material";
import { BiDotsHorizontalRounded, BiSolidLockAlt } from "react-icons/bi";
import { RiAttachment2 } from "react-icons/ri";
import { FaEarthAmericas, FaRegTrashCan } from "react-icons/fa6";
import { MdOutlineGTranslate } from "react-icons/md";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { BsChat } from "react-icons/bs";
import { CustomizeMenu } from "..";
import { getBase64 } from "~/utils";
import CreateComment from "../CreateComment";
import AlertWelcome from "../AlertWelcome";
import { BlankAvatar } from "~/assets";
import ChangeVisibility from "../ChangeVisibility";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as PostService from "~/services/PostService";
import { FaRegEdit } from "react-icons/fa";
import ConfirmDialog from "~/components/ConfirmDialog";
import { PiShareFat } from "react-icons/pi";
import SharePost from "~/components/SharePost";
import useGetDetailUserById from "~/hooks/useGetDetailUserById";
import { HiOutlineBookmark } from "react-icons/hi";
import useRenderContentWithHashtags from "~/hooks/useRenderContentWithHashtags";

const PostCard = ({
  post,
  handleRefetch,
  isAdActive = false,
  adData,
  isDeletePostSuccess,
}) => {
  const { t } = useTranslation();
  const { theme } = useSelector((state) => state?.theme);
  const userState = useSelector((state) => state?.user);
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(0);
  const [likeCount, setLikeCount] = useState(post?.like || 0);
  const [commentCount, setCommentCount] = useState(post?.commentCount || 0);
  const [isLiked, setIsLiked] = useState(
    post?.likedUserIds?.includes(userState?.id) || false
  );
  const [isSaved, setIsSaved] = useState(
    post?.savedBy?.includes(userState?.id) || false
  );
  const [isSaving, setIsSaving] = useState(false);
  const [openSharePost, setOpenSharePost] = useState(false);
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
  const handleCloseSharePost = () => setOpenSharePost(false);
  const open = Boolean(anchorEl);
  const renderContentWithHashtags = useRenderContentWithHashtags({ userState });

  // FIXED: Always use the hook, but conditionally use its results
  const shouldFetchUser = Boolean(userState?.token && post?.userId);
  const userDetailResult = useGetDetailUserById({
    id: shouldFetchUser ? post?.userId : null,
  });

  // Use post data or user data based on availability
  const user = shouldFetchUser ? userDetailResult?.user : null;
  const displayName = user?.username || post?.username || "No name";
  const avatarImage = user?.imageUrl || post?.imageUrl || BlankAvatar;

  useEffect(() => {
    setIsSaved(post?.savedBy?.includes(userState?.id) || false);
  }, [post?.savedBy, userState?.id]);

  useEffect(() => {
    setLikeCount(post?.like || 0);
    setIsLiked(post?.likedUserIds?.includes(userState?.id) || false);
  }, [post?.like, post?.likedUserIds, userState?.id]);

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
      message.loading({ content: t("Delete post..."), duration: 0 });
    } else if (isSuccess) {
      handleRefetch(true);
      message.destroy();
      message.success({ content: t("Post deleted successfully!") });
    }
  }, [
    mutationDelete.isPending,
    mutationDelete.isSuccess,
    mutationDelete.data,
    handleRefetch,
  ]);

  useEffect(() => {
    const { isSuccess, isError, data, error } = mutationLike;

    if (mutationLike.isPending) {
      // Loading state if needed
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
      const res = await PostService.deletePost(post?.id);
      if (res?.code === 200) {
        message.success({ content: t("Xóa bài viết thành công") });
        isDeletePostSuccess({ isDelete: true, postId: post?.id });
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

  const mutationSavePost = useMutationHook((data) => {
    const { id, action } = data;
    return action === "save" ? PostService.save(id) : PostService.unsave(id);
  });

  useEffect(() => {
    const { isPending, isSuccess, isError, data, error } = mutationSavePost;

    if (isPending) {
      setIsSaving(true);
    } else {
      setIsSaving(false);

      if (isSuccess && data?.code === 200) {
        handleClose();
        message.success({
          content: isSaved
            ? t("Save post success!")
            : t("Unsave post success!"),
        });
      } else if (isError) {
        setIsSaved(!isSaved);
        message.error(error?.message || t("Failed to update save status"));
      }
    }
  }, [
    mutationSavePost.isPending,
    mutationSavePost.isSuccess,
    mutationSavePost.isError,
    mutationSavePost.data,
    mutationSavePost.error,
    isSaved,
    t,
  ]);

  const handleToggleSavePost = useCallback(
    async (id) => {
      if (!userState?.token) {
        setType("save");
        setOpenAlert(true);
        return;
      }

      if (isSaving) return;

      // Optimistic update
      setIsSaved(!isSaved);

      // Call the API
      mutationSavePost.mutate({
        id,
        action: isSaved ? "unsave" : "save",
      });
    },
    [isSaved, isSaving, userState?.token, mutationSavePost]
  );

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

  const handleCopyPostId = (id) => {
    if (id) {
      handleClose();
      navigator.clipboard.writeText(`http://localhost:5173/post/${id}`);
      message.success({ content: t("Post ID copied to clipboard!") });
    }
  };

  const getProfileRoute = () => {
    if (user) {
      return user?.username === userState?.username
        ? "/profile/me"
        : `/profile/${user?.profileId}`;
    }
    return post?.username === userState?.username
      ? "/profile/me"
      : `/profile/${post?.profileId}`;
  };

  const isDeleteCommentSuccess = ({ isDelete }) => {
    if (isDelete) {
      setCommentCount(commentCount - 1);
    }
  };

  const isCreateCommentSuccess = ({ isCreate }) => {
    if (isCreate) {
      setCommentCount(commentCount + 1);
    }
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
        title={t("Xóa bài viết")}
        confirmText={t("Xóa")}
        variant="danger"
        description={t("Bạn có chắc chắn muốn xóa bài viết này không?")}
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
        <div
          className="w-[50px] h-[50px] border border-borderNewFeed rounded-full overflow-hidden shadow-newFeed flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <img
            src={avatarImage}
            alt="User Avatar"
            className="w-full h-full object-cover cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(getProfileRoute());
            }}
          />
        </div>

        {/* User info and actions */}
        <div className="w-full flex justify-between">
          <div onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <Link
                to={getProfileRoute()}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <p className="font-semibold text-[15px] leading-[21px] text-ascent-1">
                  {displayName}
                </p>
              </Link>
            </div>
            <div className="flex items-center gap-1">
              {isAdActive && userState?.token ? (
                <>
                  <span className="text-ascent-2 text-sm">{t("Promoted")}</span>
                  {post?.visibility === "PRIVATE" && (
                    <BiSolidLockAlt size={14} className="text-ascent-2" />
                  )}
                  {post?.visibility === "PUBLIC" && (
                    <FaEarthAmericas size={14} className="text-ascent-2" />
                  )}
                </>
              ) : (
                <>
                  <span className="text-ascent-2 text-sm">
                    {moment(post?.createdDate).fromNow()}
                  </span>
                  {post?.visibility === "PRIVATE" && (
                    <BiSolidLockAlt size={14} className="text-ascent-2" />
                  )}
                  {post?.visibility === "PUBLIC" && (
                    <FaEarthAmericas size={14} className="text-ascent-2" />
                  )}
                </>
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
                className={`cursor-pointer ${open && "opacity-50"}`}
                open
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
                    {userState?.id !== post?.userId && (
                      <MenuItem onClick={() => handleToggleSavePost(post?.id)}>
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={
                              theme === "dark" ? "text-white" : "text-black"
                            }
                          >
                            {isSaved ? t("Đã lưu") : t("Lưu")}
                          </span>
                          <HiOutlineBookmark
                            className={
                              theme === "dark" ? "text-white" : "text-black"
                            }
                          />
                        </div>
                      </MenuItem>
                    )}
                    {post?.content?.trim() && (
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
                    )}

                    <div
                      className={`w-full border-t my-2 ${
                        theme === "dark"
                          ? "border-[rgb(255,255,255,0.1)]"
                          : "border-[rgba(0,0,0,0.1)]"
                      }`}
                    />

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
                <MenuItem onClick={() => handleCopyPostId(post?.id)}>
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={theme === "dark" ? "text-white" : "text-black"}
                    >
                      {t("Sao chép")}
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
      {isAdActive && userState?.token ? (
        <div className="px-5 mt-1">
          <p className="text-ascent-1 text-sm font-normal leading-[21px]">
            {contentToDisplay}
          </p>

          {post?.imageUrls && post?.imageUrls.length > 0 && (
            <div className="mt-2 mb-2 rounded-lg border-1 border-borderNewFeed overflow-hidden shadow-sm">
              <img
                loading="lazy"
                src={post.imageUrls[0]}
                alt="post preview"
                className="w-full h-auto object-cover"
              />
              <div className="p-4 bg-[#EDF3F8]">
                <p className="text-lg font-medium text-gray-800 mt-1">
                  {adData?.title}
                </p>
                <p className="text-sm text-gray-800 mt-1">
                  {adData?.description}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="px-5 mt-1">
          <p className="text-ascent-1 text-sm font-normal leading-[21px]">
            {contentToDisplay}
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
        </div>
      )}

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
            <span>{commentCount}</span>

            <CreateComment
              open={isOpenReply}
              handleClose={handleCloseReply}
              id={post?.id}
              post={post}
              comments={post?.comments}
              isSuccessChange={isSuccessChange}
              isDeleteCommentSuccess={isDeleteCommentSuccess}
              isCreateCommentSuccess={isCreateCommentSuccess}
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

export default PostCard;
