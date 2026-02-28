import { useNavigate } from "react-router-dom";
import { BlankAvatar } from "~/assets/index";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import * as FriendService from "~/services/FriendService";
import * as PostService from "~/services/PostService";
import { UpdateUser } from "~/components";
import { useTranslation } from "react-i18next";
import { useCallback, useMemo } from "react";
import {
  setIsRefetchListPost,
  setIsRefetchPostShare,
} from "~/redux/Slices/postSlice";
import { setIsRefetchListFriend } from "~/redux/Slices/userSlice";

const ProfileCard = () => {
  const user = useSelector((state) => state?.user);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const refetchFlags = useSelector((state) => ({
    isRefetchPostShare: state?.post?.isRefetchPostShare,
    isRefetchListPost: state?.post?.isRefetchListPost,
    isRefetchListFriend: state?.user?.isRefetchListFriend,
  }));

  const { data: friends = [] } = useQuery({
    queryKey: ["friendOfUser", user?.id, refetchFlags.isRefetchListFriend],
    queryFn: async () => {
      const res = await FriendService.getMyFriends();
      if (refetchFlags.isRefetchListFriend) {
        dispatch(setIsRefetchListFriend(false));
      }
      return res || [];
    },
    enabled: !!user?.id,
  });

  const { data: listShare = 0 } = useQuery({
    queryKey: ["listShare", user?.id, refetchFlags.isRefetchPostShare],
    queryFn: async () => {
      const res = await PostService.getListShare({
        userId: user?.id,
        page: 1,
        size: 10,
      });
      if (refetchFlags.isRefetchPostShare) {
        dispatch(setIsRefetchPostShare(false));
      }
      return res?.result?.totalElement || 0;
    },
    enabled: !!user?.id,
  });

  const { data: myPost = 0 } = useQuery({
    queryKey: ["myPost", user?.id, refetchFlags.isRefetchListPost],
    queryFn: async () => {
      const res = await PostService.getMyPosts({
        page: 1,
        size: 10,
      });
      if (refetchFlags.isRefetchListPost) {
        dispatch(setIsRefetchListPost(false));
      }
      return res?.result?.totalElement || 0;
    },
    enabled: !!user?.id,
  });

  const displayName = useMemo(() => {
    return user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : "No name";
  }, [user?.firstName, user?.lastName]);

  const handleProfileClick = useCallback(() => {
    navigate(`/profile/me`);
  }, [navigate]);

  return (
    <div className="w-full bg-primary rounded-2xl shadow">
      <div className="w-full h-28 rounded-tr-2xl rounded-tl-2xl p-2 relative">
        {user?.coverImageUrl ? (
          <div className="w-full h-28 relative">
            <img
              src={user.coverImageUrl}
              alt="imageCover"
              className="h-full bg-cover bg-no-repeat w-full rounded-2xl"
            />
            <div className="absolute top-3 hover:scale-105 active:scale-95 transition-transform right-3 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100">
              <UpdateUser coverImage />
            </div>
          </div>
        ) : (
          <div className="w-full h-full rounded-2xl relative bg-zinc-500">
            <div className="absolute top-3 hover:scale-105 active:scale-95 right-3 bg-white rounded-full p-1 shadow-md cursor-pointer hover:bg-gray-100 transition-colors">
              <UpdateUser profileCard />
            </div>
          </div>
        )}

        {/* Profile Avatar */}
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-white bg-yellow-200 flex items-center justify-center overflow-hidden">
            <img
              src={user?.imageUrl || BlankAvatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-10 pb-4 px-4">
        <div className="text-center">
          <h3 className="font-bold text-lg">{displayName}</h3>
          <p className="text-gray-500 text-sm">@{user?.username}</p>
        </div>

        {/* Stats */}
        <div className="flex justify-between mt-4 text-center">
          <div className="flex-1">
            <p className="font-bold">{friends.length || 0}</p>
            <p className="text-xs text-ascent-2">{t("Bạn bè")}</p>
          </div>
          <div className="flex-1">
            <p className="font-bold">{myPost}</p>
            <p className="text-xs text-ascent-2">{t("Bài viết")}</p>
          </div>
          <div className="flex-1">
            <p className="font-bold">{listShare}</p>
            <p className="text-xs text-ascent-2">{t("Bài viết chia sẻ")}</p>
          </div>
        </div>

        {/* Profile Button */}
        <div className="mt-4">
          <button
            onClick={handleProfileClick}
            className="w-full active:scale-95 hover:scale-105 transition-transform bg-primary text-ascent-1 border-1 border-borderNewFeed py-2 rounded-lg font-medium"
          >
            {t("Hồ sơ của tôi")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
