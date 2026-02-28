import  { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Sun, Moon } from "lucide-react";

// Mock service since we don't have the actual StatisticService
const mockStatisticService = {
  getUsers: () =>
    Promise.resolve({
      totalUsers: 1200,
      maleUsers: 650,
      femaleUsers: 520,
      otherUsers: 30,
      onlineUsers: 480,
      offlineUsers: 720,
      onlinePercentage: 40,
      registeredToday: 45,
      registeredThisMonth: 180,
      registeredThisYear: 850,
    }),
};

const LoadingSkeleton = ({ isDarkMode }) => (
  <div
    className={`w-full h-96 ${
      isDarkMode ? "bg-gray-800" : "bg-gray-100"
    } rounded-lg animate-pulse flex flex-col`}
  >
    <div
      className={`h-10 ${
        isDarkMode ? "bg-gray-700" : "bg-gray-200"
      } mb-4 rounded w-1/3 mx-auto mt-4`}
    ></div>
    <div className="flex-1 px-4 pb-4">
      <div
        className={`w-full h-full ${
          isDarkMode ? "bg-gray-700" : "bg-gray-200"
        } rounded`}
      ></div>
    </div>
    <div className="flex justify-center space-x-2 mb-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`h-4 w-16 ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          } rounded`}
        ></div>
      ))}
    </div>
  </div>
);

const UserStatsChart = () => {
  // Use system preference as initial state, default to dark if can't detect
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setIsDarkMode(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Custom colors based on theme
  const colorMap = isDarkMode
    ? {
        totalUsers: "#60a5fa", // lighter blue
        maleUsers: "#818cf8", // lighter indigo
        femaleUsers: "#f472b6", // lighter pink
        otherUsers: "#7dd3fc", // lighter sky blue
        onlineUsers: "#4ade80", // lighter green
        offlineUsers: "#fb7185", // lighter red
        onlinePercentage: "#fcd34d", // lighter yellow
        registeredToday: "#a78bfa", // lighter purple
        registeredThisMonth: "#93c5fd", // lighter blue
        registeredThisYear: "#6ee7b7", // lighter emerald
      }
    : {
        totalUsers: "#3b82f6", // blue
        maleUsers: "#4f46e5", // indigo
        femaleUsers: "#db2777", // pink
        otherUsers: "#0284c7", // sky blue
        onlineUsers: "#16a34a", // green
        offlineUsers: "#dc2626", // red
        onlinePercentage: "#ca8a04", // yellow
        registeredToday: "#7c3aed", // purple
        registeredThisMonth: "#2563eb", // blue
        registeredThisYear: "#059669", // emerald
      };

  // Fetch user data with React Query
  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userGeneral"],
    queryFn: async () => {
      // Use mock service for demo
      const res = await mockStatisticService.getUsers();
      return res;
    },
  });

  // If loading, show skeleton
  if (isLoading) return <LoadingSkeleton isDarkMode={isDarkMode} />;

  // If error, show error message
  if (error)
    return (
      <div
        className={`w-full h-96 flex items-center justify-center ${
          isDarkMode ? "bg-gray-800 text-red-400" : "bg-gray-100 text-red-600"
        } rounded-lg`}
      >
        <div className="text-center">
          <p className="text-xl font-bold">Error loading data</p>
          <p>{error.message || "Please try again later"}</p>
        </div>
      </div>
    );

  const data = userData || {
    totalUsers: 0,
    maleUsers: 0,
    femaleUsers: 0,
    otherUsers: 0,
    onlineUsers: 0,
    offlineUsers: 0,
    onlinePercentage: 0,
    registeredToday: 0,
    registeredThisMonth: 0,
    registeredThisYear: 0,
  };

  // Transform the object into an array format that recharts can use
  const chartData = Object.keys(data)
    .filter((key) => key !== "onlinePercentage") // Filter out percentage as it's on a different scale
    .map((key) => ({
      category: key,
      count: data[key],
      fill: colorMap[key],
    }));

  // Format category labels for better readability
  const formatCategoryName = (name) => {
    // Convert camelCase to Title Case With Spaces
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Custom tooltip styles based on theme
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`${
            isDarkMode
              ? "bg-gray-800 border-gray-700 text-gray-200"
              : "bg-white border-gray-200 text-gray-800"
          } p-2 border shadow-md rounded`}
        >
          <p className="font-medium">
            {formatCategoryName(payload[0].payload.category)}
          </p>
          <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
            Count: <span className="font-medium">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`w-full h-96 ${
        isDarkMode
          ? "bg-gray-900 border-gray-800 text-gray-200"
          : "bg-white border-gray-200 text-gray-800"
      } rounded-lg shadow-sm p-4 border relative`}
    >
      {/* Theme toggle button */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-2 right-2 p-2 rounded-full ${
          isDarkMode
            ? "bg-gray-700 hover:bg-gray-600"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
        aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      >
        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <h3
        className={`text-lg font-medium text-center mb-4 ${
          isDarkMode ? "text-gray-200" : "text-gray-800"
        }`}
      >
        User Statistics
      </h3>

      {data.onlinePercentage > 0 && (
        <div
          className={`text-center mb-2 text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          <span className="font-medium">Online Percentage:</span>{" "}
          <span className={isDarkMode ? "text-green-400" : "text-green-600"}>
            {data.onlinePercentage}%
          </span>
        </div>
      )}

      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 70,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDarkMode ? "#374151" : "#e5e7eb"}
          />
          <XAxis
            dataKey="category"
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12, fill: isDarkMode ? "#9ca3af" : "#4b5563" }}
            tickFormatter={formatCategoryName}
          />
          <YAxis
            tick={{ fontSize: 12, fill: isDarkMode ? "#9ca3af" : "#4b5563" }}
            tickCount={5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            wrapperStyle={{ paddingTop: 10 }}
            iconSize={10}
            formatter={(value) => (
              <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                {formatCategoryName(value)}
              </span>
            )}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserStatsChart;
