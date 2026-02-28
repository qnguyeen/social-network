import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "../../utils";
import UserTable from "../../components/tables/BasicTables/UserTable";
import useExportToExcel from "../../hooks/useExportToExcel";
import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import * as AdminService from "@/services/AdminService";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  InputRef,
  message,
  Popconfirm,
  Space,
  TablePaginationConfig,
  Tooltip,
  Modal,
  Form,
  Input,
  Table,
} from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";
import { SearchOutlined } from "@ant-design/icons";
import type { TableColumnsType, TableColumnType } from "antd";
import { Button } from "antd";
import Highlighter from "react-highlight-words";
import moment from "moment-timezone";
import { BlankAvatar } from "@/assets";
import CreateUser from "@/components/modal/CreateUser";
import { useDispatch, useSelector } from "react-redux";
import { setIsReloadUserList } from "@/redux/Slices/userSlice";
import { useTranslation } from "react-i18next";

interface DataType {
  id: string;
  firstName: string;
  lastName: string;
  fullname: string;
  username: string;
  email: string;
  status: string;
  phoneNumber: string;
  roles: { name: string }[];
  createdAt: string;
  emailVerified: boolean;
  isLocked: boolean;
  [key: string]: any;
}

interface LoginHistoryType {
  id: number;
  loginTime: string;
  deviceInfo: {
    deviceId: string;
    deviceType: string;
    ipAddress: string;
  };
}

interface LoginHistoryResponse {
  code: number;
  message: string;
  result: {
    currentPage: number;
    pageSize: number;
    totalPage: number;
    totalElement: number;
    data: LoginHistoryType[];
  };
}

