import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutationHook } from "~/hooks/useMutationHook";
import { useDebounceHook } from "~/hooks/useDebounceHook";
import * as FriendService from "~/services/FriendService";
import * as GroupService from "~/services/GroupService";
import * as SearchService from "~/services/SearchService";
import { TextInput } from "~/components";
import AddMemberItem from "~/components/ManageGroup/AddMemberItem";
import SuggestItem from "~/components/ManageGroup/SuggestItem";
import { message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setIsReloadMemberList } from "~/redux/Slices/groupSlice";

const AddMember = ({ handleClose, group }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const isReloadMemberList = useSelector(
    (state) => state?.group?.isReloadMemberList
  );
  const debouncedSearchQuery = useDebounceHook(searchQuery, 500);

  const {
    data: listMembersInGroup = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["listMembersInGroup", group?.id],
    queryFn: async () => {
      if (!group?.id) return [];
      const res = await GroupService.getMembersInGroup({ groupId: group.id });
      return res?.result || [];
    },
    enabled: !!group?.id,
  });

  useEffect(() => {
    if (isReloadMemberList) {
      refetch();
      dispatch(setIsReloadMemberList(false));
    }
  }, [isReloadMemberList, refetch, dispatch]);

  const existingMemberIds = new Set(
    listMembersInGroup.map((member) => member.userId)
  );

  const { data: allSuggestedUsers = [] } = useQuery({
    queryKey: ["friendsSuggest"],
    queryFn: async () => {
      const res = await FriendService.friendSuggesstion();
      return res?.result || [];
    },
    enabled: !debouncedSearchQuery,
  });

  const suggestedUsers = allSuggestedUsers.filter(
    (user) => !existingMemberIds.has(user.userId)
  );

  const { data: allSearchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["userSearch", debouncedSearchQuery],
    queryFn: async () => {
      if (!debouncedSearchQuery.trim()) return [];
      const res = await SearchService.searchUser({
        keyword: debouncedSearchQuery,
      });
      return res?.result?.items || [];
    },
    enabled: !!debouncedSearchQuery.trim(),
  });

  const searchResults = allSearchResults.filter(
    (user) => !existingMemberIds.has(user.userId)
  );

  const mutation = useMutationHook(({ userId, groupId }) =>
    GroupService.addUserToGroup({ userId, groupId })
  );

  const { data, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      if (data?.code === 200) {
        message.success({ content: data?.message });
        refetch();
        dispatch(setIsReloadMemberList(true));
      }
    }
  }, [isSuccess, data, refetch]);

  const handleAddUser = async (userId) => {
    if (!group?.id) return;
    return mutation.mutateAsync({ userId, groupId: group.id });
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">{t("Add Members")}</h3>
      <div className="mb-4 ">
        <label className="block text-sm font-medium mb-1">
          {t("Search Users")}
        </label>

        <TextInput
          type="text"
          styles="w-full p-2 px-2 border rounded-xl"
          placeholder={t("Search by username")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">
          {searchQuery ? t("Search Results") : t("Suggested Users")}
        </h4>
        <div className="border rounded-xl divide-y max-h-64 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              {`${t("Searching Users")}...`}
            </div>
          ) : searchQuery && searchResults.length > 0 ? (
            searchResults.map((user) => (
              <AddMemberItem
                key={user?.userId}
                user={user}
                handleAddUser={handleAddUser}
              />
            ))
          ) : !searchQuery && suggestedUsers.length > 0 ? (
            suggestedUsers.map((user) => (
              <SuggestItem
                key={user?.userId}
                user={user}
                handleAddUser={handleAddUser}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchQuery
                ? t("No users found matching your search")
                : t("No suggested users available")}
            </div>
          )}
        </div>
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

export default AddMember;
