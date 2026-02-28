import React from "react";
import { Card } from "antd";

const SearchPostResultSkeleton = ({ showImage = true }) => {
  return (
    <Card
      className="mb-3 rounded-2xl bg-primary border-1 border-borderNewFeed"
      hoverable
    >
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />

        <div className="ml-2 flex-1">
          <div className="h-5 bg-gray-200 rounded-md w-24 mb-1 animate-pulse" />

          <div className="h-3 bg-gray-200 rounded-md w-32 animate-pulse" />
        </div>
      </div>

      <div className="space-y-2 mb-2">
        <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse" />
        <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse" />
      </div>

      {showImage && (
        <div className="mt-2">
          <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      )}
    </Card>
  );
};

export default SearchPostResultSkeleton;
