// CampaignItemGridSkeleton.jsx
import React from "react";

const CampaignItemGridSkeleton = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      {/* Image placeholder */}
      <div className="w-full h-48 bg-gray-200"></div>

      {/* Content area */}
      <div className="p-4">
        {/* Title placeholder */}
        <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-2"></div>

        {/* Description placeholder */}
        <div className="h-4 bg-gray-200 rounded-md w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded-md w-5/6 mb-4"></div>

        {/* Progress bar placeholder */}
        <div className="h-2 bg-gray-200 rounded-full w-full mb-2"></div>

        {/* Stats placeholder */}
        <div className="flex justify-between items-center mt-4">
          <div className="h-5 bg-gray-200 rounded-md w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded-md w-1/3"></div>
        </div>

        {/* User info placeholder */}
        <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="ml-2">
            <div className="h-4 bg-gray-200 rounded-md w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CampaignItemListSkeleton.jsx
const CampaignItemListSkeleton = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse flex">
      {/* Image placeholder */}
      <div className="w-1/4 h-40 bg-gray-200"></div>

      {/* Content area */}
      <div className="p-4 flex-1">
        <div className="flex justify-between">
          {/* Title placeholder */}
          <div className="h-6 bg-gray-200 rounded-md w-1/2 mb-2"></div>

          {/* Status placeholder */}
          <div className="h-6 bg-gray-200 rounded-md w-24"></div>
        </div>

        {/* Description placeholder */}
        <div className="h-4 bg-gray-200 rounded-md w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded-md w-5/6 mb-4"></div>

        <div className="flex justify-between items-end">
          <div className="w-3/5">
            {/* Progress bar placeholder */}
            <div className="h-2 bg-gray-200 rounded-full w-full mb-2"></div>

            {/* Stats placeholder */}
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded-md w-24"></div>
              <div className="h-4 bg-gray-200 rounded-md w-24"></div>
            </div>
          </div>

          {/* User info placeholder */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="ml-2">
              <div className="h-4 bg-gray-200 rounded-md w-24"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CampaignItemGridSkeleton, CampaignItemListSkeleton };
