import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PostTable from "../../components/tables/PostTables/PostTables";
import { APP_NAME } from "../../utils";
import * as AdminService from "@/services/AdminService";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import moment from "moment-timezone";
import {
  Button,
  Image,
  Modal,
  Popconfirm,
  Select,
  Space,
  Upload,
  Radio,
  message,
} from "antd";
import { Search, Plus, Upload as UploadIcon } from "lucide-react";
import { useMutationHook } from "@/hooks/useMutationHook";
import { useTranslation } from "react-i18next";

export default function PostManagement() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState("newest-created");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostVisibility, setNewPostVisibility] = useState("PUBLIC");
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Fetch posts with pagination
  const {
    data: postsResponse,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch,
  } = useQuery({
    queryKey: ["posts", currentPage, pageSize],
    queryFn: async () => {
      const res = await AdminService.getAllPosts({
        page: currentPage,
        size: pageSize,
      });
      return res;
    },
  });

  useEffect(() => {
    if (postsResponse?.result) {
      setPagination({
        current: postsResponse.result.currentPage,
        pageSize: postsResponse.result.pageSize,
        total: postsResponse.result.totalElement,
      });

      // Apply filter and sort directly to the posts data
      applyFilterAndSort(postsResponse.result.data, searchText, sortOption);
    }
  }, [postsResponse]);

  // Function to apply filtering and sorting
  const applyFilterAndSort = (posts, searchQuery, sortBy) => {
    if (!posts || posts.length === 0) return;

    // Apply search filter
    let filtered = posts;
    if (searchQuery) {
      const lowerCaseSearch = searchQuery.toLowerCase();
      filtered = posts.filter(
        (post) =>
          (post.username &&
            post.username.toLowerCase().includes(lowerCaseSearch)) ||
          (post.content && post.content.toLowerCase().includes(lowerCaseSearch))
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest-created":
          return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
        case "oldest-created":
          return new Date(a.createdDate || 0) - new Date(b.createdDate || 0);
        case "newest-modified":
          return new Date(b.modifiedDate || 0) - new Date(a.modifiedDate || 0);
        case "oldest-modified":
          return new Date(a.modifiedDate || 0) - new Date(b.modifiedDate || 0);
        default:
          return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
      }
    });

    setFilteredPosts(sorted);
  };

  // Re-apply filter and sort when search or sort option changes
  useEffect(() => {
    if (postsResponse?.result?.data) {
      applyFilterAndSort(postsResponse.result.data, searchText, sortOption);
    }
  }, [searchText, sortOption, postsResponse]);

  const handleTableChange = (newPagination) => {
    // If we're filtering/searching, handle pagination locally
    if (searchText) {
      setPagination({
        ...newPagination,
        total: filteredPosts.length,
      });
    } else {
      // Otherwise use API pagination
      setCurrentPage(newPagination.current);
      setPageSize(newPagination.pageSize);
    }
  };

  const handleSearchChange = (e) => {
    const newSearchText = e.target.value;
    setSearchText(newSearchText);

    // Reset to first page when search changes
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const handleSortChange = (value) => {
    setSortOption(value);
  };

  // Get current page data for client-side pagination when filtering
  const getCurrentPageData = () => {
    if (!searchText) return filteredPosts;

    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredPosts.slice(startIndex, endIndex);
  };

  // Update pagination total when filtered results change
  useEffect(() => {
    if (searchText) {
      setPagination((prev) => ({
        ...prev,
        total: filteredPosts.length,
      }));
    }
  }, [filteredPosts, searchText]);

  const handleDeletePost = async (postId) => {
    try {
      const res = await AdminService.deletePost(postId);
      console.log(res);
      message.success(t("Post deleted successfully"));
      refetch(); // Refresh the posts after deletion
    } catch (error) {
      console.error("Error deleting post:", error);
      message.error("Failed to delete post");
    }
  };

  // Modal handlers
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewPostContent("");
    setNewPostVisibility("PUBLIC");
    setFileList([]);
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    if (newFileList.length > 1) {
      setFileList([newFileList[newFileList.length - 1]]);
    } else {
      setFileList([...newFileList]);
    }
  };

  const regularPostMutation = useMutationHook(({ data }) =>
    AdminService.createPost({ data })
  );

  const {
    isSuccess: isRegularSuccess,
    data: regularData,
    isPending: isRegularPending,
  } = regularPostMutation;

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && fileList.length === 0) {
      message.error(t("Please enter post content or upload at least one file"));
      return;
    }

    setUploading(true);

    try {
      const formattedFiles = fileList.map((file) => {
        if (file.originFileObj) {
          return file.originFileObj;
        }
        return file;
      });

      const postData = {
        request: {
          content: newPostContent,
          visibility: newPostVisibility,
        },
        files: formattedFiles,
      };

      await regularPostMutation.mutate({ data: postData });
    } catch (error) {
      console.error("Error creating post:", error);
      message.error({
        content: "Failed to create post: " + (error.message || "Unknown error"),
        key: "postCreate",
      });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (isRegularSuccess && regularData) {
      // Close modal and reset form
      setIsModalOpen(false);
      resetForm();

      // Show success message
      message.destroy();
      message.success({
        content: t("Post created successfully"),
        key: "postCreate",
        duration: 2,
      });

      // Refresh posts list
      refetch();
    }
  }, [isRegularSuccess, regularData]);

  // Properly configured upload props
  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      // Check file type - ONLY IMAGES, NO VIDEOS
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error(t("You can only upload image files!"));
        return Upload.LIST_IGNORE;
      }

      // Check file size (limit to 5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error(t("File must be smaller than 5MB!"));
        return Upload.LIST_IGNORE;
      }

      // Don't upload immediately
      return false;
    },
    fileList,
    onChange: handleFileChange,
    multiple: false, // Change to false to allow only 1 file
    listType: "picture-card",
  };

  const TABLE_POSTS = [
    {
      title: t("Post ID"),
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("Author"),
      dataIndex: "username",
      key: "username",
    },
    {
      title: t("Post Images"),
      dataIndex: "imageUrls",
      key: "imageUrls",
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
      title: t("Content"),
      dataIndex: "content",
      key: "content",
      width: 100,
    },
    {
      title: t("Created Date"),
      dataIndex: "createdDate",
      key: "createdDate",
      render: (_, record) => (
        <span>
          {moment(record?.createdDate)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss")}
        </span>
      ),
    },
    {
      title: t("Engagements"),
      dataIndex: "engagements",
      key: "engagements",
      render: (_, record) => (
        <div className="flex gap-x-4 items-center">
          <div className="flex items-center gap-1 text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 10v12" />
              <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
            </svg>
            <span className="font-medium">{record?.like || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="font-medium">{record?.commentCount || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span className="font-medium">{record?.share || 0}</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta title={`Post Management - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle={t("Posts")} />
      <div className="space-y-6">
        <ComponentCard
          title={t("Posts Table")}
          btn={
            <>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative w-full sm:w-auto">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder={t("Search by author or content...")}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white w-full sm:w-64"
                    value={searchText}
                    onChange={handleSearchChange}
                  />
                </div>
                <Select
                  defaultValue="newest-created"
                  className="min-w-40"
                  onChange={handleSortChange}
                  options={[
                    { value: "newest-created", label: t("Newest Created") },
                    { value: "oldest-created", label: t("Oldest Created") },
                    // { value: "newest-modified", label: "Newest Modified" },
                    // { value: "oldest-modified", label: "Oldest Modified" },
                  ]}
                />
                <Button
                  type="primary"
                  onClick={showModal}
                  icon={<Plus size={16} />}
                >
                  {t("Create Post")}
                </Button>
              </div>
            </>
          }
        >
          {postsError ? (
            <div className="text-red-500">Error loading posts</div>
          ) : (
            <PostTable
              columns={TABLE_POSTS}
              data={searchText ? getCurrentPageData() : filteredPosts}
              loading={isLoadingPosts}
              pagination={pagination}
              onChange={handleTableChange}
            />
          )}
        </ComponentCard>
      </div>

      {/* Create Post Modal */}
      <Modal
        title={t("Create New Post")}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            {t("Cancel")}
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleCreatePost}
            loading={uploading || isRegularPending}
            disabled={!newPostContent.trim() && fileList.length === 0}
          >
            {t("Create Post")}
          </Button>,
        ]}
        width={700}
      >
        <div className="space-y-4 mt-4">
          {/* Content Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("Content")}
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-lg p-3 min-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("Write your post content here...")}
              value={newPostContent}
              maxLength={300}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("Upload Media (Max 5MB each)")}
            </label>
            <Upload {...uploadProps} className="upload-list-inline">
              {fileList.length >= 1 ? null : (
                <div className="flex flex-col items-center justify-center">
                  <UploadIcon size={20} />
                  <div className="mt-2">{t("Upload")}</div>
                </div>
              )}
            </Upload>
            <div className="text-xs text-gray-500 mt-1">
              {t("You can upload a single image file (maximum 5MB)")}
            </div>
          </div>

          {/* Visibility Options */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("Visibility")}
            </label>
            <Radio.Group
              value={newPostVisibility}
              onChange={(e) => setNewPostVisibility(e.target.value)}
            >
              <Radio value="PUBLIC">{t("Public")}</Radio>
              <Radio value="PRIVATE">{t("Private (Only you can see)")}</Radio>
            </Radio.Group>
          </div>
        </div>
      </Modal>
    </>
  );
}
