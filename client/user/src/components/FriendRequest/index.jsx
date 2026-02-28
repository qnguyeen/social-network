import { useTranslation } from "react-i18next";
import * as FriendService from "~/services/FriendService";
import { Link } from "react-router-dom";
import { BlankAvatar } from "~/assets";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { message, Spin } from "antd";
import {
  IoIosCheckmarkCircleOutline,
  IoIosCloseCircleOutline,
} from "react-icons/io";
import FriendCardSkeleton from "~/components/Skeleton/FriendCardSkeleton";
import { useDispatch } from "react-redux";
import { setIsRefetchListFriend } from "~/redux/Slices/userSlice";

const FriendRequest = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isLoadingAccept, setIsLoadingAccept] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);
  const dispatch = useDispatch();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["friendsRequest"],
    queryFn: async () => {
      const res = await FriendService.getFriendRequests();
      return res;
    },
  });

  // accept
  const handleAccept = async (id) => {
    setIsLoadingAccept(true);
    try {
      if (!id) return;
      const res = await FriendService.accept({ id });
      if (res) {
        dispatch(setIsRefetchListFriend(true));
        message.success(t("Accept"));
        refetch();
        queryClient.invalidateQueries(["myFriends"]);
      }
    } finally {
      setIsLoadingAccept(false);
    }
  };

  // decline
  const handleDecline = async (id) => {
    setIsLoadingReject(true);
    try {
      if (!id) return;
      const res = await FriendService.reject({ id });
      if (res?.code === 9999 || res?.status === "REJECTED") {
        message.success(t("Reject"));
        refetch();
      }
    } finally {
      setIsLoadingReject(false);
    }
  };

  const renderRequestList = () => {
    if (isLoading) {
      return Array(3)
        .fill(0)
        .map((_, index) => <FriendCardSkeleton key={index} />);
    }

    if (!data?.length) {
      return (
        <div className="w-full flex items-center justify-center p-5">
          <span className="text-center text-ascent-1">
            {t("Không có lời mời kết bạn")}
          </span>
        </div>
      );
    }

    return data.map((request) => (
      <div key={request.id} className="flex items-center justify-between py-2">
        <Link
          to={`/profile/${request?.id}`}
          className="flex gap-3 items-center cursor-pointer"
        >
          <img
            src={request?.imageUrl ?? BlankAvatar}
            alt={request?.username || "User"}
            className="w-8 h-8 object-cover rounded-full"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-ascent-1 truncate max-w-[150px]">
              {request?.username ?? "No username"}
            </span>
            <span className="text-xs text-ascent-2">
              {`${request?.firstName || ""} ${
                request?.lastName || ""
              }`.trim() || "No name"}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-x-4">
          {isLoadingAccept ? (
            <Spin size="small" />
          ) : (
            <IoIosCheckmarkCircleOutline
              size={22}
              onClick={() => handleAccept(request?.userId)}
              className="cursor-pointer text-ascent-1 hover:scale-105 transition-transform active:scale-95 hover:opacity-50"
            />
          )}
          {isLoadingReject ? (
            <Spin size="small" />
          ) : (
            <IoIosCloseCircleOutline
              size={22}
              onClick={() => handleDecline(request?.userId)}
              className="cursor-pointer text-ascent-2 hover:scale-105 transition-transform active:scale-95 hover:opacity-50"
            />
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="w-full bg-primary rounded-2xl shadow overflow-hidden">
      <div className="flex items-center justify-between border-b-[0.1px] border-borderNewFeed px-4 py-3">
        <span className="text-base font-medium">{t("Friend Requests")}</span>
        <span className="text-sm bg-bgSearch text-ascent-2 px-2 py-1 rounded-full">
          {data?.length || 0}
        </span>
      </div>
      <div className="px-4 pb-3 pt-2">{renderRequestList()}</div>
    </div>
  );
};

export default FriendRequest;
