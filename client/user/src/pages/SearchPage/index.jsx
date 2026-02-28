// Updated SearchPage.jsx with handling for hashtag navigation
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { PageMeta, TextInput, TopBar } from "~/components";
import SearchUserResult from "~/pages/SearchPage/SearchUserResult";
import { FiSearch } from "react-icons/fi";
import * as FriendService from "~/services/FriendService";
import * as SearchService from "~/services/SearchService";
import { APP_NAME } from "~/utils";
import { Spin, Empty, Button, List, Grid } from "antd";
import PopupAI from "~/components/PopupAI";
import { useDebounceHook } from "~/hooks/useDebounceHook";
import SearchPostResult from "~/pages/SearchPage/SearchPostResult";
import SearchGroupResult from "~/pages/SearchPage/SearchGroupResult";
import { useSelector } from "react-redux";
import LeftSideBar from "~/layouts/LeftSideBar";
import RightSideBar from "~/layouts/RightSideBar";
import SearchUserResultSkeleton from "~/pages/SearchPage/SearchUserResultSkeleton";
import SearchPostResultSkeleton from "~/pages/SearchPage/SearchPostResultSkeleton";

const { useBreakpoint } = Grid;

const SearchPage = () => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const screens = useBreakpoint();
  const user = useSelector((state) => state?.user);
  const isMobile = !screens.sm;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [userSuggestion, setUserSuggestion] = useState([]);
  const [searchResults, setSearchResults] = useState({
    users: [],
    posts: [],
    groups: [],
    hashtags: [],
    keywords: [],
  });

  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isSearchingPosts, setIsSearchingPosts] = useState(false);
  const [isSearchingGroups, setIsSearchingGroups] = useState(false);
  const [isSearchingHashtags, setIsSearchingHashtags] = useState(false);
  const [isSearchingKeywords, setIsSearchingKeywords] = useState(false);

  const debouncedSearchQuery = useDebounceHook(searchQuery, 500);

  const { isLoading: loadingSuggestions } = useQuery({
    queryKey: ["friend-suggestion"],
    queryFn: async () => {
      const res = await FriendService.friendSuggesstion();
      setUserSuggestion(res?.result || []);
      return res?.result;
    },
  });

  // Search users
  const searchUsers = async (query) => {
    if (!query.trim()) return [];

    setIsSearchingUsers(true);
    try {
      const usersRes = await SearchService.searchUser({ keyword: query });
      setSearchResults((prev) => ({
        ...prev,
        users: usersRes?.result?.items || [],
      }));
      return usersRes?.result?.items || [];
    } catch (error) {
      console.error("User search error:", error);
      return [];
    } finally {
      setIsSearchingUsers(false);
    }
  };

  // Search posts
  const searchPosts = async (query) => {
    if (!query.trim()) return [];

    setIsSearchingPosts(true);
    try {
      const postsRes = await SearchService.searchPost({ keyword: query });
      setSearchResults((prev) => ({
        ...prev,
        posts: postsRes?.result?.data || [],
      }));
      return postsRes?.result?.data || [];
    } catch (error) {
      console.error("Post search error:", error);
      return [];
    } finally {
      setIsSearchingPosts(false);
    }
  };

  // Search groups
  const searchGroups = async (query) => {
    if (!query.trim()) return [];

    setIsSearchingGroups(true);
    try {
      const groupsRes = await SearchService.searchGroups({ keyword: query });
      setSearchResults((prev) => ({
        ...prev,
        groups: groupsRes?.result?.content || [],
      }));
      return groupsRes?.result?.content || [];
    } catch (error) {
      console.error("Group search error:", error);
      return [];
    } finally {
      setIsSearchingGroups(false);
    }
  };

  // Search keywords
  const searchKeywords = async (query) => {
    if (!query.trim()) return [];

    setIsSearchingKeywords(true);
    try {
      const keywordsRes = await SearchService.searchPostByKeyword({
        keyword: query,
      });
      setSearchResults((prev) => ({
        ...prev,
        keywords: keywordsRes?.result?.data || [],
      }));
      return keywordsRes?.result?.data || [];
    } catch (error) {
      console.error("Keyword search error:", error);
      return [];
    } finally {
      setIsSearchingKeywords(false);
    }
  };

  // Search hashtags
  const searchHashtags = async (query) => {
    if (!query.trim()) return [];

    setIsSearchingHashtags(true);
    try {
      const formattedQuery = query.startsWith("#") ? query.substring(1) : query;

      const hashtagsRes = await SearchService.searchPostByHashTag({
        keyword: formattedQuery,
      });

      const hashtags =
        hashtagsRes?.message === "Hashtag not found"
          ? []
          : hashtagsRes?.result?.data || [];

      setSearchResults((prev) => ({
        ...prev,
        hashtags,
      }));

      return hashtags;
    } catch (error) {
      console.error("Hashtag search error:", error);
      return [];
    } finally {
      setIsSearchingHashtags(false);
    }
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);

    // Clear previous search results for the new tab
    setSearchResults((prev) => ({
      ...prev,
      [key === "all" ? "users" : key]: [],
      [key === "all" ? "posts" : null]: [],
    }));

    // If there's an active search query, perform the appropriate search for the new tab
    if (debouncedSearchQuery.trim()) {
      performSearchForTab(key, debouncedSearchQuery);
    }
  };

  const handleInputChange = (e) => setSearchQuery(e.target.value);

  // Function to perform search for a specific tab
  const performSearchForTab = async (tab, query) => {
    if (!query.trim()) return;

    switch (tab) {
      case "users":
        await searchUsers(query);
        break;
      case "posts":
        await searchPosts(query);
        break;
      case "groups":
        await searchGroups(query);
        break;
      case "hashtags":
        await searchHashtags(query);
        break;
      case "keywords":
        await searchKeywords(query);
        break;
      case "all":
        await Promise.all([searchUsers(query), searchPosts(query)]);
        break;
      default:
        break;
    }
  };

  // Set initial search query and active tab from state if available
  useEffect(() => {
    if (state) {
      if (state.stateKeyword) {
        setSearchQuery(state.stateKeyword);
      }
      if (
        state.activeTab &&
        tabOptions.some((tab) => tab.id === state.activeTab)
      ) {
        setActiveTab(state.activeTab);
      }
    }
  }, [state]);

  // Effect for handling search based on debounced query
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setSearchResults({
        users: [],
        posts: [],
        groups: [],
        hashtags: [],
        keywords: [],
      });
      return;
    }

    // Perform search based on the active tab
    performSearchForTab(activeTab, debouncedSearchQuery);
  }, [debouncedSearchQuery, activeTab]);

  // Determine if a tab is loading
  const isTabLoading = (tab) => {
    switch (tab) {
      case "users":
        return isSearchingUsers;
      case "posts":
        return isSearchingPosts;
      case "groups":
        return isSearchingGroups;
      case "hashtags":
        return isSearchingHashtags;
      case "keywords":
        return isSearchingKeywords;
      case "all":
        return isSearchingUsers || isSearchingPosts;
      default:
        return false;
    }
  };

  // Tab options
  const tabOptions = [
    { value: t("Tất cả"), id: "all" },
    { value: t("Người dùng"), id: "users" },
    { value: t("Bài viết"), id: "posts" },
    // { value: t("Nhóm"), id: "groups" },
    { value: t("Hashtag"), id: "hashtags" },
    { value: t("Từ khóa"), id: "keywords" },
    { value: t("Đề xuất"), id: "suggestions" },
  ];

  // Custom tab panel component like in MyProfilePage
  const CustomTabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
      {...other}
    >
      {value === index && <div className="h-full">{children}</div>}
    </div>
  );

  return (
    <>
      <PageMeta title={t(`Tìm kiếm - ${APP_NAME}`)} />
      <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
        <TopBar title={t("Tìm kiếm")} />
        <PopupAI />

        <div className="w-full flex gap-2 pb-8 lg:gap-8 h-full">
          <div className="hidden w-1/4 lg:w-1/5 h-full md:flex flex-col gap-6 overflow-y-auto">
            {user?.token && <LeftSideBar />}
          </div>
          {/* Center */}
          <div className="flex-1 flex-col h-full bg-primary rounded-tl-3xl rounded-tr-3xl shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed overflow-y-auto">
            <div className="px-5 pt-5">
              <TextInput
                placeholder={t("Tìm kiếm")}
                styles="w-full outline-none text-ascent-1 flex rounded-2xl px-10 py-4 bg-primary border-1 border-borderNewFeed items-center justify-center text-base"
                iconLeft={<FiSearch className="text-ascent-2" size={19} />}
                value={searchQuery}
                iconLeftStyles="ml-1"
                onChange={handleInputChange}
              />
            </div>

            {/* New simplified tab navigation from MyProfilePage */}
            <div className="w-full mt-4 px-5">
              <div className="flex w-full bg-bgSearch border-1 border-borderNewFeed p-1 rounded-xl overflow-hidden">
                {tabOptions.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 py-3 px-2 text-center rounded-xl text-xs transition-colors ${
                      activeTab === tab.id
                        ? "bg-white text-gray-800 font-medium shadow-sm"
                        : "bg-transparent text-gray-500"
                    }`}
                  >
                    {tab.value}
                  </button>
                ))}
              </div>
            </div>

            {/* All tab */}
            <CustomTabPanel value={activeTab} index="all">
              <div className="p-4 pb-10">
                {isTabLoading("all") ? (
                  <>
                    <div className="mb-6">
                      <div className="flex justify-between px-4 items-center mb-3">
                        <h3 className="text-lg font-medium text-ascent-1">
                          {t("Người dùng")}
                        </h3>
                        <Button className="text-ascent-2" type="link">
                          {t("Xem tất cả")}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {Array(3)
                          .fill(0)
                          .map((_, index) => (
                            <SearchUserResultSkeleton key={`user-${index}`} />
                          ))}
                      </div>
                    </div>

                    <div className="mb-6 px-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium text-ascent-1">
                          {t("Bài viết")}
                        </h3>
                        <Button className="text-ascent-2" type="link">
                          {t("Xem tất cả")}
                        </Button>
                      </div>
                      {Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <SearchPostResultSkeleton key={`post-${index}`} />
                        ))}
                    </div>
                  </>
                ) : searchQuery ? (
                  <>
                    {/* Users section */}
                    {searchResults.users.length > 0 && (
                      <div className="mb-6">
                        <div className="flex justify-between px-4 items-center mb-3">
                          <h3 className="text-lg font-medium text-ascent-1">
                            {t("Người dùng")}
                          </h3>
                          {searchResults.users.length > 2 && (
                            <Button
                              className="text-ascent-2"
                              type="link"
                              onClick={() => setActiveTab("users")}
                            >
                              {t("Xem tất cả")}
                            </Button>
                          )}
                        </div>
                        <div className="space-y-3">
                          {searchResults.users.slice(0, 3).map((user) => (
                            <SearchUserResult key={user.id} user={user} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Posts section */}
                    {searchResults.posts.length > 0 && (
                      <div className="mb-6 px-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-medium text-ascent-1">
                            {t("Bài viết")}
                          </h3>
                          {searchResults.posts.length > 2 && (
                            <Button
                              className="text-ascent-2"
                              type="link"
                              onClick={() => setActiveTab("posts")}
                            >
                              {t("Xem tất cả")}
                            </Button>
                          )}
                        </div>
                        <List
                          dataSource={searchResults.posts.slice(0, 2)}
                          renderItem={(post) => (
                            <SearchPostResult
                              post={post}
                              searchKeyword={
                                activeTab === "keywords"
                                  ? debouncedSearchQuery
                                  : ""
                              }
                            />
                          )}
                        />
                      </div>
                    )}

                    {!searchResults.users.length &&
                      !searchResults.posts.length && (
                        <Empty description={t("No data")} className="py-10" />
                      )}
                  </>
                ) : (
                  <div className="h-[480px] w-full flex items-center justify-center">
                    <Empty
                      className="py-10 text-ascent-1"
                      description={t("No data")}
                    />
                  </div>
                )}
              </div>
            </CustomTabPanel>

            {/* Users tab */}
            <CustomTabPanel value={activeTab} index="users">
              <div className="p-4 pb-10">
                {isSearchingUsers ? (
                  Array(10)
                    .fill(0)
                    .map((_, index) => <SearchUserResultSkeleton key={index} />)
                ) : searchResults.users.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.users.map((user) => (
                      <SearchUserResult key={user.id} user={user} />
                    ))}
                  </div>
                ) : (
                  <div className="h-[480px] w-full flex items-center justify-center">
                    <Empty
                      className="py-10 text-ascent-1"
                      description={t("No data")}
                    />
                  </div>
                )}
              </div>
            </CustomTabPanel>

            {/* Posts tab */}
            <CustomTabPanel value={activeTab} index="posts">
              <div className={`p-4 pb-10 ${isMobile ? "px-2" : ""}`}>
                {isSearchingPosts ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => <SearchPostResultSkeleton key={index} />)
                ) : searchResults.posts.length > 0 ? (
                  <List
                    dataSource={searchResults.posts}
                    renderItem={(post) => (
                      <SearchPostResult
                        post={post}
                        searchKeyword={
                          activeTab === "keywords" ? debouncedSearchQuery : ""
                        }
                      />
                    )}
                  />
                ) : (
                  <div className="h-[480px] w-full flex items-center justify-center">
                    <Empty
                      className="py-10 text-ascent-1"
                      description={t("No data")}
                    />
                  </div>
                )}
              </div>
            </CustomTabPanel>

            {/* Groups tab */}
            <CustomTabPanel value={activeTab} index="groups">
              <div className="p-4 pb-10">
                {isSearchingGroups ? (
                  <div className="flex justify-center p-10">
                    <Spin size="large" />
                  </div>
                ) : searchResults.groups.length > 0 ? (
                  <List
                    grid={{
                      gutter: 16,
                      column: isMobile ? 1 : 2,
                      xs: 1,
                      sm: 2,
                      md: 2,
                      lg: 2,
                    }}
                    dataSource={searchResults.groups}
                    renderItem={(group) => (
                      <List.Item>
                        <SearchGroupResult group={group} />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="h-[480px] w-full flex items-center justify-center">
                    <Empty
                      className="py-10 text-ascent-1"
                      description={t("No data")}
                    />
                  </div>
                )}
              </div>
            </CustomTabPanel>

            {/* Hashtags tab */}
            <CustomTabPanel value={activeTab} index="hashtags">
              <div className="p-4 pb-10">
                {isSearchingHashtags ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => <SearchPostResultSkeleton key={index} />)
                ) : searchResults.hashtags.length > 0 ? (
                  <List
                    dataSource={searchResults.hashtags}
                    renderItem={(post) => (
                      <SearchPostResult
                        post={post}
                        searchKeyword="" // Don't highlight keywords in hashtag search
                      />
                    )}
                  />
                ) : (
                  <div className="h-[480px] w-full flex items-center justify-center">
                    <Empty
                      className="py-10 text-ascent-1"
                      description={t("No data")}
                    />
                  </div>
                )}
              </div>
            </CustomTabPanel>

            {/* Keywords tab */}
            <CustomTabPanel value={activeTab} index="keywords">
              <div className="p-4 pb-10">
                {isSearchingKeywords ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => <SearchPostResultSkeleton key={index} />)
                ) : searchResults.keywords.length > 0 ? (
                  <List
                    dataSource={searchResults.keywords}
                    renderItem={(post) => (
                      <SearchPostResult
                        post={post}
                        searchKeyword={debouncedSearchQuery} // Highlight keywords in keyword search
                      />
                    )}
                  />
                ) : (
                  <div className="h-[480px] w-full flex items-center justify-center">
                    <Empty
                      className="py-10 text-ascent-1"
                      description={t("No data")}
                    />
                  </div>
                )}
              </div>
            </CustomTabPanel>

            {/* Suggestions tab */}
            <CustomTabPanel value={activeTab} index="suggestions">
              <div className="p-4 pb-10">
                {loadingSuggestions ? (
                  Array(10)
                    .fill(0)
                    .map((_, index) => <SearchUserResultSkeleton key={index} />)
                ) : userSuggestion.length > 0 ? (
                  <div className="flex flex-col gap-y-4">
                    {userSuggestion.map((user) => (
                      <SearchUserResult key={user.id} user={user} />
                    ))}
                  </div>
                ) : (
                  <div className="h-[480px] w-full flex items-center justify-center">
                    <Empty
                      className="py-10 text-ascent-1"
                      description={t("No data")}
                    />
                  </div>
                )}
              </div>
            </CustomTabPanel>
          </div>
          <div className="hidden w-1/5 h-full lg:flex flex-col gap-6 overflow-y-auto">
            {user?.token && <RightSideBar />}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;
