import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaClock, FaUser, FaCalendarAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import CampaignDetailModal from "~/components/CampaignDetail";
import ConfirmDialog from "~/components/ConfirmDialog";
import SelectAmount from "~/components/SelectAmount";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as FundraisingService from "~/services/FundraisingService";
import * as CampaignService from "~/services/CampaignService";
import ManageVolunteer from "~/components/ManageVolunteer";
import RegisterVolunteer from "~/components/RegisterVolunteer";
import useGetDetailUserById from "~/hooks/useGetDetailUserById";
import { BlankAvatar } from "~/assets";

const CampaignItemGrid = ({ campaign, onSuccessClose }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [openDetailCampaign, setOpenDetailCampaign] = useState(false);
  const handleCloseDetailCampaign = () => setOpenDetailCampaign(false);
  const user = useSelector((state) => state?.user);
  const [openConfirmClose, setOpenConfirmClose] = useState(false);
  const handleCloseConfirmClose = () => setOpenConfirmClose(false);
  const [isLoadingClose, setIsLoadingClose] = useState(false);
  const [openManageVolunteer, setOpenManageVolunteer] = useState(false);
  const handleCloseManageVolunteer = () => setOpenManageVolunteer(false);
  const [openRegister, setOpenRegister] = useState(false);
  const handleCloseRegister = () => setOpenRegister(false);
  const { user: userDetails, loading: isLoadingGetDetailUser } =
    useGetDetailUserById({
      id: campaign?.receiver_id,
    });
  const isOwner = user?.id === userDetails?.id;

  const handleClose = () => setOpen(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const mutation = useMutationHook((data) =>
    FundraisingService.createDonate(data)
  );

  const { data, isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      if (data?.code === 1000 && data?.result?.payment?.vnp_url) {
        window.location.href = data.result.payment.vnp_url;
      }
    }
  }, [isSuccess]);

  const handleDonate = (amount) => {
    const data = {
      campaign_id: campaign?.id,
      amount,
    };
    mutation.mutate(data);
  };

  const handleCloseCampaign = async () => {
    setIsLoadingClose(true);
    try {
      const res = await CampaignService.closeCampaign({
        campaignId: campaign?.id,
      });
      if (res?.code === 200) onSuccessClose();
    } finally {
      setIsLoadingClose(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isCampaignActive =
    campaign?.status !== "FINISHED" && campaign?.status !== "CLOSED";

  return (
    <>
      <CampaignDetailModal
        open={openDetailCampaign}
        onClose={handleCloseDetailCampaign}
        campaignId={campaign?.id}
      />
      <ConfirmDialog
        open={openConfirmClose}
        onClose={handleCloseConfirmClose}
        onConfirm={handleCloseCampaign}
        loading={isLoadingClose}
        title={t("Bạn có chắc không")}
        description={t("Chiến dịch sau sẽ bị đóng hoàn toàn")}
        confirmText={t("Close")}
        variant="danger"
        className="w-[330px]"
      />
      <ManageVolunteer
        open={openManageVolunteer}
        handleClose={handleCloseManageVolunteer}
        campaign={campaign}
      />
      <RegisterVolunteer
        open={openRegister}
        handleClose={handleCloseRegister}
        campaignId={campaign?.id}
      />
      <div
        key={campaign.id}
        className="rounded-xl overflow-hidden bg-primary border-1 border-borderNewFeed shadow-sm hover:shadow-md transition-shadow"
      >
        {/* Campaign Image */}
        <div className="relative h-40 bg-gray-100">
          {campaign.image_url && campaign.image_url.length > 0 ? (
            <img
              src={campaign.image_url[0]}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="/donate_blank.png"
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          )}

          {/* User badge */}
          <div className="absolute top-3 right-3 bg-white text-gray-700 text-xs py-1 px-3 rounded-full shadow-sm flex items-center">
            {isLoadingGetDetailUser ? (
              <>
                <div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse mr-1"></div>
                <div className="w-16 h-3 bg-gray-200 animate-pulse rounded"></div>
              </>
            ) : userDetails?.imageUrl ? (
              <>
                <img
                  src={userDetails?.imageUrl || "/blank-avatar.png"}
                  alt="User"
                  className="w-4 h-4 rounded-full mr-1"
                />
                <span className="truncate max-w-[80px]">
                  {userDetails?.username || t("Unknown")}
                </span>
              </>
            ) : (
              <>
                <FaUser className="w-3 h-3 mr-1" />
                <span className="truncate max-w-[80px]">
                  {userDetails?.username || t("Unknown")}
                </span>
              </>
            )}
          </div>

          {/* Status badges */}
          <div className="absolute bottom-3 left-3 text-xs py-1 px-3 rounded-full font-medium">
            {campaign.status === "FINISHED" && (
              <span className="bg-red-50 text-red-600 py-1 px-3 rounded-full">
                {t("Finished")}
              </span>
            )}
            {campaign.goalReached && (
              <span className="bg-green-50 text-green-600 py-1 px-3 rounded-full ml-2">
                🎯 {t("Goal Reached")}
              </span>
            )}
            {campaign.featured && (
              <span className="bg-yellow-50 text-yellow-600 py-1 px-3 rounded-full ml-2">
                ⭐ {t("Featured")}
              </span>
            )}
          </div>
        </div>

        {/* Campaign Info */}
        <div className="p-5">
          <h3 className="font-medium text-ascent-1 text-lg line-clamp-2 ">
            {campaign.title}
          </h3>
          <p className="text-ascent-2 text-sm mb-3 line-clamp-2">
            {campaign.description}
          </p>

          {/* Progress bar */}
          <div className="relative w-full h-2 bg-gray-100 rounded-full mb-3">
            <div
              className={`h-2 rounded-full ${
                campaign.progress >= 100
                  ? "bg-green-500"
                  : campaign.progress >= 50
                  ? "bg-indigo-500"
                  : "bg-orange-400"
              }`}
              style={{
                width: `${Math.min(campaign.progress, 100)}%`,
              }}
            ></div>
          </div>

          {/* Progress percentage */}
          <div className="flex justify-between items-center mb-4 text-sm">
            <span className="font-medium text-gray-700">
              {campaign.progress}% {t("Funded")}
            </span>
            <span
              className={`text-sm font-medium ${
                campaign.status === "FINISHED"
                  ? "text-red-600"
                  : campaign.status === "ACTIVE"
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {t(campaign.status)}
            </span>
          </div>

          {/* Financial summary */}
          <div className="w-full flex flex-col mb-4 items-center">
            <div className="grid w-full grid-cols-2 mb-4 gap-2 ">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500">{t("Raised")}</div>
                <div className="text-gray-800 font-medium">
                  {formatCurrency(campaign.current_amount)}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500">{t("Goal")}</div>
                <div className="text-gray-800 font-medium">
                  {formatCurrency(campaign.target_amount)}
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-2">
              <div className="bg-gray-50 w-full p-3 rounded-lg flex items-center">
                <div className="mr-3 text-indigo-500">
                  <FaClock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {t("Time Slots")}
                  </div>
                  <div className="text-xs text-gray-600">
                    {campaign.time_slots.join(", ") || "None"}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 w-full p-3 rounded-lg flex items-center">
                <div className="mr-3 text-indigo-500">
                  <FaCalendarAlt className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {t("Campaign Info")}
                  </div>
                  <div className="text-xs text-gray-600">
                    {t("Created")}: {formatDate(campaign.created_date)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {campaign.daysActive > 0
                      ? `${t("Active for")}: ${campaign.daysActive} ${t(
                          "days"
                        )}`
                      : ""}
                    {campaign.daysLeft > 0
                      ? ` • ${t("Days left")}: ${campaign.daysLeft}`
                      : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="w-full flex flex-col items-center justify-center gap-y-2">
            <button
              onClick={() => setOpenDetailCampaign(true)}
              className="w-full py-2 px-4 bg-primary border-1 border-borderNewFeed text-ascent-1 rounded-lg text-sm font-medium transition-colors"
            >
              {t("View detail")}
            </button>

            {isOwner ? (
              <button
                onClick={() => setOpenManageVolunteer(true)}
                className={`w-full py-2 px-4 bg-primary border-1 border-borderNewFeed text-ascent-1 rounded-lg text-sm font-medium transition-colors ${
                  !isCampaignActive ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!isCampaignActive || mutation.isLoading}
              >
                {t("Manage volunteer")}
              </button>
            ) : (
              <button
                onClick={() => setOpenRegister(true)}
                className={`w-full py-2 px-4 border-1 border-borderNewFeed text-blue-600 bg-blue-50 rounded-lg text-sm font-medium transition-colors ${
                  !isCampaignActive ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!isCampaignActive || mutation.isLoading}
              >
                {t("Register")}
              </button>
            )}

            <div className="flex w-full gap-x-2">
              {isOwner && isCampaignActive && (
                <button
                  onClick={() => setOpenConfirmClose(true)}
                  className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium border-1 border-borderNewFeed transition-colors"
                >
                  {t("Close Campaign")}
                </button>
              )}

              <button
                onClick={() => setOpen(true)}
                className={`w-full py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium border-1 border-borderNewFeed transition-colors ${
                  !isCampaignActive ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!isCampaignActive || mutation.isLoading}
              >
                {mutation.isLoading ? t("Processing...") : t("Donate")}
              </button>
            </div>
          </div>

          {/* User Profile Info */}
          {isLoadingGetDetailUser ? (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2">
                {t("Campaign By")}:
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse mr-2"></div>
                <div className="flex-1">
                  <div className="w-24 h-4 bg-gray-200 animate-pulse rounded mb-1"></div>
                  <div className="w-16 h-3 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="ml-auto w-16 h-6 bg-gray-200 animate-pulse rounded-full"></div>
              </div>
            </div>
          ) : userDetails ? (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2">
                {t("Campaign By")}:
              </div>
              <div className="flex items-center">
                <img
                  src={userDetails.imageUrl || BlankAvatar}
                  alt={userDetails.username}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div>
                  <div className="text-sm font-medium">
                    {`${userDetails.firstName} ${userDetails.lastName}` ??
                      "No name"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {userDetails.username}
                  </div>
                </div>
                <div
                  className={`ml-auto px-2 py-1 rounded-full text-xs ${
                    userDetails.status === "ONLINE"
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-50 text-gray-600"
                  }`}
                >
                  {t(userDetails.status)}
                </div>
              </div>
            </div>
          ) : null}

          {/* Donation Modal */}
          <SelectAmount
            campaign={campaign}
            isOpen={open}
            onClose={handleClose}
            onDonate={handleDonate}
          />
        </div>
      </div>
    </>
  );
};

export default CampaignItemGrid;
