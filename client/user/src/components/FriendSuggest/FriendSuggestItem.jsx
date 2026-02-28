import { message, Spin } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiUserAddLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { BlankAvatar } from "~/assets";
import * as FriendService from "~/services/FriendService";

const FriendSuggestItem = ({ item, connectionLabel, fullName, onSuccess }) => {
  const [isLoadingRequest, setIsLoadingRequest] = useState(false);
  const { t } = useTranslation();

  const handleRequest = async (id) => {
    setIsLoadingRequest(true);
    try {
      const res = await FriendService.request({ id });

      if (res?.status === "PENDING") {
        message.success(t("Sent friend request successfully"));
        onSuccess();
      }
    } finally {
      setIsLoadingRequest(false);
    }
  };

  return (
    <div key={item.userId} className="flex items-center justify-between py-2">
      <Link
        to={`/profile/${item?.id}`}
        className="flex w-full gap-3 items-center cursor-pointer"
      >
        <div className="relative">
          <img
            src={item?.imageUrl ?? BlankAvatar}
            alt={fullName}
            className="w-8 h-8 object-cover rounded-full"
          />

          {item?.status === "ONLINE" && (
            <div className="absolute -bottom-1 -right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium text-ascent-1 truncate max-w-[150px]">
              {connectionLabel}
            </span>
          </div>
          <span className="text-xs text-ascent-2">{fullName}</span>
        </div>
      </Link>
      {isLoadingRequest ? (
        <div className="text-sm  p-1">
          <Spin size="small" />
        </div>
      ) : (
        <button
          className="text-sm text-ascent-1 p-1 rounded-full hover:bg-gray-100"
          onClick={() => handleRequest(item?.userId)}
        >
          <RiUserAddLine size={18} />
        </button>
      )}
    </div>
  );
};

export default FriendSuggestItem;
