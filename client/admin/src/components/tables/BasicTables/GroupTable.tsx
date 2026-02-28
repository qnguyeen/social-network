import {
  Space,
  Table,
  TablePaginationConfig,
  Input,
  Button,
  Modal,
  Form,
  Select,
  Tooltip,
  message,
} from "antd";
import { useState, useRef } from "react";
import * as AdminService from "@/services/AdminService";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { useTranslation } from "react-i18next";

export default function GroupTable() {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form] = Form.useForm();

  const handleRefresh = () => {
    // Clear all filters and search states
    setSearchText("");
    setSearchedColumn("");

    // Reset pagination to first page
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));

    // Refetch data
    refetch();
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    setSearchText("");
    setSearchedColumn("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            {t("Search")}
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            {t("Reset")}
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            {t("Filter")}
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            {t("Close")}
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const TABLE_GROUPS = [
    {
      title: t("Name"),
      dataIndex: "name",
      key: "name",
      width: 100,
      ...getColumnSearchProps("name"),
    },
    {
      title: t("Description"),
      dataIndex: "description",
      key: "description",
      width: 100,
      ...getColumnSearchProps("description"),
      render: (a, b) =>
        b?.description?.trim() ? (
          <span>{b.description}</span>
        ) : (
          <i>{t("No description")}</i>
        ),
    },
    {
      title: t("Member Count"),
      dataIndex: "memberCount",
      key: "memberCount",
      width: 100,
      sorter: (a, b) => a.memberCount - b.memberCount,
    },
    {
      title: t("Visibility"),
      dataIndex: "visibility",
      key: "visibility",
      width: 100,
      filters: [
        { text: t("Public"), value: "PUBLIC" },
        { text: t("Private"), value: "PRIVATE" },
      ],
      onFilter: (value, record) => record.visibility === value,
    },
  ];

  const fetchGroups = async () => {
    const page = pagination.current - 1;
    const size = pagination.pageSize;

    const params = { page, size };

    const res = await AdminService.getAllGroups(params);

    setPagination((prev) => ({
      ...prev,
      total: res?.result?.totalElements || 0,
    }));

    return res?.result;
  };

  const {
    data: groups,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["groups", pagination.current, pagination.pageSize],
    queryFn: fetchGroups,
    placeholderData: keepPreviousData,
  });

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    }));
  };

  const showCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCancel = () => {
    setIsCreateModalOpen(false);
    form.resetFields();
  };

  const handleCreateGroup = async (values) => {
    try {
      setIsCreating(true);
      const res = await AdminService.createGroup({ data: values });
      if (res?.code === 200) {
        message.success(t("Group created successfully"));
        setIsCreateModalOpen(false);
        form.resetFields();
        refetch();
      }
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Validation functions
  const validateGroupName = (_, value) => {
    if (!value) {
      return Promise.reject(new Error(t("Please enter group name")));
    }

    if (value.trim() === "") {
      return Promise.reject(
        new Error(t("Group name cannot be just whitespace"))
      );
    }

    if (value.length < 3) {
      return Promise.reject(
        new Error(t("Group name must be at least 3 characters"))
      );
    }

    if (value.length > 50) {
      return Promise.reject(
        new Error(t("Group name cannot exceed 50 characters"))
      );
    }

    return Promise.resolve();
  };

  const validateDescription = (_, value) => {
    if (!value) {
      return Promise.reject(new Error(t("Please enter group description")));
    }

    if (value.trim() === "") {
      return Promise.reject(
        new Error(t("Description cannot be just whitespace"))
      );
    }

    if (value.length > 500) {
      return Promise.reject(
        new Error(t("Description cannot exceed 500 characters"))
      );
    }

    return Promise.resolve();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex items-start justify-end">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          {t("Create Group")}
        </Button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table
          bordered
          columns={TABLE_GROUPS}
          dataSource={groups?.content}
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          onChange={handleTableChange}
          rowKey="id"
        />
      </div>

      <Modal
        title={t("Create New Group")}
        open={isCreateModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateGroup}
          validateTrigger={["onChange", "onBlur"]}
        >
          <Form.Item
            name="name"
            label={t("Group Name")}
            tooltip={t(
              "Group name must be 3-50 characters and can only contain letters, numbers, spaces, hyphens, and underscores"
            )}
            rules={[{ validator: validateGroupName }]}
            hasFeedback
          >
            <Input
              placeholder={t("Enter group name")}
              maxLength={50}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={t("Description")}
            tooltip={t("Description must not exceed 500 characters")}
            rules={[{ validator: validateDescription }]}
            hasFeedback
          >
            <Input.TextArea
              placeholder={t("Enter group description")}
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="visibility"
            label={t("Visibility")}
            rules={[{ required: true, message: t("Please select visibility") }]}
            hasFeedback
          >
            <Select placeholder={t("Select visibility")}>
              <Select.Option value="PUBLIC">{t("Public")}</Select.Option>
              <Select.Option value="PRIVATE">{t("Private")}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="text-right">
            <Space>
              <Button onClick={handleCancel} disabled={isCreating}>
                {t("Cancel")}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreating}
                disabled={isCreating}
              >
                {t("Create")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
