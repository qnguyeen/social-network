import { Table, Tag, Button, Popconfirm, message } from "antd";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { DeleteOutlined, StopOutlined } from "@ant-design/icons";
import * as AdService from "@/services/AdService";
import { useTranslation } from "react-i18next";

const AdsTable = forwardRef(({ onDeleteAd }, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const [ads, setAds] = useState([]);
  const { t } = useTranslation();
  const [closingCampaignId, setClosingCampaignId] = useState(null);

  // Expose the fetchAds function to parent components through ref
  useImperativeHandle(ref, () => ({
    refreshTable: fetchAds,
  }));

  // Fetch ads data
  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const res = await AdService.getListAds();
      if (res?.code === 200) {
        setAds(res.result);
      }
    } catch (error) {
      console.error("Failed to fetch ads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "PENDING":
        return "orange";
      case "REJECTED":
        return "red";
      case "PAUSED":
        return "blue";
      case "CLOSED":
        return "gray";
      default:
        return "default";
    }
  };

  const handleCloseCampaign = async (id) => {
    setClosingCampaignId(id);
    try {
      const res = await AdService.closeAd({ id: id });
      if (res?.code === 200) {
        message.success(t("Ads campaign closed successfully!"));
        fetchAds();
      }
    } finally {
      setClosingCampaignId(null);
    }
  };

  const TABLE_COLUMNS = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: t("Title"),
      dataIndex: "title",
      key: "title",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: t("Description"),
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: t("Post ID"),
      dataIndex: "post_id",
      key: "post_id",
      width: 200,
      ellipsis: true,
    },
    {
      title: t("Status"),
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: t("Actions"),
      key: "actions",
      width: 150,
      render: (_, record) => (
        <div className="flex space-x-2">
          {record.status !== "CLOSED" && (
            <Popconfirm
              title={t("Are you sure you want to close this campaign?")}
              onConfirm={() => handleCloseCampaign(record.id)}
              okText={t("Yes")}
              cancelText={t("No")}
            >
              <Button
                icon={<StopOutlined />}
                type="primary"
                danger
                size="small"
                loading={closingCampaignId === record.id}
                disabled={closingCampaignId === record.id}
              >
                {t("Close")}
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table
          columns={TABLE_COLUMNS}
          dataSource={ads}
          loading={isLoading}
          rowKey="id"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
          }}
        />
      </div>
    </div>
  );
});

AdsTable.displayName = "AdsTable";

export default AdsTable;
