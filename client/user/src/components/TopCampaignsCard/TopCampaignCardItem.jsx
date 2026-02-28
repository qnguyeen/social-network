import React, { useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import CampaignDetailModal from "~/components/CampaignDetail";

const TopCampaignCardItem = ({ campaign }) => {
  const [openDetailCampaign, setOpenDetailCampaign] = useState(false);
  const handleCloseDetailCampaign = () => setOpenDetailCampaign(false);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };
  return (
    <>
      <CampaignDetailModal
        open={openDetailCampaign}
        onClose={handleCloseDetailCampaign}
        campaignId={campaign?.id}
      />
      <div className="border-b border-gray-100 pb-3 last:border-0">
        <span className="block hover:bg-gray-50 rounded p-2 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-56">
              <h4 className="font-medium truncate text-gray-800 mb-1 line-clamp-2">
                {campaign.title}
              </h4>
              <div className="flex items-center text-sm text-gray-500">
                <span className="font-medium text-indigo-600">
                  {formatCurrency(campaign.amount)}
                </span>
                <span className="mx-2">•</span>
                <span>{campaign.count} donors</span>
              </div>
            </div>
            <FaExternalLinkAlt
              onClick={() => setOpenDetailCampaign(true)}
              className="text-gray-400 cursor-pointer text-xs flex-shrink-0 mt-1"
            />
          </div>
        </span>
      </div>
    </>
  );
};

export default TopCampaignCardItem;
