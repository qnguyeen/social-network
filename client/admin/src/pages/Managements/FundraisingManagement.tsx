import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "../../utils";
import useExportToExcel from "../../hooks/useExportToExcel";
import { Search, FileDown } from "lucide-react";
import { useState, useRef } from "react";
import * as AdminService from "@/services/AdminService";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  InputRef,
  message,
  Popconfirm,
  Space,
  TablePaginationConfig,
  Tooltip,
  Button,
  Input,
  Image,
} from "antd";
import moment from "moment";
import FundraisingTable from "@/components/tables/BasicTables/FundraisingTable";
import { useTranslation } from "react-i18next";

export default function FundraisingManagement() {
  const exportToExcel = useExportToExcel();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { t } = useTranslation();
  const searchInput = useRef<InputRef>(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [globalSearchText, setGlobalSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedUserId(null);
  };

  const handleGlobalSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setGlobalSearchText(value);

    if (value) {
      const filtered = campaigns?.filter((campaign) => {
        return (
          campaign.title?.toLowerCase().includes(value) ||
          campaign.description?.toLowerCase().includes(value) ||
          campaign.status?.toLowerCase().includes(value) ||
          campaign.receiver_id?.toString()?.toLowerCase().includes(value) ||
          campaign.current_amount?.toString()?.toLowerCase().includes(value) ||
          campaign.target_amount?.toString()?.toLowerCase().includes(value) ||
          (campaign.time_slots &&
            campaign.time_slots.some((slot) =>
              slot.toLowerCase().includes(value)
            )) ||
          (campaign.created_date &&
            moment(campaign.created_date).format("YYYY-MM-DD").includes(value))
        );
      });
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  };

  const handleExportToExcel = () => {
    if (!campaigns || campaigns.length === 0) {
      message.error("No data to export");
      return;
    }

    const dataToExport = campaigns.map((campaign) => ({
      Title: campaign.title,
      Description: campaign.description,
      "Current Amount": campaign.current_amount,
      "Target Amount": campaign.target_amount,
      "Time Slots": campaign.time_slots ? campaign.time_slots.join(", ") : "",
      Status: campaign.status,
      "Created Date": moment(campaign.created_date).format("YYYY-MM-DD"),
      Receiver: campaign.receiver_id,
    }));

    exportToExcel(dataToExport, "Fundraising_Campaigns");
    message.success("Data exported successfully");
  };

  const handleCloseCampaign = async (campaignId) => {
    try {
      await AdminService.closeCampaign({ id: campaignId });
      message.success("Campaign closed successfully");
      refetch();
    } catch (error) {
      message.error("Failed to close campaign");
      console.error("Error closing campaign:", error);
    }
  };

  const fetchCampaigns = async () => {
    const res = await AdminService.getAllCampaign();
    return res?.result;
  };

  const {
    data: campaigns,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
    placeholderData: keepPreviousData,
  });

  const TABLE_CAMPAIGNS = [
    {
      title: t("Receiver"),
      dataIndex: "receiver_id",
      key: "receiver_id",
    },
    {
      title: t("Title"),
      dataIndex: "title",
      key: "title",
    },
    {
      title: t("Post Images"),
      dataIndex: "image_url",
      key: "image_url",
      render: (imageUrls, record) => {
        return imageUrls && imageUrls.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto">
            {imageUrls.slice(0, 3).map((url, index) => (
              <Image
                key={index}
                src={url}
                alt={`post-image-${index}`}
                width={80}
                height={80}
                className="object-cover"
              />
            ))}
            {imageUrls.length > 3 && (
              <div className="flex items-center justify-center bg-gray-100 w-10 h-10 rounded text-gray-500">
                +{imageUrls.length - 3}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-zinc-400">{t("No images")}</span>
        );
      },
    },
    {
      title: t("Description"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("Current Amount"),
      dataIndex: "current_amount",
      key: "current_amount",
      render: (amount) =>
        amount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: t("Target Amount"),
      dataIndex: "target_amount",
      key: "target_amount",
      render: (amount) =>
        amount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: t("Time Slots"),
      dataIndex: "time_slots",
      key: "time_slots",
    },
    {
      title: t("Status"),
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          className={`${
            status === "active" || status === "UNFINISHED"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: t("Created Date"),
      dataIndex: "created_date",
      key: "created_date",
      render: (text) => new Date(text).toLocaleString(),
    },
  ];

  const displayData = globalSearchText ? filteredData : campaigns;

  return (
    <>
      <PageMeta title={`${t("Fundraising Management")} - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle={t("Fundraising")} />

      <div className="space-y-6">
        <ComponentCard title={t("Fundraising Table")}>
          <FundraisingTable
            loading={isLoading}
            data={displayData}
            columns={TABLE_CAMPAIGNS}
            isUpdateModalOpen={isUpdateModalOpen}
            handleCloseUpdateModal={handleCloseUpdateModal}
            selectedUserId={selectedUserId}
            handleTableChange={(pagination) => setPagination(pagination)}
            handleCloseCampaign={handleCloseCampaign}
          />
        </ComponentCard>
      </div>
    </>
  );
}
