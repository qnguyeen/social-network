import { useQuery } from "@tanstack/react-query";
import { message } from "antd";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { BlankAvatar } from "~/assets";
import useGetDetailUserById from "~/hooks/useGetDetailUserById";
import { setIsReloadMemberList } from "~/redux/Slices/groupSlice";
import * as GroupService from "~/services/GroupService";

const MemberItem = ({ member, searchQuery, group, isOwnerGroup }) => {
  const { user } = useGetDetailUserById({ id: member?.userId });
  const { t } = useTranslation();
  const userState = useSelector((state) => state?.user);
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(true);
  const [loadingRemove, setLoadingRemove] = useState(false);
  const [loadingRoleChange, setLoadingRoleChange] = useState(false);
  const [currentRole, setCurrentRole] = useState(member?.role || "MEMBER");

  // Check if current user is this member
  const isCurrentUser = userState?.id === member?.userId;

  useEffect(() => {
    if (!searchQuery || !searchQuery.trim() || !user) {
      setIsVisible(true);
      return;
    }
    const username = user?.username?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    setIsVisible(username.includes(query));
  }, [searchQuery, user]);

  useEffect(() => {
    setCurrentRole(member?.role || "MEMBER");
  }, [member?.role]);

  if (!isVisible) return null;

  const handleRemoveMember = async (memberId) => {
    if (!memberId && !group?.id) return;
    try {
      setLoadingRemove(true);
      const res = await GroupService.deleteMember({
        groupId: group?.id,
        userId: memberId,
      });
      if (res?.code === 200) {
        message.success({ content: res?.message });
        dispatch(setIsReloadMemberList(true));
      }
    } finally {
      setLoadingRemove(false);
    }
  };

  const handleRoleChange = async (event) => {
    const newRole = event.target.value;
    if (newRole === currentRole || !member?.userId || !group?.id) return;

    try {
      setLoadingRoleChange(true);

      const res = await GroupService.changeMemberRole({
        groupId: group?.id,
        memberId: member?.userId,
        newRole: newRole,
      });

      if (res?.code === 200) {
        message.success({ content: t("Role updated successfully") });
        setCurrentRole(newRole);
        dispatch(setIsReloadMemberList(true));
      }
    } finally {
      setLoadingRoleChange(false);
    }
  };

  // Determine if actions should be shown for this member
  const canManageMember =
    isOwnerGroup ||
    (userState?.id !== member?.userId && currentRole !== "OWNER");

  return (
    <div className="p-3 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
          <img
            src={user?.imageUrl || BlankAvatar}
            alt={user?.username || ""}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-medium">
            {user?.username}
            {isCurrentUser && (
              <span className="ml-2 text-sm italic text-gray-500">
                {t("You")}
              </span>
            )}
          </p>
          <p className="text-sm text-gray-500">
            {currentRole === "LEADER"
              ? t("Leader")
              : currentRole === "OWNER"
              ? t("Owner")
              : t("Member")}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {/* Only show role management options to the owner */}
        {isOwnerGroup && currentRole !== "LEADER" && (
          <>
            <select
              className="text-sm border rounded p-1"
              value={currentRole}
              onChange={handleRoleChange}
              disabled={loadingRoleChange}
            >
              <option value="MEMBER">{t("Member")}</option>
              <option value="LEADER">{t("Leader")}</option>
              <option value="OWNER">{t("Owner")}</option>
            </select>
            <button
              onClick={() => handleRemoveMember(member?.userId)}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
              disabled={loadingRemove}
            >
              {loadingRemove ? t("Remove...") : t("Remove")}
            </button>
          </>
        )}

        {currentRole === "MEMBER" && !isOwnerGroup && (
          <button
            onClick={() => handleRemoveMember(member?.userId)}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
            disabled={loadingRemove}
          >
            {loadingRemove ? t("Remove...") : t("Remove")}
          </button>
        )}
      </div>
    </div>
  );
};

export default MemberItem;
