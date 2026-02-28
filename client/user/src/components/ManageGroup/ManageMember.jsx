import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { TextInput } from "~/components";
import MemberItem from "~/components/ManageGroup/MemberItem";
import { setIsReloadMemberList } from "~/redux/Slices/groupSlice";
import * as GroupService from "~/services/GroupService";

const ManageMember = ({ handleClose, group, isOwnerGroup }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isReloadMemberList = useSelector(
    (state) => state?.group?.isReloadMemberList
  );
  const [searchQuery, setSearchQuery] = useState("");

  const { data, refetch } = useQuery({
    queryKey: ["membersInGroup", group?.id],
    queryFn: async () => {
      const res = await GroupService.getMembersInGroup({ groupId: group?.id });
      return res?.result;
    },
  });

  useEffect(() => {
    if (isReloadMemberList) {
      refetch();
      dispatch(setIsReloadMemberList(false));
    }
  }, [isReloadMemberList, refetch, dispatch]);

  const sortedMembers = React.useMemo(() => {
    if (!data) return [];

    return [...data].sort((a, b) => {
      if (a.role === "LEADER") return -1;
      if (b.role === "LEADER") return 1;
      return 0;
    });
  }, [data]);

  const filteredMembers = React.useMemo(() => {
    if (!sortedMembers) return [];
    if (!searchQuery.trim()) return sortedMembers;

    return sortedMembers.filter((member) => {
      return true;
    });
  }, [sortedMembers, searchQuery]);

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">{t("Manage Members")}</h3>
      <div className="mb-4">
        <TextInput
          type="text"
          styles="w-full p-2 px-2 border rounded-xl"
          placeholder={t("Search members")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="border rounded divide-y max-h-64 overflow-y-auto">
        {filteredMembers?.map((member) => (
          <MemberItem
            key={member?.userId}
            member={member}
            group={group}
            isOwnerGroup={isOwnerGroup}
            searchQuery={searchQuery}
          />
        ))}
        {filteredMembers?.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            {t("No members found")}
          </div>
        )}
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleClose}
          className="px-4 py-2 bg-bgStandard text-ascent-3 rounded-xl hover:scale-105 active:scale-95 transition-transform hover:opacity-50"
        >
          {t("Save changes")}
        </button>
      </div>
    </div>
  );
};

export default ManageMember;
