import React from "react";
import { Skeleton } from "antd";

const StoryItemSkeleton = () => {
  return (
    <div className="flex flex-col items-center min-w-14 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-gray-200"></div>
      <div className="w-10 h-2 mt-2 bg-gray-200 rounded"></div>
      <div className="w-8 h-2 mt-1 bg-gray-200 rounded"></div>
    </div>
  );
};

export default StoryItemSkeleton;
