import { Table, Tag, Space, Button, Popconfirm, message } from "antd";
import * as AdminService from "../../../services/AdminService";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function RoleTable() {
  const { t } = useTranslation();
  const [loadingAction, setLoadingAction] = useState(false);
  const fetchRoles = async () => {
    const res = await AdminService.getAllRoles();
    return res?.result;
  };

  const {
    data: roles,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    placeholderData: keepPreviousData,
  });

  const handleDeleteRole = async (role) => {
    setLoadingAction(true);
    try {
      const res = await AdminService.deleteRole({ role });
      if (res) {
        refetch();
      }
    } finally {
      setLoadingAction(false);
    }
  };

  // Define table columns
  const TABLE_ROLES = [
    {
      title: t("Name"),
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: t("Description"),
      dataIndex: "description",
      key: "description",
    },

    {
      title: t("Actions"),
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title={t("Are you sure you want to delete this role?")}
            okText={t("Yes")}
            cancelText={t("No")}
            onConfirm={() => handleDeleteRole(record?.name)}
          >
            <Button size="small" type="text" danger>
              {t("Delete")}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table
          columns={TABLE_ROLES}
          dataSource={roles}
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
}
