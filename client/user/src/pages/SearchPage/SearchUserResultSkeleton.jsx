import React from "react";

const SearchUserResultSkeleton = () => {
  return (
    <div className="flex justify-between p-2 rounded-2xl items-center w-full gap-x-2">
      <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />

      <div className="flex justify-between items-center flex-1">
        <div className="flex flex-col w-full">
          <div className="h-5 bg-gray-200 rounded-md w-24 mb-2 animate-pulse" />

          <div className="h-4 bg-gray-200 rounded-md w-32 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default SearchUserResultSkeleton;
