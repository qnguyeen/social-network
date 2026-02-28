import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { message, Skeleton } from "antd";
import { MenuItem } from "@mui/material";
import { BiDotsHorizontalRounded, BiSolidLockAlt } from "react-icons/bi";
import { FaEarthAmericas } from "react-icons/fa6";
import { GoBookmarkSlash, GoHeart, GoHeartFill } from "react-icons/go";
import { BsChat } from "react-icons/bs";
import { CustomizeMenu } from "..";
import { getBase64 } from "~/utils";
import { BlankAvatar } from "~/assets";
import * as PostService from "~/services/PostService";
import ConfirmDialog from "~/components/ConfirmDialog";
import { PiShareFat } from "react-icons/pi";
import useGetDetailUserById from "~/hooks/useGetDetailUserById";
import useRenderContentWithHashtags from "~/hooks/useRenderContentWithHashtags";

const SavedCard = ({ post, isShowImage, onSuccess }) => {
  const { t } = useTranslation();
  const userState = useSelector((state) => state?.user);
  const navigate = useNavigate();

  // States
  const [showAll, setShowAll] = useState(0);
  const [likeCount, setLikeCount] = useState(post?.like || 0);
  const [isLiked, setIsLiked] = useState(
    post?.likedUserIds?.includes(userState?.id) || false
  );
  const [isLiking, setIsLiking] = useState(false);
  const [share, setShare] = useState(post?.share || 0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isOpenReply, setIsOpenReply] = useState(false);
  const [file, setFile] = useState(null);
  const [img, setImg] = useState("");
  const [isLoadingTranslate, setIsLoadingTranslate] = useState(false);
  const [isLoadingUnsave, setIsLoadingUnsave] = useState(false);
  const [isConfirmUnsave, setIsConfirmUnsave] = useState(false);
  const handleCloseConfirmUnsave = () => setIsConfirmUnsave(false);
  const open = Boolean(anchorEl);
  const { user } = useGetDetailUserById({ id: post?.userId });
  const renderContentWithHashtags = useRenderContentWithHashtags({ userState });

  useEffect(() => {
    setLikeCount(post?.like || 0);
    setIsLiked(post?.likedUserIds?.includes(userState?.id) || false);
  }, [post?.like, post?.likedUserIds, userState?.id]);

  const handleClick = useCallback(
    (event) => setAnchorEl(event.currentTarget),
    []
  );
  const handleClose = useCallback(() => setAnchorEl(null), []);

  // Handle file upload
  useEffect(() => {
    if (file) {
      getBase64(file)
        .then((result) => setImg(result))
        .catch((error) => console.error(error));
    }
  }, [file]);

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

  const handleOpenConfirmUnsave = () => {
    setIsConfirmUnsave(true);
    handleClose();
  };

  const handleUnsave = async () => {
    setIsLoadingUnsave(true);
    try {
      if (post?.id) {
        const res = await PostService.unsave(post?.id);
        if (res?.code === 200) {
          message.success({ content: t("Bỏ lưu bài viết thành công") });
          onSuccess();
        }
      }
    } finally {
      setIsLoadingUnsave(false);
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

  return (
    <div className="bg-primary rounded-xl py-3">
      <ConfirmDialog
        title={t("Bỏ lưu bài viết")}
        confirmText={t("Bỏ lưu")}
        variant="danger"
        description={t("Bạn có chắc chắn muốn bỏ lưu bài viết này không?")}
        open={isConfirmUnsave}
        loading={isLoadingUnsave}
        onClose={handleCloseConfirmUnsave}
        onConfirm={handleUnsave}
      />

      {/* Header */}
      <div
        onClick={() => navigate(`/post/${post.id}`)}
        className="flex gap-3 px-5 items-center cursor-pointer"
      >
        {/* Avatar - Fixed to prevent distortion */}
        <div
          className="w-[50px] h-[50px] border border-borderNewFeed rounded-full overflow-hidden shadow-newFeed flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <img
            src={user?.imageUrl || BlankAvatar}
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
                className={`cursor-pointer ${open && "opacity-50"}`}
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
                <MenuItem onClick={handleOpenConfirmUnsave}>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-bgStandard">{t("Unsave")}</span>
                    <GoBookmarkSlash className="text-bgStandard" />
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

        {post?.imageUrls && post?.imageUrls?.length > 0 && !isShowImage && (
          <div>
            <img
              loading="lazy"
              src={post?.imageUrls[0]}
              alt="post image"
              className="w-full mt-2 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {post?.video && !isShowImage && (
          <div className="relative">
            <video
              width="100%"
              controls
              className="w-full mt-2 rounded-lg cursor-pointer"
            >
              <source src={post?.video} />
            </video>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="w-full px-5 flex items-center justify-between">
        <div className="flex mt-2 items-center gap-x-4 text-ascent-2 text-base">
          <div className={likeButtonClasses}>
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
            <BsChat size={17} className="cursor-pointer" />
            <span>{post?.commentCount}</span>
          </div>

          {/* Share */}
          <div className="flex gap-2 items-center hover:scale-105 text-base cursor-pointer transition-transform">
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

export default SavedCard;
