import { useQuery } from "@tanstack/react-query";
import * as CampaignService from "~/services/CampaignService";
import { FaChartLine, FaExternalLinkAlt } from "react-icons/fa";
import TopCampaignCardItem from "~/components/TopCampaignsCard/TopCampaignCardItem";
import { useTranslation } from "react-i18next";

const TopCampaignsCard = () => {
  const { t } = useTranslation();
  const {
    data: topCampaigns,
    isLoading,
    refetch: refetchTopCampaigns,
  } = useQuery({
    queryKey: ["topCampaigns"],
    queryFn: async () => {
      const res = await CampaignService.getTopCampaigns();
      return res?.result || [];
    },
  });

  // Formatting helper for currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="bg-primary rounded-2xl shadow-sm p-4 w-full">
        <div className="flex items-center mb-4">
          <div className="bg-primary p-2 rounded-2xl mr-3">
            <FaChartLine className="text-ascent-3" />
          </div>
          <h3 className="text-lg font-semibold text-ascent-1">
            {t("Top Campaigns")}
          </h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-primary rounded-2xl shadow p-4 w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-bgSearch p-2 rounded-lg mr-3">
              <FaChartLine className="text-ascent-1" />
            </div>
            <h3 className="text-lg font-semibold text-ascent-1">
              {t("Top Campaigns")}
            </h3>
          </div>
        </div>

        {topCampaigns.length > 0 ? (
          <div className="space-y-4">
            {topCampaigns.map((campaign) => (
              <TopCampaignCardItem campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-ascent-2">
            {t("No top campaigns available")}
          </div>
        )}
      </div>
    </>
  );
};

export default TopCampaignsCard;