export default function UserManagement() {
  const { t } = useTranslation();
  const exportToExcel = useExportToExcel();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [globalSearchText, setGlobalSearchText] = useState("");
  const [filteredData, setFilteredData] = useState<DataType[]>([]);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [changePasswordForm] = Form.useForm();
  const isReloadUserList = useSelector(
    (state) => state?.user?.isReloadUserList
  );

  // Login history states
  const [isLoginHistoryModalOpen, setIsLoginHistoryModalOpen] = useState(false);
  const [loginHistoryData, setLoginHistoryData] = useState<LoginHistoryType[]>(
    []
  );
  const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);
  const [loginHistoryPagination, setLoginHistoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedUserForHistory, setSelectedUserForHistory] = useState(null);

  const [loadingAction, setLoadingAction] = useState(false);
  const handleCloseCreateUserModal = () => setIsCreateUserModalOpen(false);

  const handleUpdateUser = (data) => () => {
    setSelectedUserId(data);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedUserId(null);
  };

  // Handle Change Password Modal
  const handleOpenChangePasswordModal = (userId) => {
    setSelectedUserId(userId);
    setIsChangePasswordModalOpen(true);
  };

  const handleCloseChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
    changePasswordForm.resetFields();
    setSelectedUserId(null);
  };

  // Handle Login History Modal
  const handleOpenLoginHistoryModal = async (userId) => {
    setSelectedUserForHistory(userId);
    setIsLoginHistoryModalOpen(true);
    await fetchLoginHistory(userId);
  };

  const handleCloseLoginHistoryModal = () => {
    setIsLoginHistoryModalOpen(false);
    setLoginHistoryData([]);
    setSelectedUserForHistory(null);
  };

  const fetchLoginHistory = async (userId, page = 1, size = 10) => {
    setLoginHistoryLoading(true);
    try {
      // Replace this with your actual API call
      const response = await AdminService.getLoginHistoryOfUser({
        id: userId,
        page: page,
        size: size,
      });

      if (response?.result) {
        setLoginHistoryData(response.result.data || []);
        setLoginHistoryPagination({
          current: response.result.currentPage,
          pageSize: response.result.pageSize,
          total: response.result.totalElement,
        });
      }
    } catch (error) {
      console.error("Error fetching login history:", error);
      message.error("Failed to fetch login history");
    } finally {
      setLoginHistoryLoading(false);
    }
  };

  const handleLoginHistoryTableChange = (
    newPagination: TablePaginationConfig
  ) => {
    const { current, pageSize } = newPagination;
    setLoginHistoryPagination((prev) => ({
      ...prev,
      current: current || 1,
      pageSize: pageSize || 10,
    }));

    if (selectedUserForHistory) {
      fetchLoginHistory(selectedUserForHistory, current, pageSize);
    }
  };

  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    setLoadingAction(true);
    try {
      const data = {
        userId: selectedUserId,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      };

      console.log(data);
      const res = await AdminService.changePasswordForUser(data);
      if (res) {
        message.info({ content: res?.message });
        handleCloseChangePasswordModal();
      }
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Lock/Unlock User
  const handleLockUser = async (userId) => {
    setLoadingAction(true);
    try {
      const res = await AdminService.lockUser({ userId });
      if (res?.code === 200) {
        message.success({ content: t("Khóa người dùng thành công") });
        refetch();
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUnlockUser = async (userId) => {
    setLoadingAction(true);
    try {
      const res = await AdminService.unlockUser({ userId });
      if (res) {
        message.success({ content: t("Mở khóa người dùng thành công") });
        // refetch();
      }
    } finally {
      setLoadingAction(false);
    }
  };

  type DataIndex = keyof DataType;

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): TableColumnType<DataType> => ({
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
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            {t("Tìm kiếm")}
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            {t("Đặt lại")}
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            {t("Lọc")}
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            {t("Đóng")}
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      const recordValue = record[dataIndex];
      return recordValue !== undefined && recordValue !== null
        ? recordValue
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase())
        : false;
    },
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
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

  const handleDeleteUser = async (id: string) => {
    const res = await AdminService.deleteUser(id);
    if (res?.code === 200) {
      message.success({ content: res?.message });
      refetch();
    } else if (res?.code === 500) {
      message.error({ content: res?.message });
    }
  };

  const TABLE_USERS: TableColumnsType<DataType> = [
    {
      title: t("User Id"),
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("Ảnh đại diện"),
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (_, record) => (
        <img
          src={record?.imageUrl || BlankAvatar}
          alt="avatar"
          className="w-10 h-10 rounded-full bg-no-repeat"
        />
      ),
    },
    {
      title: t("Tên người dùng"),
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email"),
      render: (_, record) => (
        <span className={`text-xs ${!record?.email && "text-zinc-400"}`}>
          {record?.email || "No email"}
        </span>
      ),
    },
    {
      title: t("Trạng thái"),
      dataIndex: "status",
      key: "status",
      render: (_, record) => (
        <span
          className={`${
            record?.status === "ONLINE" ? "text-green-700" : "text-zinc-400"
          } text-xs`}
        >
          {record?.status}
        </span>
      ),
    },
    {
      title: t("Quyền"),
      dataIndex: "roles",
      render: (_, record) => (
        <span
          className={`${
            record.roles?.[0]?.name === "ADMIN"
              ? "text-red-600"
              : "text-blue-600"
          } font-semibold`}
        >
          {record.roles?.[0]?.name}
        </span>
      ),
      key: "roles",
    },
    {
      title: t("Ngày tạo"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_, record) =>
        moment(record?.createdAt)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: t("Hành động"),
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle" className="flex flex-wrap">
          {/* <button onClick={handleUpdateUser(record)} className="text-blue-800">
            Update
          </button> */}

          <button
            onClick={() => handleOpenChangePasswordModal(record.id)}
            className="text-purple-800"
          >
            {t("Thay đổi mật khẩu")}
          </button>

          <button
            onClick={() => handleOpenLoginHistoryModal(record.id)}
            className="text-teal-800"
          >
            {t("Lịch sử đăng nhập")}
          </button>

          {record?.roles[0]?.name === "USER" && (
            <>
              <Popconfirm
                placement="topLeft"
                title="Delete user"
                description="Are you sure to delete this user?"
                onConfirm={() => handleDeleteUser(record?.id)}
                onCancel={handleCloseUpdateModal}
                okText="Yes"
                cancelText="No"
              >
                <span className="text-red-800 cursor-pointer">{t("Xóa")}</span>
              </Popconfirm>
              <Popconfirm
                placement="topLeft"
                title={t("Unlock user")}
                description={t("Are you sure to unlock this user?")}
                onConfirm={() => handleUnlockUser(record.id)}
                okText={t("Yes")}
                cancelText={t("No")}
              >
                <span className="text-green-800 cursor-pointer">
                  {t("Mở khóa")}
                </span>
              </Popconfirm>
              <Popconfirm
                placement="topLeft"
                title={t("Lock user")}
                description={t("Are you sure to lock this user?")}
                onConfirm={() => handleLockUser(record.id)}
                okText={t("Yes")}
                cancelText={t("No")}
              >
                <span className="text-orange-800 cursor-pointer">
                  {t("Khóa")}
                </span>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
      width: 320,
    },
  ];

  // Define columns for login history table
  const LOGIN_HISTORY_COLUMNS: TableColumnsType<LoginHistoryType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("Login Time"),
      dataIndex: "loginTime",
      key: "loginTime",
      render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: t("Device ID"),
      dataIndex: ["deviceInfo", "deviceId"],
      key: "deviceId",
    },
    {
      title: t("Device Type"),
      dataIndex: ["deviceInfo", "deviceType"],
      key: "deviceType",
    },
    {
      title: t("IP Address"),
      dataIndex: ["deviceInfo", "ipAddress"],
      key: "ipAddress",
    },
  ];

  const fetchUsers = async () => {
    try {
      const page = pagination.current - 1;
      const size = pagination.pageSize;

      const res = await AdminService.getAllUsers({ page, size });

      if (res?.result?.totalElements !== undefined) {
        setPagination((prev) => ({
          ...prev,
          total: res.result.totalElements,
        }));
      }

      return res?.result;
    } catch (error) {
      return { content: [] };
    }
  };

  const {
    data: users,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["users", pagination.current, pagination.pageSize],
    queryFn: fetchUsers,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isReloadUserList) {
      refetch();
      dispatch(setIsReloadUserList(false));
    }
  }, [isReloadUserList]);

  // Apply global search filter
  useEffect(() => {
    if (users?.content && users.content.length > 0) {
      if (globalSearchText) {
        const filtered = users.content.filter((user) =>
          user.username.toLowerCase().includes(globalSearchText.toLowerCase())
        );
        setFilteredData(filtered);
      } else {
        setFilteredData(users.content);
      }
    } else {
      setFilteredData([]);
    }
  }, [globalSearchText, users?.content]);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    }));
  };

  const handleExportToExcel = () => {
    if (users?.content) {
      exportToExcel({
        data: users.content,
        fileName: "users-export",
        sheetName: "Users",
      });
    }
  };

  // Global search function
  const handleGlobalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalSearchText(e.target.value);
    // Reset to first page when searching
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const handleSuccessCreate = () => {
    refetch();
  };

  return (
    <>
      <PageMeta title={t(`User Management - ${APP_NAME}`)} />
      <PageBreadcrumb pageTitle={t("Người dùng")} />
      <CreateUser
        onSuccess={handleSuccessCreate}
        open={isCreateUserModalOpen}
        handleClose={handleCloseCreateUserModal}
      />

      {/* Change Password Modal */}
      <Modal
        title={t("Thay đổi mật khẩu người dùng")}
        open={isChangePasswordModalOpen}
        onCancel={handleCloseChangePasswordModal}
        footer={[
          <Button key="cancel" onClick={handleCloseChangePasswordModal}>
            {t("Hủy")}
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loadingAction}
            onClick={() => changePasswordForm.submit()}
          >
            {t("Thay đổi mật khẩu")}
          </Button>,
        ]}
      >
        <Form
          form={changePasswordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="newPassword"
            label={t("Mật khẩu mới")}
            rules={[
              {
                required: true,
                message: t("Mật khẩu là bắt buộc"),
              },
              {
                min: 8,
                message: t("Mật khẩu phải có ít nhất 8 ký tự"),
              },
              {
                max: 64,
                message: t("Mật khẩu không được vượt quá 64 ký tự"),
              },
              {
                pattern:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/,
                message: t(
                  "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt."
                ),
              },
              {
                validator(_, value) {
                  if (!value || !/\s/.test(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t("Mật khẩu không được chứa khoảng trắng"))
                  );
                },
              },
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={t("Xác nhận mật khẩu")}
            dependencies={["newPassword"]}
            rules={[
              {
                required: true,
                message: t("Vui lòng xác nhận mật khẩu"),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t("Mật khẩu xác nhận không khớp"))
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Login History Modal */}
      <Modal
        title="User Login History"
        open={isLoginHistoryModalOpen}
        onCancel={handleCloseLoginHistoryModal}
        width={800}
        footer={[
          <Button key="close" onClick={handleCloseLoginHistoryModal}>
            Close
          </Button>,
        ]}
      >
        <Table
          columns={LOGIN_HISTORY_COLUMNS}
          dataSource={loginHistoryData}
          rowKey="id"
          loading={loginHistoryLoading}
          pagination={{
            current: loginHistoryPagination.current,
            pageSize: loginHistoryPagination.pageSize,
            total: loginHistoryPagination.total,
            showSizeChanger: true,
          }}
          onChange={handleLoginHistoryTableChange}
        />
      </Modal>

      <div className="space-y-6">
        <ComponentCard
          title={t("Bảng người dùng")}
          btn={
            <>
              <div className="relative w-full sm:w-auto">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder={t("Tìm kiếm")}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white w-full sm:w-64"
                  value={globalSearchText}
                  onChange={handleGlobalSearch}
                />
              </div>
              <Button onClick={() => setIsCreateUserModalOpen(true)}>
                {t("Tạo người dùng")}
              </Button>
              <Tooltip title={t("Export this table")} placement="top">
                <Button
                  onClick={handleExportToExcel}
                  disabled={!users?.content?.length}
                >
                  {t("Xuất Excel")}
                </Button>
              </Tooltip>
            </>
          }
        >
          <UserTable
            pagination={pagination}
            handleUpdateUser={handleUpdateUser}
            handleTableChange={handleTableChange}
            loading={isLoading}
            data={globalSearchText ? filteredData : users?.content || []}
            columns={TABLE_USERS}
            isUpdateModalOpen={isUpdateModalOpen}
            handleCloseUpdateModal={handleCloseUpdateModal}
            selectedUserId={selectedUserId}
          />
        </ComponentCard>
      </div>
    </>
  );
}
