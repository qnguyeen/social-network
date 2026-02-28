import Chart from "react-apexcharts";
import { useState } from "react";
import { MoreDotIcon } from "../../icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import * as StatisticService from "@/services/StatisticService";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// Loading skeleton components
const DonutChartSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
    <div className="h-7 w-48 bg-gray-200 rounded dark:bg-gray-700 mb-4"></div>
    <div className="flex items-center justify-center">
      <div className="h-56 w-56 bg-gray-200 rounded-full dark:bg-gray-700"></div>
    </div>
  </div>
);

const StatsCardSkeleton = () => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
    <div className="flex justify-between items-center">
      <div>
        <div className="h-4 w-24 bg-gray-200 rounded dark:bg-gray-700"></div>
        <div className="mt-1 h-8 w-16 bg-gray-200 rounded dark:bg-gray-700"></div>
      </div>
      <div className="rounded-full bg-gray-200 p-3 dark:bg-gray-700 h-12 w-12"></div>
    </div>
  </div>
);

export default function MonthlySalesChart() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  // Fetch user data from API
  const { data, isLoading, isError } = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      return await StatisticService.getUsers();
    },
    refetchOnWindowFocus: false,
  });

  // Default/fallback data
  let userData = data || {
    totalUsers: 0,
    onlineUsers: 0,
    onlinePercentage: 0,
    registeredToday: 0,
    registeredThisMonth: 0,
    maleUsers: 0,
    femaleUsers: 0,
    otherUsers: 0,
    totalGroups: 0,
    createdToday: 0,
    createdThisMonth: 0,
    createdThisYear: 0,
    topGroups: [],
    visibilityStats: {
      PUBLIC: "0/0",
      PROTECTED: "0/0",
      PRIVATE: "0/0",
    },
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // Donut chart options for gender distribution
  const genderDonutOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
    },
    colors: ["#4f46e5", "#ec4899", "#8b5cf6"],
    labels: [t("Nam"), t("Nữ"), t("Khác")],
    stroke: {
      width: 0,
    },
    legend: {
      position: "bottom",
      fontFamily: "Outfit",
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} users`,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "16px",
              fontFamily: "Outfit, sans-serif",
              color: "#334155",
            },
            value: {
              show: true,
              fontSize: "20px",
              fontFamily: "Outfit, sans-serif",
              color: "#334155",
              formatter: (val) => `${val}`,
            },
            total: {
              show: true,
              label: t("Tổng"),
              fontSize: "14px",
              fontFamily: "Outfit, sans-serif",
              color: "#64748b",
              formatter: function (w) {
                return userData.totalUsers;
              },
            },
          },
        },
      },
    },
  };

  const genderDonutSeries = [
    userData?.maleUsers || 0,
    userData?.femaleUsers || 0,
    userData?.otherUsers || 0,
  ];

  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5">
        {/* Skeleton for donut chart */}
        <DonutChartSkeleton />

        {/* Skeletons for stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      </div>
    );
  }

  // If there's an error, show error message
  if (isError) {
    return (
      <div className="grid grid-cols-1 gap-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] text-center">
          <div className="text-red-500 text-lg mb-3">
            Failed to load user data
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            There was an error loading the dashboard data.
          </p>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5">
      {/* Gender Distribution */}
      <div className="overflow-hidden w-full rounded-2xl border border-gray-200 bg-white pt-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 px-5">
          {t("Phân bổ giới tính")}
        </h3>
        <Chart
          options={genderDonutOptions}
          series={genderDonutSeries}
          type="donut"
          height={320}
        />
      </div>

      {/* Stats Cards - 5 cards in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("Tổng số người dùng")}
              </h4>
              <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">
                {userData.totalUsers}
              </p>
            </div>
            <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900/20">
              <svg
                className="size-5 text-indigo-600 dark:text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Online Status */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("Người dùng trực tuyến")}
              </h4>
              <div className="flex items-end gap-1">
                <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">
                  {userData.onlineUsers}
                </p>
                <p className="mb-1 text-sm font-medium text-emerald-500">
                  ({userData.onlinePercentage}%)
                </p>
              </div>
            </div>
            <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/20">
              <svg
                className="size-5 text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Today's Registrations */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("Đăng ký hôm nay")}
              </h4>
              <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">
                {userData.registeredToday}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <svg
                className="size-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Monthly Registrations */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("Tháng này")}
              </h4>
              <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">
                {userData.registeredThisMonth}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
              <svg
                className="size-5 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
