import {
  TopBar,
  UpdateUser,
  PageMeta,
  PostCardSkeleton,
  CustomizeMenu,
} from "~/components";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import { BlankAvatar } from "~/assets";
import { useState, useMemo, useCallback, useEffect } from "react";
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
import { Empty, message } from "antd";
import QRProfile from "~/components/QRProfile";
import UploadQrCode from "~/components/UploadQrCode";
import SharePostCard from "~/components/SharePostCard";
import MyPostCard from "~/components/MyPostCard";
import { PiSealCheck } from "react-icons/pi";
import ConfirmDialog from "~/components/ConfirmDialog";
import { TbCloudUpload } from "react-icons/tb";
import { IoQrCodeOutline } from "react-icons/io5";

import { setIsRefetchRequestSent } from "~/redux/Slices/userSlice";
import FriendCardItem from "~/pages/MyProfilePage/FriendCardItem";
import PreviewStory from "~/components/PreviewStory";
import useGetDetailUserById from "~/hooks/useGetDetailUserById";

const MyProfilePage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const theme = useSelector((state) => state.theme.theme);
  const user = useSelector((state) => state?.user);
  const { user: userDetail } = useGetDetailUserById({ id: user?.id });
  const isRefetchRequestSent = useSelector(
    (state) => state?.user?.isRefetchRequestSent
  );
  const allStories = useSelector((state) => state?.story?.stories ?? []);
  const userStory = allStories.find(
    (story) => story?.username === user?.username
  );
  const [openPreviewStory, setOpenPreviewStory] = useState(false);
  const handleClosePreviewStory = () => setOpenPreviewStory(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [friendsFilter, setFriendsFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [openQrProfile, setOpenQrProfile] = useState(false);
  const handleCloseQrProfile = () => setOpenQrProfile(false);
  const [openUploadQr, setOpenUploadQr] = useState(false);
  const [loadingBlockUser, setLoadingBlockUser] = useState(false);
  const [loadingUnfriendUser, setLoadingUnfriendUser] = useState(false);
  const [openConfirmBlock, setOpenConfirmBlock] = useState({
    open: false,
    id: null,
  });
  const [openConfirmUnfriend, setOpenConfirmUnfriend] = useState({
    open: false,
    id: null,
  });
  const handleOpenUploadQr = () => {
    handleCloseMenu();
    setOpenUploadQr(true);
  };
  const menuOpen = Boolean(anchorEl);
  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleCloseConfirm = () => {
    setOpenConfirmBlock({
      open: false,
      id: null,
    });
  };
  const handleCloseConfirmUnfriend = () => {
    setOpenConfirmUnfriend({
      open: false,
      id: null,
    });
  };
  const handleTabChange = (newValue) => setTabValue(newValue);

  const { data: listAdsPost } = useQuery({
    queryKey: ["adPosts"],
  });

  const {
    data: sharedPostsData,
    fetchNextPage: fetchNextSharedPage,
    hasNextPage: hasNextSharedPage,
    isLoading: isLoadingSharedPosts,
    refetch: refetchSharedPosts,
  } = useInfiniteQuery({
    queryKey: ["userSharedPosts", user?.id],
    queryFn: ({ pageParam = 1 }) =>
      PostService.getListShare({
        userId: user?.id,
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
    enabled: !!user?.id,
    staleTime: 0,
  });

  const sharedPosts = useMemo(
    () =>
      sharedPostsData?.pages.reduce(
        (acc, page) => [...acc, ...page?.data],
        []
      ) || [],
    [sharedPostsData]
  );

  // Friend data queries
  const {
    data: dataRequestSend,
    isLoading: isLoadingSent,
    refetch: refetchRequestSend,
  } = useQuery({
    queryKey: ["requestSend"],
    queryFn: () => FriendService.getRequestSend(),
  });

  useEffect(() => {
    if (isRefetchRequestSent) {
      refetchRequestSend();
      dispatch(setIsRefetchRequestSent(false));
    }
  }, [isRefetchRequestSent]);

  const {
    data: dataMyFriend,
    isLoading: isLoadingMyFriend,
    refetch: refetchMyFriends,
  } = useQuery({
    queryKey: ["friendOfUser"],
    queryFn: () => FriendService.getMyFriends(),
  });

  const {
    data: friendRequests,
    isLoading: isLoadingFriendRequest,
    refetch: refetchFriendRequests,
  } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: () => FriendService.getFriendRequests(),
  });

  // User posts query
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingPosts,
    refetch: refetchPosts,
  } = useInfiniteQuery({
    queryKey: ["userPosts"],
    queryFn: ({ pageParam = 1 }) =>
      PostService.getMyPosts({ page: pageParam, size: 10 }).then((res) => ({
        ...res.result,
        prevOffset: pageParam,
      })),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPage
        ? lastPage.currentPage + 1
        : undefined,
    staleTime: 0,
  });

  const handleBlockUser = async () => {
    setLoadingBlockUser(true);
    try {
      const userId = openConfirmBlock.id;
      if (!userId) return;

      const res = await UserService.block({ id: userId });
      if (res?.status === "BLOCKED") {
        message.success(t("Bạn đã chặn người này"));
        if (userId === id) {
          await refetchMyFriends();
          handleCloseConfirm();
        } else {
          queryClient.invalidateQueries(["friendsMyUser"]);
          await refetchMyFriends();
          handleCloseConfirm();
        }
      }
    } finally {
      setLoadingBlockUser(false);
    }
  };

  const handleUnfriend = async () => {
    setLoadingUnfriendUser(true);
    try {
      const userId = openConfirmUnfriend.id;
      if (!userId) return;

      const res = await FriendService.unfriend({ id: userId });
      if (res) {
        message.success(t("Bạn đã hủy kết bạn thành công"));
        await refetchMyFriends();
        handleCloseConfirmUnfriend();
      } else {
        queryClient.invalidateQueries(["friendsMyUser"]);
        await refetchMyFriends();
        handleCloseConfirmUnfriend();
      }
    } finally {
      setLoadingUnfriendUser(false);
    }
  };

  const posts = useMemo(
    () =>
      postsData?.pages.reduce((acc, page) => [...acc, ...page?.data], []) || [],
    [postsData]
  );

  const handleOpenBlockUserConfirm = (id) => {
    setOpenConfirmBlock({
      open: true,
      id: id,
    });
  };

  const handleOpenUnfriendUserConfirm = (id) => {
    setOpenConfirmUnfriend({
      open: true,
      id: id,
    });
  };

  const [isLoadingCancelRequest, setIsLoadingCancelRequest] = useState(false);

  const handleCancelRequest = useCallback(
    async (userId) => {
      setIsLoadingCancelRequest(true);
      try {
        const res = await FriendService.cancel({ id: userId });
        if (res?.status === "NONE") {
          message.success(t("Bạn đã hủy lời mời kết bạn"));
          await refetchRequestSend();
        }
      } finally {
        setIsLoadingCancelRequest(false);
      }
    },
    [refetchRequestSend]
  );

  const [isLoadingAccept, setIsLoadingAccept] = useState(false);

  const handleAccept = useCallback(
    async (userId) => {
      setIsLoadingAccept(true);
      try {
        const res = await FriendService.accept({ id: userId });
        if (res?.status === "ACCEPTED") {
          message.success(t("Bạn đã chấp nhận lời mời kết bạn"));
          queryClient.invalidateQueries(["friendRequests"]);
          queryClient.invalidateQueries(["friends", id]);
          queryClient.invalidateQueries(["friendsMyUser"]);
          await refetchFriendRequests();
          await refetchMyFriends();
        }
      } finally {
        setIsLoadingAccept(false);
      }
    },
    [queryClient, refetchFriendRequests, refetchMyFriends]
  );

  const [isLoadingReject, setIsLoadingReject] = useState(false);

  const handleDecline = useCallback(
    async (userId) => {
      setIsLoadingReject(true);
      try {
        const res = await FriendService.reject({ id: userId });
        if (res?.status === "REJECTED") {
          message.success(t("Bạn đã từ chối lời mời kết bạn"));
          queryClient.invalidateQueries(["friendRequests"]);
          await refetchFriendRequests();
        }
      } finally {
        setIsLoadingReject(false);
      }
    },
    [queryClient, refetchFriendRequests]
  );

  const handleSaveUrl = () => {
    handleCloseMenu();
    navigator.clipboard.writeText(
      `http://localhost:5173/profile/${user?.profileId}`
    );
    message.success({ content: t("Profile ID copied to clipboard!") });
  };

  // Get the correct friend list based on filter
  const displayFriendsList = useMemo(() => {
    switch (friendsFilter) {
      case "all":
        return dataMyFriend || [];
      case "requests":
        return friendRequests || [];
      case "sent":
        return dataRequestSend || [];
      default:
        return dataMyFriend || [];
    }
  }, [friendsFilter, dataMyFriend, friendRequests, dataRequestSend]);

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

  const isLoadingFriendData =
    isLoadingSent || isLoadingMyFriend || isLoadingFriendRequest;

  const handleOpenQrProfile = () => {
    handleCloseMenu();
    setOpenQrProfile(true);
  };

  // Tab options
  const tabOptions = [
    { value: t("Posts"), id: 0 },
    { value: t("Shared"), id: 1 },
    { value: t("Friends"), id: 2 },
  ];

  const [isLoadingProfileCompletion, setIsLoadingProfileCompletion] =
    useState(false);
  const [percentComplete, setPerCentComplete] = useState(0);

  const fetchProfileCompletion = async () => {
    setIsLoadingProfileCompletion(true);
    try {
      const res = await UserService.getProfileCompletion();
      if (res?.code === 200) {
        setPerCentComplete(res?.result);
      }
    } finally {
      setIsLoadingProfileCompletion(false);
    }
  };

  useEffect(() => {
    fetchProfileCompletion();
  }, []);

  const PostsList = useCallback(() => {
    if (isLoadingPosts) {
      return (
        <div className="w-full flex flex-col gap-y-6">
          {Array.from({ length: 3 }, (_, index) => (
            <PostCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      );
    }

    return posts.map((post) => {
      const adPost = listAdsPost?.find(
        (ad) => ad?.post_id === post.id && ad?.status === "ACTIVE"
      );

      return (
        <MyPostCard
          key={post.id}
          post={post}
          handleRefetch={() => refetchPosts()}
          isAdActive={!!adPost}
          adData={adPost}
        />
      );
    });
  }, [isLoadingPosts, posts, t, listAdsPost]);

  const PostsListShare = useCallback(() => {
    if (isLoadingSharedPosts) {
      return (
        <div className="w-full flex flex-col gap-y-6">
          {Array.from({ length: 3 }, (_, index) => (
            <PostCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      );
    }

    return sharedPosts.map((post) => {
      return (
        <SharePostCard
          key={post.id}
          post={post}
          handleRefetch={() => refetchSharedPosts()}
        />
      );
    });
  }, [isLoadingSharedPosts, sharedPosts, t]);

  return (
    <>
      <PageMeta title={`${user?.username || "Profile"} - ${APP_NAME}`} />
      <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
        <TopBar title={t("My Profile")} iconBack />
        <QRProfile open={openQrProfile} onClose={handleCloseQrProfile} />
        <UploadQrCode
          open={openUploadQr}
          onClose={() => setOpenUploadQr(!openUploadQr)}
        />
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
        <ConfirmDialog
          open={openConfirmUnfriend?.open}
          onClose={handleCloseConfirmUnfriend}
          onConfirm={handleUnfriend}
          loading={loadingUnfriendUser}
          title={t("Hủy kết bạn")}
          description={t(
            "Bạn có chắc chắn muốn hủy kết bạn với người dùng này? Họ sẽ không thể tương tác với bạn nữa."
          )}
          confirmText={t("Hủy")}
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
                <div className="w-full h-56 relative bg-zinc-500">
                  <div className="absolute bottom-10 right-7 bg-white rounded-full hover:scale-105 active:scale-95 p-2 shadow-md cursor-pointer hover:bg-gray-100 transition-all">
                    <UpdateUser coverImage />
                  </div>
                </div>
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
                              menuOpen
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
                              <div>
                                <MenuItem onClick={handleOpenQrProfile}>
                                  <div className="flex items-center justify-between w-full">
                                    <span
                                      className={`${
                                        theme === "dark"
                                          ? "text-white"
                                          : "text-black"
                                      }`}
                                    >
                                      {t("QR code")}
                                    </span>
                                    <IoQrCodeOutline
                                      className={`${
                                        theme === "dark"
                                          ? "text-white"
                                          : "text-black"
                                      }`}
                                    />
                                  </div>
                                </MenuItem>
                                <MenuItem onClick={handleOpenUploadQr}>
                                  <div className="flex items-center gap-x-3 justify-between w-full">
                                    <span
                                      className={`${
                                        theme === "dark"
                                          ? "text-white"
                                          : "text-black"
                                      }`}
                                    >
                                      {t("Kết nối bằng QR code")}
                                    </span>
                                    <TbCloudUpload
                                      className={`${
                                        theme === "dark"
                                          ? "text-white"
                                          : "text-black"
                                      }`}
                                    />
                                  </div>
                                </MenuItem>
                              </div>
                              <div className="border-t border-borderNewFeed my-1"></div>
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

                    <div className="w-full mt-3 flex items-center justify-between gap-x-2">
                      <UpdateUser profile />
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

                {/* Profile Completion Card */}
                {percentComplete < 100 && (
                  <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-800">
                        {t("Profile Completion")}
                      </h3>
                      <span className="text-sm font-bold text-ascent-1">
                        {isLoadingProfileCompletion
                          ? "Loading..."
                          : `${percentComplete}%`}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-slate-400 to-slate-950 h-2.5 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${
                            isLoadingProfileCompletion ? 0 : percentComplete
                          }%`,
                        }}
                      ></div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                      {percentComplete < 100 &&
                        t("Complete your profile to connect with more people.")}
                    </div>
                  </div>
                )}
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
                    loader={
                      <div>
                        <PostCardSkeleton />
                        <PostCardSkeleton />
                      </div>
                    }
                    endMessage={
                      <div className="text-center h-screen flex items-center justify-center pb-10 text-gray-500">
                        {t("You've seen all posts")}
                      </div>
                    }
                  >
                    <div className="w-full h-full overflow-y-auto">
                      <PostsList />
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
                      <div className="text-center h-screen flex items-center justify-center pb-10 text-gray-500">
                        {t("You've seen all posts")}
                      </div>
                    }
                  >
                    <div className="w-full h-full overflow-y-auto">
                      <PostsListShare />
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
                      {friendsFilter === "all"
                        ? `${t("Bạn bè")} (${dataMyFriend?.length || 0})`
                        : friendsFilter === "sent"
                        ? `${t("Đã gửi")} (${dataRequestSend?.length || 0})`
                        : friendsFilter === "requests" &&
                          `${t("Lời mời kết bạn")} (${
                            friendRequests?.length || 0
                          })`}
                    </h3>
                    <div className="flex cursor-pointer gap-2">
                      <select
                        className="py-2 px-3 cursor-pointer rounded-xl bg-bgColor border border-borderNewFeed text-ascent-1 text-sm focus:outline-none"
                        value={friendsFilter}
                        onChange={(e) => setFriendsFilter(e.target.value)}
                      >
                        <option value="all" className="cursor-pointer">
                          {t("Tất cả bạn bè")}
                        </option>
                        <option value="requests">{t("Lời mời kết bạn")}</option>
                        <option value="sent">{t("Đã gửi")}</option>
                      </select>
                    </div>
                  </div>

                  {/* Search bar */}
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
                        <FriendCardItem
                          key={friend?.id}
                          friend={friend}
                          handleDecline={handleDecline}
                          handleCancelRequest={handleCancelRequest}
                          friendsFilter={friendsFilter}
                          handleAccept={handleAccept}
                          handleOpenUnfriendUserConfirm={
                            handleOpenUnfriendUserConfirm
                          }
                          handleOpenBlockUserConfirm={
                            handleOpenBlockUserConfirm
                          }
                          isLoadingReject={isLoadingReject}
                          isLoadingAccept={isLoadingAccept}
                          isLoadingCancelRequest={isLoadingCancelRequest}
                        />
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

export default MyProfilePage;
