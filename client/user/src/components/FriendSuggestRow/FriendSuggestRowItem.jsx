import { message, Spin } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { BlankAvatar } from "~/assets";
import * as FriendService from "~/services/FriendService";

const FriendSuggestRowItem = ({ suggestion, onSuccess }) => {
  const [isLoadingRequest, setIsLoadingRequest] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

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
    <div
      className="flex-shrink-0 relative"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="bg-primary rounded-xl md:rounded-2xl p-3 mx-1 md:p-4 w-36 md:w-44 border-1 border-borderNewFeed">
        {/* Avatar */}
        <div
          onClick={() => navigate(`/profile/${suggestion?.id}`)}
          className="flex justify-center cursor-pointer mb-2 md:mb-3"
        >
          <div className="relative">
            <img
              src={suggestion?.imageUrl ?? BlankAvatar}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover"
              alt={suggestion.username}
            />
          </div>
        </div>

        {/* User info */}
        <div
          onClick={() => navigate(`/profile/${suggestion?.id}`)}
          className="text-center cursor-pointer mb-3 md:mb-4"
        >
          <h3 className="text-black font-semibold text-xs md:text-sm truncate mb-1">
            {suggestion.username}
          </h3>
          <p className="text-gray-400 text-xs">{suggestion.username}</p>
        </div>

        {/* Follow button */}
        {isLoadingRequest ? (
          <button className="w-full bg-transparent border-1 hover:scale-105 active:scale-95 transition-all border-borderNewFeed text-black py-1.5 md:py-2 px-2 md:px-4 rounded-lg text-xs md:text-sm font-medium">
            <Spin size="small" />
          </button>
        ) : (
          <button
            onClick={() => handleRequest(suggestion?.userId)}
            className="w-full bg-transparent border-1 hover:scale-105 active:scale-95 transition-all border-borderNewFeed text-black py-1.5 md:py-2 px-2 md:px-4 rounded-lg text-xs md:text-sm font-medium"
          >
            Kết bạn
          </button>
        )}
      </div>
    </div>
  );
};

export default FriendSuggestRowItem;
