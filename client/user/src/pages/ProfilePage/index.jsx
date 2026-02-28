import {
  TopBar,
  Button,
  PageMeta,
  PostCardSkeleton,
  CustomizeMenu,
} from "~/components";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import { BlankAvatar } from "~/assets";
import { useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as FriendService from "~/services/FriendService";
import * as UserService from "~/services/UserService";
import * as PostService from "~/services/PostService";
import { RiAttachment2 } from "react-icons/ri";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import { PiDotsThreeCircleLight } from "react-icons/pi";
import { useTranslation } from "react-i18next";
import { APP_NAME } from "~/utils";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { MenuItem } from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import SharePostCard from "~/components/SharePostCard";
import { PiSealCheck } from "react-icons/pi";
import { Empty, message } from "antd";
import ConfirmDialog from "~/components/ConfirmDialog";
import UserPostCard from "~/components/UserPostCard";
import { MdBlock } from "react-icons/md";
import PreviewStory from "~/components/PreviewStory";
import useGetDetailUserById from "~/hooks/useGetDetailUserById";

const ProfilePage = () => {
  const { t } = useTranslation();
  const theme = useSelector((state) => state.theme.theme);
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openConfirmBlock, setOpenConfirmBlock] = useState({
    open: false,
    id: null,
  });
  const allStories = useSelector((state) => state?.story?.stories ?? []);

  const [openPreviewStory, setOpenPreviewStory] = useState(false);
  const handleClosePreviewStory = () => setOpenPreviewStory(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [loadingBlockUser, setLoadingBlockUser] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [friendsFilter, setFriendsFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [isProcessingRequest, setIsProcessingRequest] = useState(false);
  const menuOpen = Boolean(anchorEl);
  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleTabChange = (newValue) => setTabValue(newValue);

  // Fetch user details
  const { data: user } = useQuery({
    queryKey: ["friendDetail", id],
    queryFn: async () => {
      const res = await UserService.getDetailUserByProfileId({ profileId: id });
      return res?.result;
    },
    enabled: !!id,
  });

  const { user: userDetail } = useGetDetailUserById({ id: user?.userId });

  const userStory = allStories.find(
    (story) => story?.username === user?.username
  );

  const handleCloseConfirm = () => {
    setOpenConfirmBlock({
      open: false,
      id: null,
    });
  };

  const handleBlockUser = async () => {
    setLoadingBlockUser(true);
    try {
      const userId = openConfirmBlock.id;
      if (!userId) return;

      const res = await UserService.block({ id: userId });
      if (res?.status === "BLOCKED") {
        message.success(t("Bạn đã chặn người này"));
        navigate("/");
        handleCloseConfirm();
      }
    } finally {
      setLoadingBlockUser(false);
    }
  };

  // Fetch friend requests sent by me
  const {
    data: dataRequestSend,
    isLoading: isLoadingSent,
    refetch: refetchRequestSend,
  } = useQuery({
    queryKey: ["requestSend"],
    queryFn: () => FriendService.getRequestSend(),
    enabled: !!user?.userId && !user?.privateProfile,
  });

  // Fetch friend requests received by me
  const {
    data: friendRequests,
    isLoading: isLoadingFriendRequest,
    refetch: refetchFriendRequests,
  } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: () => FriendService.getFriendRequests(),
    enabled: !!user?.userId,
  });

  // Fetch shared posts
  const {
    data: sharedPostsData,
    fetchNextPage: fetchNextSharedPage,
    hasNextPage: hasNextSharedPage,
    isLoading: isLoadingSharedPosts,
    refetch: refetchSharedPosts,
  } = useInfiniteQuery({
    queryKey: ["listSharePostsOfUser", user?.userId],
    queryFn: ({ pageParam = 1 }) =>
      PostService.getListShare({
        userId: user?.userId,
        page: pageParam,
        size: 10,
      }).then((res) => ({
        ...res.result,
        prevOffset: pageParam,
      })),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPage
        ? lastPage.currentPage + 1
        : undefined,
    enabled: !!user?.userId && !user?.privateProfile,
  });

  const sharedPosts = useMemo(
    () =>
      sharedPostsData?.pages?.reduce(
        (acc, page) => [...acc, ...(page?.data || [])],
        []
      ) || [],
    [sharedPostsData]
  );

  // Fetch user's friends
  const {
    data: dataMyFriend,
    isLoading: isLoadingMyFriend,
    refetch: refetchUserFriends,
  } = useQuery({
    queryKey: ["friendsMyUser", user?.userId],
    queryFn: () => FriendService.getFriendOfUser({ id: user?.userId }),
    enabled: !!user?.userId && !user?.privateProfile,
  });

  // Fetch my friends
  const {
    data: dataMyFriendOfUser,
    isLoading: isLoadingMyFriendOfUser,
    refetch: refetchMyFriends,
  } = useQuery({
    queryKey: ["friendOfUser"],
    queryFn: () => FriendService.getMyFriends(),
    enabled: !!user?.userId,
  });

  // User posts query
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingPosts,
    refetch: refetchPosts,
  } = useInfiniteQuery({
    queryKey: ["listPostsOfFriends", user?.userId],
    queryFn: ({ pageParam = 1 }) =>
      PostService.getPostsById({
        id: user?.userId,
        page: pageParam,
        size: 10,
      }).then((res) => ({
        ...res.result,
        prevOffset: pageParam,
      })),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPage
        ? lastPage.currentPage + 1
        : undefined,
    staleTime: 0,
    enabled: !!user?.userId && !user?.privateProfile,
  });

  const posts = useMemo(
    () =>
      postsData?.pages?.reduce(
        (acc, page) => [...acc, ...(page?.data || [])],
        []
      ) || [],
    [postsData]
  );

  const handleSaveUrl = () => {
    handleCloseMenu();
    navigator.clipboard.writeText(`http://localhost:5173/profile/${user?.id}`);
    message.success({ content: t("Profile ID copied to clipboard!") });
  };

  const displayFriendsList = useMemo(() => {
    switch (friendsFilter) {
      case "all":
        return dataMyFriend || [];
      default:
        return dataMyFriend || [];
    }
  }, [friendsFilter, dataMyFriend]);

  // UI Components
  const CustomTabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ height: "screen" }}>{children}</Box>}
    </div>
  );

  const isLoadingFriendData = isLoadingMyFriend;

  // Check friendship status
  const isFriend = useMemo(() => {
    return dataMyFriendOfUser?.some((item) => item?.id === id);
  }, [dataMyFriendOfUser, id]);

  const hasSentRequest = useMemo(() => {
    return dataRequestSend?.some((item) => item?.id === id);
  }, [dataRequestSend, id]);

  const hasReceivedRequest = useMemo(() => {
    return friendRequests?.some((item) => item?.id === id);
  }, [friendRequests, id]);

  // Tab options
  const tabOptions = [
    { value: t("Posts"), id: 0 },
    { value: t("Shared"), id: 1 },
    { value: t("Friends"), id: 2 },
  ];

  // Friend action handlers
  const handleUnfriend = useCallback(
    async (userId) => {
      if (isProcessingRequest) return;

      try {
        setIsProcessingRequest(true);
        await FriendService.unfriend({ id: userId });

        await Promise.all([refetchMyFriends(), refetchUserFriends()]);

        message.success(t("Bạn đã hủy kết bạn thành công"));
      } catch (error) {
        console.error("Error unfriending:", error);
        message.error(t("Failed to unfriend"));
      } finally {
        setIsProcessingRequest(false);
      }
    },
    [isProcessingRequest, refetchMyFriends, refetchUserFriends, t]
  );

  const handleCancelRequest = useCallback(
    async (userId) => {
      if (isProcessingRequest) return;

      try {
        setIsProcessingRequest(true);
        await FriendService.cancel({ id: userId });

        // Update queries after successful action
        await refetchRequestSend();

        message.success(t("Bạn đã hủy lời mời kết bạn"));
      } catch (error) {
        console.error("Error canceling request:", error);
        toast.error(t("Failed to cancel request"));
      } finally {
        setIsProcessingRequest(false);
      }
    },
    [isProcessingRequest, refetchRequestSend, t]
  );

  const handleAccept = useCallback(
    async (userId) => {
      if (isProcessingRequest) return;

      try {
        setIsProcessingRequest(true);
        await FriendService.accept({ id: userId });

        // Update queries after successful action
        await Promise.all([
          refetchFriendRequests(),
          refetchMyFriends(),
          refetchUserFriends(),
        ]);

        message.success(t("Bạn đã chấp nhận lời mời kết bạn"));
      } catch (error) {
        console.error("Error accepting request:", error);
        message.error(t("Failed to accept request"));
      } finally {
        setIsProcessingRequest(false);
      }
    },
    [
      isProcessingRequest,
      refetchFriendRequests,
      refetchMyFriends,
      refetchUserFriends,
      t,
    ]
  );

  const handleReject = useCallback(
    async (userId) => {
      if (isProcessingRequest) return;

      try {
        setIsProcessingRequest(true);
        await FriendService.reject({ id: userId });

        await refetchFriendRequests();

        message.success(t("Bạn đã từ chối lời mời kết bạn"));
      } catch (error) {
        console.error("Error rejecting request:", error);
        message.error(t("Failed to reject request"));
      } finally {
        setIsProcessingRequest(false);
      }
    },
    [isProcessingRequest, refetchFriendRequests, t]
  );

  const handleMakeFriend = useCallback(
    async (userId) => {
      if (isProcessingRequest) return;

      try {
        setIsProcessingRequest(true);
        await FriendService.request({ id: userId });

        await refetchRequestSend();

        message.success(t("Sent friend request successfully"));
      } catch (error) {
        console.error("Error sending request:", error);
        message.error(t("Failed to send request"));
      } finally {
        setIsProcessingRequest(false);
      }
    },
    [isProcessingRequest, refetchRequestSend, t]
  );

  // Invalidate queries when friendship status changes
  const invalidateRelatedQueries = useCallback(() => {
    queryClient.invalidateQueries(["friendsMyUser"]);
    queryClient.invalidateQueries(["friendOfUser"]);
    queryClient.invalidateQueries(["requestSend"]);
    queryClient.invalidateQueries(["friendRequests"]);
  }, [queryClient]);

  const handleOpenBlockUserConfirm = (id) => {
    setAnchorEl(null);
    setOpenConfirmBlock({
      open: true,
      id: id,
    });
  };

  return (
    <>
      <PageMeta title={`${user?.username || "Profile"} - ${APP_NAME}`} />
      <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
        <TopBar title={t("Trang cá nhân")} iconBack />
        <ConfirmDialog
          open={openConfirmBlock?.open}
          onClose={handleCloseConfirm}
          onConfirm={handleBlockUser}
          loading={loadingBlockUser}
          title={t("Chặn người dùng")}
          description={t(
            "Bạn có chắc chắn muốn chặn người dùng này? Họ sẽ không thể tương tác với bạn nữa."
          )}
          confirmText={t("Chặn")}
          variant="danger"
          className="w-[400px]"
        />
        <PreviewStory
          story={userStory}
          open={openPreviewStory}
          handleClose={handleClosePreviewStory}
        />

        <div className="w-full h-full justify-center flex">
          <div className="w-[680px] h-full bg-primary rounded-3xl shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed overflow-y-auto">
            {/* Profile header */}
            <div className="w-full overflow-hidden">
              {/* Cover Image with Rainbow Gradient Background */}
              {user?.coverImageUrl ? (
                <div className="w-full h-56 relative">
                  <img src={user?.coverImageUrl} alt="coverImage" />
                </div>
              ) : (
                <div className="w-full h-56 relative bg-zinc-500"></div>
              )}

              {/* Profile Section with Stats */}
              <div className="relative bg-primary px-8 pb-6 pt-4 rounded-t-3xl -mt-6">
                {/* Profile Picture - Recessed in Concave Style */}
                <div className="absolute -top-16 left-6">
                  {userStory ? (
                    <div
                      onClick={() => setOpenPreviewStory(true)}
                      className="w-24 h-24 active:scale-95 transition-transform cursor-pointer rounded-full bg-gradient-to-tr from-[#449BFF] to-[#9db106e3] p-1 shadow-lg"
                    >
                      <div className="w-full  h-full flex items-center justify-center rounded-full overflow-hidden border-2 border-white bg-gray-100">
                        <img
                          src={user?.imageUrl || BlankAvatar}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />

                        {user?.status === "ONLINE" && (
                          <div className="absolute bottom-1 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white z-10"></div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                      <div className="w-full  h-full flex items-center justify-center rounded-full overflow-hidden border-2 border-white bg-gray-100">
                        <img
                          src={user?.imageUrl || BlankAvatar}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />

                        {user?.status === "ONLINE" && (
                          <div className="absolute bottom-1 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white z-10"></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Name, verification and bio */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex w-full items-center justify-center gap-x-2">
                      <div className="flex flex-col w-full">
                        <div className="flex items-center w-full justify-between gap-x-2">
                          <div className="flex gap-x-2 items-center">
                            <h1 className="text-2xl font-bold text-ascent-1">
                              {user?.firstName + " " + user?.lastName}
                            </h1>
                            {userDetail?.emailVerified && (
                              <div className="flex items-center gap-x-1">
                                <PiSealCheck
                                  size={22}
                                  className="text-blue-500"
                                />
                                <span className="text-base text-blue-500">
                                  {t("Email Verified")}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex">
                            <PiDotsThreeCircleLight
                              onClick={handleOpenMenu}
                              className={`${
                                menuOpen && "opacity-50"
                              } cursor-pointer active:scale-90`}
                              color={theme === "dark" ? "#fff" : "#000"}
                              size={24}
                            />
                            <CustomizeMenu
                              handleClose={handleCloseMenu}
                              anchorEl={anchorEl}
                              open={menuOpen}
                              styles={{ marginTop: "10px", width: "500px" }}
                              anchor={{ vertical: "top", horizontal: "right" }}
                            >
                              <MenuItem onClick={handleSaveUrl}>
                                <div className="flex items-center justify-between w-full">
                                  <span
                                    className={`${
                                      theme === "dark"
                                        ? "text-white"
                                        : "text-black"
                                    }`}
                                  >
                                    {t("Sao chép")}
                                  </span>
                                  <RiAttachment2
                                    className={`${
                                      theme === "dark"
                                        ? "text-white"
                                        : "text-black"
                                    }`}
                                  />
                                </div>
                              </MenuItem>
                              <MenuItem
                                onClick={() =>
                                  handleOpenBlockUserConfirm(user?.userId)
                                }
                                disableRipple
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-red-600">
                                    {t("Chặn")}
                                  </span>
                                  <MdBlock color="red" />
                                </div>
                              </MenuItem>
                            </CustomizeMenu>
                          </div>
                        </div>
                        <h2 className="text-base text-ascent-2">
                          @{user?.username}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="w-full flex flex-col gap-y-2 justify-center">
                    {user?.company && (
                      <p className="text-ascent-2 ">{user?.company}</p>
                    )}

                    {user?.city && (
                      <p className="text-ascent-2 ">{user?.city}</p>
                    )}

                    {user?.quote && (
                      <p className="text-ascent-1 break-words leading-relaxed ">
                        {user?.quote}
                      </p>
                    )}

                    {user?.bio && (
                      <p className="text-ascent-1 break-words">
                        {showFullBio ? user.bio : user.bio.slice(0, 155)}
                        {user.bio.length > 200 && (
                          <span
                            className="text-blue-700 ml-2 font-normal cursor-pointer"
                            onClick={() => setShowFullBio(!showFullBio)}
                          >
                            {showFullBio
                              ? t("...hiển thị ít hơn")
                              : t("...xem thêm")}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="w-full mt-3 flex items-center justify-between gap-x-2">
                    <div className="flex items-center gap-x-2">
                      {!user?.privateProfile && (
                        <>
                          {isFriend ? (
                            <>
                              <Button
                                onClick={() => handleUnfriend(user?.userId)}
                                title={t("Hủy kết bạn")}
                                disabled={isProcessingRequest}
                                className={`w-36 py-2 ${
                                  isProcessingRequest
                                    ? "opacity-70"
                                    : "hover:scale-105 active:scale-95"
                                } transition-transform rounded-3xl bg-primary text-ascent-1 border-1 border-borderNewFeed`}
                              />
                              <Button
                                onClick={() => navigate("/chat")}
                                title={t("Nhắn tin")}
                                className="w-36 py-2 hover:scale-105 active:scale-95 transition-transform rounded-3xl bg-bgStandard text-ascent-3 border-1 border-borderNewFeed"
                              />
                            </>
                          ) : hasSentRequest ? (
                            <>
                              <Button
                                onClick={() =>
                                  handleCancelRequest(user?.userId)
                                }
                                title={t("Hủy yêu cầu")}
                                disabled={isProcessingRequest}
                                className={`w-36 py-2 ${
                                  isProcessingRequest
                                    ? "opacity-70"
                                    : "hover:scale-105 active:scale-95"
                                } transition-transform rounded-3xl bg-primary text-ascent-1 border-1 border-borderNewFeed`}
                              />
                            </>
                          ) : hasReceivedRequest ? (
                            <>
                              <Button
                                onClick={() => handleAccept(user?.userId)}
                                title={t("Chấp nhận")}
                                disabled={isProcessingRequest}
                                className={`w-36 py-2 ${
                                  isProcessingRequest
                                    ? "opacity-70"
                                    : "hover:scale-105 active:scale-95"
                                } transition-transform rounded-3xl bg-primary text-ascent-1 border-1 border-borderNewFeed`}
                              />
                              <Button
                                onClick={() => handleReject(user?.userId)}
                                title={t("Từ chối")}
                                disabled={isProcessingRequest}
                                className={`w-36 py-2 ${
                                  isProcessingRequest
                                    ? "opacity-70"
                                    : "hover:scale-105 active:scale-95"
                                } transition-transform rounded-3xl bg-bgStandard text-ascent-3 border-1 border-borderNewFeed`}
                              />
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => handleMakeFriend(user?.userId)}
                                title={t("Kết bạn")}
                                disabled={isProcessingRequest}
                                className={`w-36 py-2 ${
                                  isProcessingRequest
                                    ? "opacity-70"
                                    : "hover:scale-105 active:scale-95"
                                } transition-transform rounded-3xl bg-primary text-ascent-1 border-1 border-borderNewFeed`}
                              />
                              <Button
                                onClick={() => navigate("/chat")}
                                title={t("Nhắn tin")}
                                className="w-36 py-2 hover:scale-105 active:scale-95 transition-transform rounded-3xl bg-bgStandard text-ascent-3 border-1 border-borderNewFeed"
                              />
                            </>
                          )}
                        </>
                      )}
                    </div>
                    {user?.jobTitle && (
                      <div className="bg-bgSearch px-3 rounded-2xl py-2 text-sm">
                        <p className="text-ascent-1 font-medium">
                          {user?.jobTitle}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* New simplified tab navigation */}
            <div className="w-full mt-2 px-4">
              <div className="flex w-full bg-gray-100 p-1 rounded-xl overflow-hidden">
                {tabOptions.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 py-3 px-2 text-center rounded-xl text-sm transition-colors ${
                      tabValue === tab.id
                        ? "bg-white text-gray-800 font-medium shadow-sm"
                        : "bg-transparent text-gray-500"
                    }`}
                  >
                    {tab.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts tab */}
            <CustomTabPanel value={tabValue} index={0}>
              <div className="w-full pb-10 h-full">
                {/* Posts list */}
                <div
                  id="scroll"
                  className="flex-1 px-3 bg-primary flex flex-col gap-6 overflow-y-auto"
                >
                  <InfiniteScroll
                    dataLength={posts?.length || 0}
                    next={fetchNextPage}
                    hasMore={hasNextPage}
                    scrollableTarget="scroll"
                    endMessage={
                      <div className="text-center h-80 flex items-center justify-center pb-10 text-gray-500">
                        {t("You've seen all posts")}
                      </div>
                    }
                    loader={
                      <div>
                        <PostCardSkeleton />
                        <PostCardSkeleton />
                      </div>
                    }
                  >
                    <div className="w-full h-full overflow-y-auto">
                      {isLoadingPosts && (
                        <>
                          <PostCardSkeleton />
                          <PostCardSkeleton />
                        </>
                      )}
                      {posts?.length > 0 &&
                        posts.map((post) => (
                          <UserPostCard
                            key={post.id}
                            post={post}
                            handleRefetch={() => refetchPosts()}
                          />
                        ))}
                    </div>
                  </InfiniteScroll>
                </div>
              </div>
            </CustomTabPanel>

            {/* Share tab */}
            <CustomTabPanel value={tabValue} index={1}>
              <div className="w-full pb-10 h-full">
                <div className="flex-1 px-3 bg-primary flex flex-col gap-6 overflow-y-auto">
                  <InfiniteScroll
                    dataLength={sharedPosts?.length || 0}
                    next={fetchNextSharedPage}
                    hasMore={hasNextSharedPage}
                    scrollableTarget="scroll"
                    loader={
                      <div>
                        <PostCardSkeleton />
                        <PostCardSkeleton />
                      </div>
                    }
                    endMessage={
                      <div className="text-center h-80 flex items-center justify-center pb-10 text-gray-500">
                        {t("You've seen all posts")}
                      </div>
                    }
                  >
                    <div className="w-full h-full overflow-y-auto">
                      {isLoadingSharedPosts && (
                        <>
                          <PostCardSkeleton />
                          <PostCardSkeleton />
                        </>
                      )}
                      {sharedPosts?.length > 0 &&
                        sharedPosts.map((post) => (
                          <SharePostCard
                            key={post.id}
                            post={post}
                            handleRefetch={() => refetchSharedPosts()}
                          />
                        ))}
                    </div>
                  </InfiniteScroll>
                </div>
              </div>
            </CustomTabPanel>

            {/* Friends tab */}
            <CustomTabPanel value={tabValue} index={2}>
              <div className="w-full h-full px-6 pb-10 py-3">
                {/* Search and filter section */}
                <div className="flex flex-col mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-ascent-1">
                      {t("Bạn bè")} ({dataMyFriend?.length || 0})
                    </h3>
                    <div className="flex cursor-pointer gap-2">
                      <div className="py-2 px-3 cursor-pointer rounded-xl bg-bgColor border border-borderNewFeed text-ascent-1 text-sm focus:outline-none">
                        <span>{t("Tất cả bạn bè")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Search bar */}
                  {dataMyFriend?.length > 0 && (
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder={t("Tìm kiếm bạn bè")}
                        className="w-full py-3 pl-10 pr-4 rounded-2xl bg-bgColor border border-borderNewFeed text-ascent-1 text-sm focus:outline-none"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-ascent-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Friends list */}
                <div className="w-full">
                  {isLoadingFriendData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array(6)
                        .fill()
                        .map((_, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-2xl bg-bgSearch animate-pulse"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-full bg-borderNewFeed"></div>
                              <div className="flex flex-col gap-2">
                                <div className="h-4 w-32 bg-borderNewFeed rounded"></div>
                                <div className="h-3 w-20 bg-borderNewFeed rounded"></div>
                              </div>
                            </div>
                            <div className="h-8 w-8 bg-borderNewFeed rounded-full"></div>
                          </div>
                        ))}
                    </div>
                  ) : displayFriendsList?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {displayFriendsList.map((friend) => (
                        <div
                          key={friend?.id}
                          className="bg-bgSearch border-1 border-borderNewFeed rounded-2xl p-3 transition-all hover:shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <div
                              className="flex items-center gap-x-3 cursor-pointer"
                              onClick={() => navigate(`/profile/${friend?.id}`)}
                            >
                              <img
                                src={friend?.imageUrl || BlankAvatar}
                                alt="user avatar"
                                className="w-14 h-14 rounded-full object-cover"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-ascent-1">
                                  {friend?.username}
                                </span>
                                <span className="text-xs text-ascent-2">
                                  {`${friend?.firstName || ""} ${
                                    friend?.lastName || ""
                                  }`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center py-10">
                      <Empty description={t("No friends")} />
                    </div>
                  )}
                </div>
              </div>
            </CustomTabPanel>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
