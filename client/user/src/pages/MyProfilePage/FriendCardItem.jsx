import { Popover, Spin } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import {
  IoIosCheckmarkCircleOutline,
  IoIosCloseCircleOutline,
} from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { BlankAvatar } from "~/assets";
import { Button } from "~/components";

const FriendCardItem = ({
  friend,
  handleDecline,
  handleCancelRequest,
  friendsFilter,
  handleAccept,
  handleOpenUnfriendUserConfirm,
  handleOpenBlockUserConfirm,
  isLoadingAccept,
  isLoadingReject,
  isLoadingCancelRequest,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div
      key={friend?.id}
      className="bg-bgSearch border-1 border-borderNewFeed rounded-2xl p-3 transition-all hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        {/* Friend card content */}
        <div
          className="flex items-center gap-x-3 cursor-pointer"
          onClick={() => navigate(`/profile/${friend?.id}`)}
        >
          <div className="relative">
            <img
              src={friend?.imageUrl || BlankAvatar}
              alt="user avatar"
              className="w-14 h-14 rounded-full object-cover"
            />
            {friend?.status === "ONLINE" ? (
              <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            ) : (
              <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-zinc-400 rounded-full border-2 border-white"></div>
            )}
          </div>

          <div className="flex flex-col gap-y-2">
            <span className="text-sm font-semibold text-ascent-1">
              {friend?.username}
            </span>
            <span className="text-xs text-ascent-2">
              {`${friend?.firstName || ""} ${friend?.lastName || ""}`}
            </span>
          </div>
        </div>

        {/* Action buttons based on list type */}
        {friendsFilter === "all" && (
          <Popover
            placement="bottomRight"
            trigger="click"
            content={
              <div className="flex flex-col w-32">
                <button
                  onClick={() => handleOpenUnfriendUserConfirm(friend?.userId)}
                  className="py-2 px-3 rounded-xl text-left hover:bg-hoverItem text-danger text-sm"
                >
                  {t("Hủy kết bạn")}
                </button>
                <button
                  onClick={() => handleOpenBlockUserConfirm(friend?.userId)}
                  className="py-2 px-3 text-left rounded-xl hover:bg-hoverItem text-red-600 text-sm"
                >
                  {t("Chặn")}
                </button>
              </div>
            }
          >
            <button className="p-2 rounded-full hover:bg-bgColor text-ascent-2">
              <HiOutlineDotsHorizontal size={20} />
            </button>
          </Popover>
        )}

        {friendsFilter === "requests" && (
          <div className="flex gap-2">
            {isLoadingAccept ? (
              <Spin size="small" />
            ) : (
              <IoIosCheckmarkCircleOutline
                size={22}
                onClick={() => handleAccept(friend?.userId)}
                className="cursor-pointer text-ascent-1 hover:scale-105 transition-transform active:scale-95 hover:opacity-50"
              />
            )}

            {isLoadingCancelRequest ? (
              <Spin size="small" />
            ) : (
              <IoIosCloseCircleOutline
                size={22}
                onClick={() => handleDecline(friend?.userId)}
                className="cursor-pointer text-ascent-2 hover:scale-105 transition-transform active:scale-95 hover:opacity-50"
              />
            )}
          </div>
        )}

        {friendsFilter === "sent" && (
          <>
            {isLoadingCancelRequest ? (
              <div className="px-3 py-1">
                <Spin size="small" />
              </div>
            ) : (
              <Button
                onClick={() => handleCancelRequest(friend?.userId)}
                title={t("Hủy")}
                className="text-danger bg-primary px-3 py-1 hover:scale-105 active:scale-95 transition-transform text-xs border border-borderNewFeed rounded-full"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendCardItem;
