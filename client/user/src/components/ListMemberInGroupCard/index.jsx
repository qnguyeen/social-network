import { useTranslation } from "react-i18next";
import * as GroupService from "~/services/GroupService";
import { useQuery } from "@tanstack/react-query";
import StoryItemSkeleton from "~/components/Skeleton/StoryItemSkeleton";
import MemberItemCard from "~/components/ListMemberInGroupCard/MemberItemCard";

const ListMemberInGroupCard = ({ groupId }) => {
  const { t } = useTranslation();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["membersInGroup"],
    queryFn: async () => {
      const res = await GroupService.getMembersInGroup({ groupId: groupId });
      return res?.result;
    },
  });

  const renderMemberList = () => {
    if (isLoading) {
      return Array(3)
        .fill(0)
        .map((_, index) => <StoryItemSkeleton key={index} />);
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

    return data.map((request) => <MemberItemCard member={request} />);
  };

  return (
    <div className="w-full bg-primary rounded-2xl shadow overflow-hidden">
      <div className="flex items-center justify-between border-b-[0.1px] border-borderNewFeed px-4 py-3">
        <span className="text-base font-medium">{t("Members")}</span>
        <span className="text-sm bg-bgSearch text-ascent-2 px-2 py-1 rounded-full">
          {data?.length || 0}
        </span>
      </div>
      <div className="px-4 pb-3 pt-2">{renderMemberList()}</div>
    </div>
  );
};

export default ListMemberInGroupCard;
