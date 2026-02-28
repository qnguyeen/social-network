import { useQuery } from "@tanstack/react-query";
import { ArrowDownIcon, ArrowUpIcon, GroupIcon } from "../../icons";
import Badge from "../ui/badge/Badge";
import * as StatisticsService from "@/services/StatisticService";
import { useTranslation } from "react-i18next";

// Define custom icon components for the missing icons
const GlobeIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ShieldCheckIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const LockIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CalendarIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function SocialNetworkStatsTable() {
  const { t } = useTranslation();
  // For demonstration purposes, using your provided data directly
  // In a real app, you would still use the useQuery hook to fetch data

  const { data, isLoading, error } = useQuery({
    queryKey: ["groupGeneral"],
    queryFn: async () => {
      // In a real implementation, this would fetch from the API
      return await StatisticsService.getGroupGeneral();

      // For now, return our mock data to demonstrate the UI
    },
  });

  // Format API data into stats array when available
  const stats = data
    ? [
        {
          name: t("Tổng số nhóm"),
          value: data?.totalGroups.toString(),
          icon: <GroupIcon className="size-5" />,
          trend: "neutral", // Assuming neutral when no trend data is provided
          percentage: "0%", // Placeholder since no percentage data is provided
        },
        {
          name: t("Nhóm công khai"),
          value: data?.visibilityStats.PUBLIC,
          icon: <GlobeIcon className="size-5" />,
          trend: "neutral",
          percentage: "0%",
        },
        {
          name: t("Nhóm được bảo vệ"),
          value: data?.visibilityStats.PROTECTED,
          icon: <ShieldCheckIcon className="size-5" />,
          trend: "neutral",
          percentage: "0%",
        },
        {
          name: t("Nhóm riêng tư"),
          value: data?.visibilityStats.PRIVATE,
          icon: <LockIcon className="size-5" />,
          trend: "neutral",
          percentage: "0%",
        },
        {
          name: t("Được tạo trong tháng này"),
          value: data?.createdThisMonth.toString(),
          icon: <CalendarIcon className="size-5" />,
          trend: "neutral",
          percentage: "0%",
        },
        {
          name: t("Được tạo trong năm nay"),
          value: data?.createdThisYear.toString(),
          icon: <CalendarIcon className="size-5" />,
          trend: "neutral",
          percentage: "0%",
        },
      ]
    : [];

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/20">
        <p className="font-medium text-red-700 dark:text-red-400">
          Failed to load statistics. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden h-full rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <table className="w-full h-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("Số liệu")}
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("Giá trị")}
            </th>
            <th className="py-3 px-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("Thay đổi")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {isLoading
            ? // Loading skeleton
              Array(6)
                .fill(0)
                .map((_, index) => (
                  <tr key={index}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-5 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="ml-auto h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </td>
                  </tr>
                ))
            : // Actual data
              stats.map((stat, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        {stat.icon}
                      </div>
                      <span className="font-medium text-gray-700 dark:text-white/90">
                        {stat.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800 dark:text-white/90">
                    {stat.value}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge
                      color={
                        stat.trend === "up"
                          ? "success"
                          : stat.trend === "down"
                          ? "error"
                          : "neutral"
                      }
                    >
                      {stat.trend === "up" ? (
                        <ArrowUpIcon />
                      ) : stat.trend === "down" ? (
                        <ArrowDownIcon />
                      ) : null}
                      {stat.percentage}
                    </Badge>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
