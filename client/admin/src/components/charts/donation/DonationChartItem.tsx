import { useQuery } from "@tanstack/react-query";
import * as StatisticService from "@/services/StatisticService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// This would be your API response type
interface DonationStats {
  totalAmount: number;
  donationCount: number;
}

interface DonationData {
  all: DonationStats;
  thisyear: DonationStats;
  today: DonationStats;
  thisweek: DonationStats;
  thismonth: DonationStats;
}

const DonationChartItem = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["donationChart"],
    queryFn: async () => {
      const res = await StatisticService.getDonationGeneral();
      return res;
    },
  });

  const donationData: DonationData = data || {
    all: { totalAmount: 0, donationCount: 0 },
    thisyear: { totalAmount: 0, donationCount: 0 },
    today: { totalAmount: 0, donationCount: 0 },
    thisweek: { totalAmount: 0, donationCount: 0 },
    thismonth: { totalAmount: 0, donationCount: 0 },
  };

  // Format data for the bar chart
  const chartData = [
    {
      name: "Today",
      amount: donationData.today.totalAmount,
      donors: donationData.today.donationCount,
    },
    {
      name: "This Week",
      amount: donationData.thisweek.totalAmount,
      donors: donationData.thisweek.donationCount,
    },
    {
      name: "This Month",
      amount: donationData.thismonth.totalAmount,
      donors: donationData.thismonth.donationCount,
    },
    {
      name: "This Year",
      amount: donationData.thisyear.totalAmount,
      donors: donationData.thisyear.donationCount,
    },
    {
      name: "All Time",
      amount: donationData.all.totalAmount,
      donors: donationData.all.donationCount,
    },
  ];

  // Format currency for tooltip (VND)
  const formatCurrency = (value) => {
    // Convert to VND (approximate exchange rate - adjust as needed)
    const vndValue = value * 24000;

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(vndValue);
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded">
          <p className="font-bold">{label}</p>
          <p className="text-indigo-600">{`Amount: ${formatCurrency(
            payload[0].value
          )}`}</p>
          <p className="text-emerald-600">{`Donors: ${payload[1].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Chart colors - using consistent color scheme
  const amountColor = "#6366f1"; // indigo-500
  const donorsColor = "#10b981"; // emerald-500

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full">
        <div className="flex items-center mb-6">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-80 w-full bg-gray-100 rounded flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="mt-4 text-gray-400 text-sm">
              Loading chart data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Summary stats section
  const DonationSummary = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
        <p className="text-xs text-gray-500 uppercase font-semibold">
          Total Donations
        </p>
        <p className="text-2xl font-bold text-indigo-700">
          {formatCurrency(donationData.all.totalAmount)}
        </p>
      </div>
      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
        <p className="text-xs text-gray-500 uppercase font-semibold">
          Total Donors
        </p>
        <p className="text-2xl font-bold text-emerald-700">
          {donationData.all.donationCount}
        </p>
      </div>
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
        <p className="text-xs text-gray-500 uppercase font-semibold">
          This Month
        </p>
        <p className="text-2xl font-bold text-indigo-700">
          {formatCurrency(donationData.thismonth.totalAmount)}
        </p>
      </div>
      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
        <p className="text-xs text-gray-500 uppercase font-semibold">
          Today's Donors
        </p>
        <p className="text-2xl font-bold text-emerald-700">
          {donationData.today.donationCount}
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-indigo-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 000 2h10a1 1 0 100-2H3zm0 4a1 1 0 000 2h10a1 1 0 100-2H3zm0 4a1 1 0 100 2h10a1 1 0 100-2H3z"
            clipRule="evenodd"
          />
        </svg>
        Donation Statistics
      </h2>

      <DonationSummary />

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fill: "#4b5563" }} />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke={amountColor}
              tick={{ fill: "#4b5563" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={donorsColor}
              tick={{ fill: "#4b5563" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
            <Bar
              yAxisId="left"
              dataKey="amount"
              name="Amount (₫)"
              fill={amountColor}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="donors"
              name="Donors"
              fill={donorsColor}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DonationChartItem;
