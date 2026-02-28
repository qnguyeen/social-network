import { useState } from "react";
import { Users, Eye, EyeOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import * as StatisticService from "@/services/StatisticService";
import { useTranslation } from "react-i18next";

export default function GroupsDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const { t } = useTranslation();

  const { data: groups, isLoading } = useQuery({
    queryKey: ["top10Groups"],
    queryFn: async () => {
      return await StatisticService.getTop10Group();
    },
  });

  // Filter groups based on active tab
  const filteredGroups = () => {
    if (!groups) return [];

    switch (activeTab) {
      case "public":
        return groups.filter((group) => group.visibility === "PUBLIC");
      case "private":
        return groups.filter((group) => group.visibility === "PRIVATE");
      default:
        return groups;
    }
  };

  // Tabs for filtering groups
  const tabs = [
    { id: "all", label: t("Tất cả các nhóm") },
    { id: "public", label: t("Công cộng") },
    { id: "private", label: t("Riêng tư") },
  ];

  // Skeleton loader component
  const GroupSkeleton = () => (
    <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="w-full sm:w-1/2">
          <div className="h-5 bg-gray-200 rounded dark:bg-gray-700 w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full"></div>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-24"></div>
          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
          <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-16"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("Nhóm xã hội")}
          </h3>
          <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
            {t("Tổng quan về top 10 nhóm")}
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                } border border-gray-200 dark:border-gray-700 ${
                  tab.id === "all" ? "rounded-l-lg" : ""
                } ${tab.id === "private" ? "rounded-r-lg" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          // Show skeleton loaders while data is loading
          <>
            <GroupSkeleton />
            <GroupSkeleton />
            <GroupSkeleton />
          </>
        ) : groups?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No groups found</p>
          </div>
        ) : (
          // Display filtered groups
          filteredGroups().map((group) => (
            <div
              key={group.id}
              className="p-4 border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {group.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {group.description}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Users size={16} className="mr-1" />
                    <span className="text-sm">
                      {group.memberCount} {t("thành viên")}
                      {group.memberCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    {group.visibility === "PUBLIC" ? (
                      <>
                        <Eye size={16} className="mr-1" />
                        <span className="text-sm">{t("Công cộng")}</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={16} className="mr-1" />
                        <span className="text-sm">{t("Riêng tư")}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
