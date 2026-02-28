import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  Upload,
  Space,
  message,
  Image,
  Tooltip,
  Typography,
  Card,
  Carousel,
  Divider,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  UploadOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  LeftOutlined,
  RightOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import * as AdminService from "@/services/AdminService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const StoryTable = () => {
  // State for search and filters
  const [searchUsername, setSearchUsername] = useState("");
  const [searchContent, setSearchContent] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Other state variables remain the same
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sortField, setSortField] = useState("postedAt");
  const [sortOrder, setSortOrder] = useState("descend"); // default to newest first
  const { t } = useTranslation();
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Constants for validation
  const MAX_CONTENT_LENGTH = 1000; // Adjust as needed
  const MAX_IMAGE_SIZE_MB = 10; // Maximum image size in MB

  const queryClient = useQueryClient();

  // Create debounced search function
  const debouncedSearch = debounce(() => {
    setPagination({ ...pagination, current: 1 });
    refetch();
    setIsSearching(false);
  }, 500);

  // Effect to trigger search when inputs change
  useEffect(() => {
    if (searchUsername !== "" || searchContent !== "") {
      setIsSearching(true);
      debouncedSearch();
    }
    // Cleanup function
    return () => debouncedSearch.cancel();
  }, [searchUsername, searchContent]);

  // Fetch stories with pagination, search, and sorting
  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "stories",
      pagination.current,
      pagination.pageSize,
      searchUsername,
      searchContent,
      sortField,
      sortOrder,
    ],
    queryFn: async () => {
      const res = await AdminService.getAllStories({
        page: pagination.current,
        pageSize: pagination.pageSize,
        username: searchUsername || undefined,
        content: searchContent || undefined,
        sortField,
        sortOrder,
      });

      return res?.data;
    },
    onSuccess: (data) => {
      setPagination({
        ...pagination,
        total: data.result.totalElement,
        current: data.result.currentPage,
      });
    },
  });

  // Create story mutation remains the same
  const createStoryMutation = useMutation({
    mutationFn: (storyData) => AdminService.createStory(storyData),
    onSuccess: () => {
      message.success(t("Story created successfully"));
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      setValidationError("");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
    onError: (error) => {
      message.error(error.message || t("Failed to create story"));
    },
  });

  // Handle table change (pagination, filters, sorters)
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: pagination.current,
    });

    // Handle sorting
    if (sorter && sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order || "descend");
    }
  };

  // Reset all search filters
  const handleResetFilters = () => {
    setSearchUsername("");
    setSearchContent("");
    // setPagination({ ...pagination, current: 1 });
    // refetch();
  };

  // New functions for image gallery
  const showGallery = (images, initialIndex = 0) => {
    setGalleryImages(images);
    setCurrentImageIndex(initialIndex);
    setGalleryVisible(true);
  };

  const navigateGallery = (direction) => {
    if (direction === "next") {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    } else {
      setCurrentImageIndex(
        (prev) => (prev - 1 + galleryImages.length) % galleryImages.length
      );
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{t("Upload")}</div>
    </div>
  );
  // Table column definitions
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      ellipsis: true,
      width: "15%",
    },
    {
      title: t("Username"),
      dataIndex: "username",
      key: "username",
      width: "10%",
      // sorter: true,
      sortDirections: ["ascend", "descend"],
      filteredValue: searchUsername ? [searchUsername] : null,
      // Add highlight for searched text
      render: (text) => {
        if (!searchUsername || !text) return text;
        const index = text.toLowerCase().indexOf(searchUsername.toLowerCase());
        if (index >= 0) {
          const beforeStr = text.substring(0, index);
          const searchStr = text.substring(
            index,
            index + searchUsername.length
          );
          const afterStr = text.substring(index + searchUsername.length);
          return (
            <span>
              {beforeStr}
              <span style={{ backgroundColor: "#ffd54f" }}>{searchStr}</span>
              {afterStr}
            </span>
          );
        }
        return text;
      },
    },
    {
      title: t("Content"),
      dataIndex: "content",
      key: "content",
      width: "20%",
      ellipsis: true,
      filteredValue: searchContent ? [searchContent] : null,
      // Add highlight for searched text
      render: (text) => {
        if (!searchContent || !text) return text;
        const index = text.toLowerCase().indexOf(searchContent.toLowerCase());
        if (index >= 0) {
          const beforeStr = text.substring(0, index);
          const searchStr = text.substring(index, index + searchContent.length);
          const afterStr = text.substring(index + searchContent.length);
          return (
            <span>
              {beforeStr}
              <span style={{ backgroundColor: "#ffd54f" }}>{searchStr}</span>
              {afterStr}
            </span>
          );
        }
        return (
          <Tooltip title={text}>
            <span>
              {text.length > 50 ? `${text.substring(0, 50)}...` : text}
            </span>
          </Tooltip>
        );
      },
    },
    // Other columns remain the same
    {
      title: t("Images"),
      dataIndex: "imageUrls",
      key: "imageUrls",
      width: "15%",
      render: (imageUrls) => {
        if (imageUrls && imageUrls.length > 0) {
          return (
            <div className="flex items-center">
              {/* Display first image with thumbnail */}
              <Image
                src={imageUrls[0]}
                width={60}
                height={60}
                style={{ objectFit: "cover" }}
                preview={false}
                onClick={() => showGallery(imageUrls)}
                className="cursor-pointer"
              />

              {/* Show count of additional images if more than one */}
              {imageUrls.length > 1 && (
                <Tooltip title={t("View all images")}>
                  <Button
                    type="text"
                    className="ml-2"
                    onClick={() => showGallery(imageUrls)}
                  >
                    +{imageUrls.length - 1}
                  </Button>
                </Tooltip>
              )}
            </div>
          );
        }
        return "No image";
      },
    },
    {
      title: t("Created Date"),
      dataIndex: "postedAt",
      key: "postedAt",
      width: "15%",
      render: (text) => new Date(text).toLocaleString(),
      sorter: (a, b) => new Date(a.postedAt) - new Date(b.postedAt),
      defaultSortOrder: "descend",
      sortDirections: ["ascend", "descend"],
    },

    {
      title: t("Thời gian hết hạn"),
      dataIndex: "expiryTime",
      key: "expiryTime",
      width: "15%",
      render: (text) => new Date(text).toLocaleString(),
      sorter: (a, b) => new Date(a.expiryTime) - new Date(b.expiryTime),
      defaultSortOrder: "descend",
      sortDirections: ["ascend", "descend"],
    },
    {
      title: t("Visibility"),
      dataIndex: "visibility",
      key: "visibility",
      width: "10%",
    },
  ];

  // Other functions remain the same...

  return (
    <div className="space-y-4">
      <Card className="mb-4">
        {/* Enhanced search section */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder={t("Search by username")}
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              prefix={<SearchOutlined />}
              suffix={
                searchUsername ? (
                  <ClearOutlined
                    onClick={() => setSearchUsername("")}
                    style={{ cursor: "pointer" }}
                  />
                ) : null
              }
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder={t("Search by content")}
              value={searchContent}
              onChange={(e) => setSearchContent(e.target.value)}
              prefix={<SearchOutlined />}
              suffix={
                searchContent ? (
                  <ClearOutlined
                    onClick={() => setSearchContent("")}
                    style={{ cursor: "pointer" }}
                  />
                ) : null
              }
            />
          </div>

          <div>
            <Button
              type="primary"
              danger
              onClick={handleResetFilters}
              disabled={!searchUsername && !searchContent}
              icon={<ClearOutlined />}
            >
              {t("Clear All")}
            </Button>
          </div>
        </div>

        {/* Search indicators */}
        {(searchUsername || searchContent) && (
          <div className="mb-4 flex gap-2 flex-wrap">
            {searchUsername && (
              <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full flex items-center">
                {t("Username")}: {searchUsername}
                <Button
                  type="text"
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={() => setSearchUsername("")}
                  className="ml-1 text-blue-600"
                />
              </div>
            )}

            {searchContent && (
              <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full flex items-center">
                {t("Content")}:{" "}
                {searchContent.length > 15
                  ? `${searchContent.substring(0, 15)}...`
                  : searchContent}
                <Button
                  type="text"
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={() => setSearchContent("")}
                  className="ml-1 text-green-600"
                />
              </div>
            )}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table
              bordered
              className="custom-table"
              columns={columns}
              dataSource={data?.result?.data || []}
              loading={isLoading}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`,
              }}
              onChange={handleTableChange}
              locale={{
                emptyText:
                  searchUsername || searchContent
                    ? t("No stories match your search criteria")
                    : t("No stories found"),
              }}
            />
          </div>
        </div>
      </Card>

      {/* Image Preview Modal for upload preview */}
      <Modal
        open={previewVisible}
        title={t("Image Preview")}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>

      {/* Image Gallery Modal for viewing multiple story images */}
      <Modal
        open={galleryVisible}
        title={`${t("Images")} (${currentImageIndex + 1}/${
          galleryImages.length
        })`}
        footer={null}
        onCancel={() => setGalleryVisible(false)}
        width={800}
      >
        <div className="relative">
          <div className="flex justify-center items-center">
            <Image
              src={galleryImages[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1}`}
              style={{ maxHeight: "70vh" }}
              preview={false}
            />
          </div>

          {galleryImages.length > 1 && (
            <div className="flex justify-between mt-4">
              <Button
                icon={<LeftOutlined />}
                onClick={() => navigateGallery("prev")}
                disabled={galleryImages.length <= 1}
              >
                {t("Previous")}
              </Button>

              <div className="text-center">
                {galleryImages.map((_, index) => (
                  <Button
                    key={index}
                    type={index === currentImageIndex ? "primary" : "default"}
                    shape="circle"
                    size="small"
                    className="mx-1"
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>

              <Button
                icon={<RightOutlined />}
                onClick={() => navigateGallery("next")}
                disabled={galleryImages.length <= 1}
              >
                {t("Next")}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default StoryTable;
