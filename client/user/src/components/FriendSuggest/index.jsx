import { useTranslation } from "react-i18next";
import * as FriendService from "~/services/FriendService";
import { useQuery } from "@tanstack/react-query";
import FriendCardSkeleton from "~/components/Skeleton/FriendCardSkeleton";
import FriendSuggestItem from "~/components/FriendSuggest/FriendSuggestItem";

const FriendSuggest = () => {
  const { t } = useTranslation();

  const {
    data: suggestedUsers = [],
    isLoading: isLoadingSuggestions,
    refetch,
  } = useQuery({
    queryKey: ["friendsSuggest"],
    queryFn: async () => {
      const res = await FriendService.friendSuggesstion();
      return res?.result || [];
    },
  });

  const onSuccess = () => {
    refetch();
  };

  const renderUserList = () => {
    if (isLoadingSuggestions) {
      return (
        <div className="py-2 flex flex-col gap-y-2">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <FriendCardSkeleton key={index} />
            ))}
        </div>
      );
    }

    if (suggestedUsers.length === 0) {
      return (
        <div className="w-full flex items-center justify-center p-5">
          <span className="text-center text-ascent-1">
            {t("Không có bạn bè đề xuất")}
          </span>
        </div>
      );
    }

    return suggestedUsers.map((item) => {
      const connectionLabel = item.username || "Suggested for you";

      const fullName =
        `${item?.firstName || ""} ${item?.lastName || ""}`.trim() || "No name";

      return (
        <FriendSuggestItem
          item={item}
          connectionLabel={connectionLabel}
          fullName={fullName}
          onSuccess={onSuccess}
        />
      );
    });
  };

  return (
    <div className="w-full bg-primary rounded-2xl shadow  overflow-hidden">
      <div className="flex items-center justify-between border-b-[0.1px] border-borderNewFeed px-4 py-3">
        <span className="text-base font-medium">{t("Suggested for you")}</span>
      </div>
      <div className="px-4 pb-3">{renderUserList()}</div>
    </div>
  );
};

export default FriendSuggest;
