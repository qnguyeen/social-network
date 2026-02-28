import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import * as StatisticService from "@/services/StatisticService";
import { useTranslation } from "react-i18next";

// Color constants

// Timeframe mapping

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg">
    {/* Header skeleton */}
    <div className="px-6 pt-6 pb-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="mt-2 h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
        <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>

      {/* Stats skeleton */}
      <div className="flex justify-between mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-1/5 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            <div className="h-4 w-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            <div className="mt-2 h-7 w-12 mx-auto bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>

    {/* Chart skeleton */}
    <div className="px-6 pb-6">
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4">
        <div className="h-64 bg-gray-200 dark:bg-gray-700/50 rounded-lg"></div>
      </div>

      {/* Percentage skeleton */}
      <div className="flex items-center justify-between mt-6 px-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2 bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>

    {/* Footer skeleton */}
    <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="h-4 w-3/4 mx-auto bg-gray-200 dark:bg-gray-700 rounded-md"></div>
    </div>
  </div>
);

export default function EngagementMetrics() {
  const [timeframe, setTimeframe] = useState("thismonth");
  const { t } = useTranslation();

  const COLORS = {
    Posts: "#4F46E5", // Indigo
    Comments: "#0EA5E9", // Sky blue
    Likes: "#10B981", // Emerald
  };

  const TIMEFRAME_LABELS = {
    all: t("Mọi lúc"),
    thisyear: t("Năm nay"),
    today: t("Hôm nay"),
    thisweek: t("Tuần này"),
    thismonth: t("Tháng này"),
  };

  const { data: postData, isLoading } = useQuery({
    queryKey: ["postStatistics"],
    queryFn: async () => {
      const res = await StatisticService.getPostGeneral();
      return res;
    },
  });

  // Default data structure if API hasn't returned yet
  const data = postData || {
    all: { totalPosts: 0, totalComments: 0, totalLikes: 0 },
    thisyear: { totalPosts: 0, totalComments: 0, totalLikes: 0 },
    today: { totalPosts: 0, totalComments: 0, totalLikes: 0 },
    thisweek: { totalPosts: 0, totalComments: 0, totalLikes: 0 },
    thismonth: { totalPosts: 0, totalComments: 0, totalLikes: 0 },
  };

  // Memoize derived data to prevent recalculations on re-renders
  const { chartData, totalEngagement, percentages, growthTrend } =
    useMemo(() => {
      const timeframeData = data[timeframe];
      const total = Object.values(timeframeData).reduce(
        (sum, value) => sum + value,
        0
      );

      return {
        chartData: [
          { name: t("Bài viết"), value: timeframeData.totalPosts },
          { name: t("Bình luận"), value: timeframeData.totalComments },
          { name: t("Lượt thích"), value: timeframeData.totalLikes },
        ],
        totalEngagement: total,
        percentages: {
          posts:
            total > 0
              ? Math.round((timeframeData.totalPosts / total) * 100)
              : 0,
          comments:
            total > 0
              ? Math.round((timeframeData.totalComments / total) * 100)
              : 0,
          likes:
            total > 0
              ? Math.round((timeframeData.totalLikes / total) * 100)
              : 0,
        },
        growthTrend:
          timeframe === "thismonth" && data.thisweek.totalPosts > 0
            ? Math.round(
                (data.thismonth.totalPosts / data.thisweek.totalPosts - 1) * 100
              )
            : 0,
      };
    }, [data, timeframe]);

  // Generate insight message
  const insightMessage = useMemo(() => {
    const timeframeLabel = TIMEFRAME_LABELS[timeframe].toLowerCase();

    if (totalEngagement === 0) {
      return `No engagement data for ${timeframeLabel}.`;
    }

    if (timeframe === "thismonth") {
      return `${data[timeframe].totalPosts} posts this month with a ${Math.abs(
        growthTrend
      )}% ${
        growthTrend >= 0 ? "increase" : "decrease"
      } in posting activity compared to weekly average.`;
    }

    return `${data[timeframe].totalPosts} posts with ${
      data[timeframe].totalComments
    } comments and ${data[timeframe].totalLikes} likes ${
      timeframe === "all" ? "overall" : timeframeLabel
    }.`;
  }, [data, timeframe, totalEngagement, growthTrend]);

  // Show loading skeleton when data is being fetched
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg">
      {/* Header with title and timeframe selector */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {t("Số liệu tương tác")}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("Tổng quan về hoạt động tương tác của người dùng")}
            </p>
          </div>
          <div className="relative">
            <select
              className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              {Object.entries(TIMEFRAME_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main stats section */}
        <div className="flex justify-between mb-6">
          <div className="text-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t("Tổng số lượt tương tác")}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalEngagement}
            </p>
          </div>
          <div className="text-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t("Posts")}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data[timeframe].totalPosts}
            </p>
          </div>
          <div className="text-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t("Comments")}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data[timeframe].totalComments}
            </p>
          </div>
          <div className="text-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t("Likes")}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data[timeframe].totalLikes}
            </p>
          </div>
        </div>
      </div>

      {/* Chart section */}
      <div className="px-6 pb-6">
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  labelFormatter={() => ""}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Percentage breakdown section */}
        <div className="flex items-center justify-between mt-6 px-2">
          {Object.entries(COLORS).map(([name, color]) => (
            <div key={name} className="flex items-center">
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: color }}
              ></span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {name}: {percentages[name.toLowerCase()]}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with insight message */}
      <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          {insightMessage}
        </p>
      </div>
    </div>
  );
}
