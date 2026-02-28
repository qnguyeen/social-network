import { useState } from "react";
import Chart from "react-apexcharts";
import { useQuery } from "@tanstack/react-query";
import * as StatisticService from "@/services/StatisticService";

export default function CampaignBarChart() {
  const [timeFrame, setTimeFrame] = useState("all");

  const {
    data: campaignData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["campaignChart"],
    queryFn: async () => {
      return await StatisticService.getCampaignGeneral();
    },
    refetchOnWindowFocus: false,
  });

  // Fallback data in case API hasn't loaded yet or there's an error
  const fallbackData = {
    all: {
      totalCampaigns: 0,
      totalTargetAmount: 0,
    },
    thisyear: {
      totalCampaigns: 0,
      totalTargetAmount: 0,
    },
    today: {
      totalCampaigns: 0,
      totalTargetAmount: 0,
    },
    thisweek: {
      totalCampaigns: 0,
      totalTargetAmount: 0,
    },
    thismonth: {
      totalCampaigns: 0,
      totalTargetAmount: 0,
    },
  };

  const options = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    colors: ["#465FFF", "#9CB9FF"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 5,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["All Time", "This Year", "This Month", "This Week", "Today"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "",
      },
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        formatter: function (value) {
          if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
          else if (value >= 1000) return (value / 1000).toFixed(0) + "K";
          return value;
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (
          value,
          { series, seriesIndex, dataPointIndex, w }
        ) {
          if (seriesIndex === 1) {
            return "$" + value.toLocaleString();
          }
          return value;
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
    },
  };

  // Get data with safe fallbacks
  const safeData = campaignData || fallbackData;

  const series = [
    {
      name: "Total Campaigns",
      data: [
        safeData.all?.totalCampaigns || 0,
        safeData.thisyear?.totalCampaigns || 0,
        safeData.thismonth?.totalCampaigns || 0,
        safeData.thisweek?.totalCampaigns || 0,
        safeData.today?.totalCampaigns || 0,
      ],
    },
    {
      name: "Target Amount ($)",
      data: [
        safeData.all?.totalTargetAmount || 0,
        safeData.thisyear?.totalTargetAmount || 0,
        safeData.thismonth?.totalTargetAmount || 0,
        safeData.thisweek?.totalTargetAmount || 0,
        safeData.today?.totalTargetAmount || 0,
      ],
    },
  ];

  const timeFrameOptions = [
    { value: "all", label: "All Time" },
    { value: "thisyear", label: "This Year" },
    { value: "thismonth", label: "This Month" },
    { value: "thisweek", label: "This Week" },
    { value: "today", label: "Today" },
  ];

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="h-80 bg-gray-100 rounded w-full"></div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center py-10">
        <div className="text-red-500 text-lg mb-2">
          Failed to load campaign data
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => refetch()}
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // If loading, show skeleton
  if (isLoading) return <LoadingSkeleton />;

  // If error, show error state
  if (isError) return <ErrorState />;

  // Use API data if available, fallback data otherwise
  const chartData = campaignData || fallbackData;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Campaign Statistics
        </h3>
        <select
          className="bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
        >
          {timeFrameOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Total Campaigns</p>
          <h4 className="text-2xl font-semibold text-gray-800">
            {chartData[timeFrame]?.totalCampaigns || 0}
          </h4>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Target Amount</p>
          <h4 className="text-2xl font-semibold text-gray-800">
            ${(chartData[timeFrame]?.totalTargetAmount || 0).toLocaleString()}
          </h4>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div id="campaignBarChart" className="min-w-full">
          <Chart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
}
