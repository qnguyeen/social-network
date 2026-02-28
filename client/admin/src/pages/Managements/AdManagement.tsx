// AdManagement.jsx
import { useState, useRef } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "../../utils";
import AdsTable from "@/components/tables/BasicTables/AdsTable";
import { Button, Modal, Form, Input, InputNumber, Select, message } from "antd";
import { PlusOutlined, CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import * as AdService from "@/services/AdService";
import * as AdminService from "@/services/AdminService"; // Added missing import
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function AdManagement() {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const tableRef = useRef();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createdAdId, setCreatedAdId] = useState(null);
  const [isAdCreated, setIsAdCreated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const {
    data: postsResponse,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ["posts", currentPage, pageSize],
    queryFn: async () => {
      const res = await AdminService.getAllPosts({
        page: currentPage,
        size: pageSize,
      });
      return res;
    },
    onError: (error) => {
      message.error(t("Failed to load posts data"));
      console.error("Error loading posts:", error);
    },
  });

  const handleCreateAd = async (values) => {
    try {
      setIsSubmitting(true);
      const res = await AdService.createAdByAdmin({ data: values });
      if (res?.code === 200) {
        message.success(t("Ad created successfully!"));
        setCreatedAdId(res.result.id);
        setIsAdCreated(true);
        if (tableRef.current && tableRef.current.refreshTable) {
          tableRef.current.refreshTable();
        } else {
          // Fallback to refetching posts if table ref method is unavailable
          refetchPosts();
        }
      } else {
        message.error(t("Failed to create ad") + `: ${res?.message || ""}`);
      }
    } catch (error) {
      message.error(t("An error occurred while creating the ad"));
      console.error("Error creating ad:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyAdId = () => {
    if (createdAdId) {
      navigator.clipboard
        .writeText(createdAdId)
        .then(() => message.success(t("Ad ID copied to clipboard!")))
        .catch(() => message.error(t("Failed to copy to clipboard")));
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalVisible(false);
    setCreatedAdId(null);
    setIsAdCreated(false);
    form.resetFields();
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <>
      <PageMeta title={`${t("Ads Management")} - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle={t("Ads")} />

      <div className="space-y-6">
        <ComponentCard
          title={t("Ads Campaign Table")}
          btn={
            <div className="flex gap-x-2">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalVisible(true)}
              >
                {t("Create Main Ads Campaign")}
              </Button>
            </div>
          }
        >
          {postsError ? (
            <div className="text-red-500 p-4">
              {t("Error loading data. Please try again.")}
            </div>
          ) : (
            <AdsTable
              ref={tableRef}
              loading={isLoadingPosts}
              onChange={handleTableChange}
              data={postsResponse?.result?.records || []}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: postsResponse?.result?.total || 0,
              }}
            />
          )}
        </ComponentCard>
      </div>

      {/* Create Ad Modal */}
      <Modal
        title={t("Create Main Ads Campaign")}
        open={isCreateModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        maskClosable={!isSubmitting}
        closable={!isSubmitting}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAd}
          initialValues={{
            durations: [1],
          }}
        >
          <Form.Item
            name="title"
            label={t("Title")}
            rules={[
              { required: true, message: t("Please enter ad title") },
              { max: 100, message: t("Title cannot exceed 100 characters") },
            ]}
          >
            <Input placeholder="Ads title" disabled={isSubmitting} />
          </Form.Item>

          <Form.Item
            name="targetAmount"
            label={t("Target Amount")}
            rules={[
              { required: true, message: t("Please enter target amount") },
              {
                type: "number",
                min: 1,
                message: t("Amount must be at least 1"),
              },
            ]}
          >
            <InputNumber
              min={1}
              placeholder="20000"
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              disabled={isSubmitting}
            />
          </Form.Item>

          <Form.Item
            name="durations"
            label={t("Durations (days)")}
            rules={[
              {
                required: true,
                message: t("Please select at least one duration"),
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder={t("Select durations")}
              disabled={isSubmitting}
              options={[
                { value: 1, label: t("1 day") },
                { value: 2, label: `2 ${t("days")}` },
                { value: 3, label: `3 ${t("days")}` },
                { value: 7, label: `7 ${t("days")}` },
              ]}
            />
          </Form.Item>

          {isAdCreated && createdAdId && (
            <Form.Item label={t("Ads ID")}>
              <Input.Group compact>
                <Input
                  style={{ width: "calc(100% - 32px)" }}
                  readOnly
                  value={createdAdId}
                />
                <Button icon={<CopyOutlined />} onClick={handleCopyAdId} />
              </Input.Group>
            </Form.Item>
          )}

          <Form.Item className="flex justify-end mb-0">
            <Button
              type="default"
              className="mr-2"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              {isAdCreated ? t("Close") : t("Cancel")}
            </Button>
            {!isAdCreated && (
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {t("Create")}
              </Button>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
