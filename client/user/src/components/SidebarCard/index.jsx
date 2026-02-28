import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import FeedIcon from "~/components/Icons/FeedIcon";
import CharityIcon from "~/components/Icons/CharityIcon";
import ChatIcon from "~/components/Icons/ChatIcon";
import SearchIcon from "~/components/Icons/SearchIcon";
import SaveIcon from "~/components/Icons/SaveIcon";
import * as GroupService from "~/services/GroupService";
import { FiPlus } from "react-icons/fi";
import CreateGroup from "~/components/CreateGroup";
import { useSelector } from "react-redux";
import AdsIcon from "~/components/Icons/AdsIcon";
import { useTranslation } from "react-i18next";

const GroupSkeleton = () => (
  <div className="flex items-center animate-pulse">
    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
    <div className="ml-3 h-4 bg-gray-200 rounded w-24"></div>
    <div className="ml-auto h-4 bg-gray-200 rounded w-8"></div>
  </div>
);

const SidebarCard = () => {
  const theme = useSelector((state) => state?.theme?.theme);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const getActiveTab = (pathname) => {
    if (pathname === "/") return "feeds";
    if (pathname === "/fundraisers") return "charity";
    if (pathname === "/chat") return "chat";
    if (pathname === "/saveds") return "save";
    if (pathname === "/search") return "search";
    if (pathname === "/ads") return "ads";
    if (pathname.startsWith("/group/")) return "groups";
    return "";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab(location.pathname));

  useEffect(() => {
    setActiveTab(getActiveTab(location.pathname));
  }, [location.pathname]);

  const handleCloseCreateGroup = () => setOpenCreateGroup(false);

  const getFillColor = (isActive) => {
    if (theme === "light") {
      return isActive ? "#fff" : "#000";
    } else {
      return isActive ? "#000" : "#fff";
    }
  };

  const navItems = [
    {
      id: "feeds",
      label: t("Feeds"),
      icon: (isActive) => <FeedIcon fill={getFillColor(isActive)} />,
      path: "/",
    },
    {
      id: "charity",
      label: t("Charity"),
      icon: (isActive) => <CharityIcon fill={getFillColor(isActive)} />,
      badge: 22,
      path: "/fundraisers",
    },
    {
      id: "chat",
      label: t("Chat"),
      icon: (isActive) => <ChatIcon fill={getFillColor(isActive)} />,
      path: "/chat",
    },
    {
      id: "save",
      label: t("Save"),
      icon: (isActive) => <SaveIcon fill={getFillColor(isActive)} />,
      path: "/saveds",
    },
    {
      id: "search",
      label: t("Search"),
      icon: (isActive) => <SearchIcon fill={getFillColor(isActive)} />,
      path: "/search",
    },
  ];

  const {
    data: groups,
    isLoading: isLoadingGroups,
    refetch,
  } = useQuery({
    queryKey: ["allGroups"],
    queryFn: async () => {
      const res = await GroupService.getAllGroup({ page: 0, size: 10 });
      return res?.result?.content;
    },
  });

  const onSuccess = () => refetch();

  return (
    <>
      <CreateGroup
        open={openCreateGroup}
        handleClose={handleCloseCreateGroup}
        onSuccess={onSuccess}
      />
      <div className="h-fit flex flex-col shadow bg-primary p-3 rounded-2xl">
        {/* Navigation Items with improved transitions */}
        <div className="flex flex-col gap-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-300 ease-in-out ${
                  isActive
                    ? "font-medium shadow-md text-white bg-bgStandard transform scale-102"
                    : "text-gray-700 hover:bg-hoverItem hover:bg-opacity-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="w-6 h-6 flex-shrink-0 mr-3 transition-transform duration-300 ease-in-out">
                    {item.icon(isActive)}
                  </div>
                  <span
                    className={`text-base transition-colors duration-300 ease-in-out ${
                      isActive ? "text-ascent-3" : "text-ascent-1"
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
        <div className="mt-4 px-4 mb-4">
          <h3 className="text-gray-500 font-medium text-xs tracking-widest mb-4 uppercase">
            {t("Nhóm bạn thích")}
          </h3>
          <div className="space-y-4 mb-2">
            {isLoadingGroups ? (
              <>
                <GroupSkeleton />
                <GroupSkeleton />
                <GroupSkeleton />
              </>
            ) : (
              groups &&
              groups.length > 0 &&
              groups.map((group) => (
                <NavLink
                  key={group.id}
                  to={`/group/${group.id}`}
                  className={({ isActive }) =>
                    `flex items-center py-1 hover:bg-hoverItem rounded-lg transition-all duration-300 ease-in-out ${
                      isActive
                        ? "bg-hoverItem bg-opacity-75 transform scale-102"
                        : ""
                    }`
                  }
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg border-1 border-borderNewFeed flex items-center justify-center overflow-hidden transition-transform duration-300 ease-in-out">
                      <img
                        src="/public/group_default.png"
                        alt=""
                        className="rounded-lg w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <span className="ml-3 text-base truncate flex-1 transition-colors duration-300 ease-in-out">
                    {group.name}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full transition-all duration-300 ease-in-out">
                    {group.memberCount}
                  </span>
                </NavLink>
              ))
            )}
          </div>
          <div
            onClick={() => setOpenCreateGroup(true)}
            className="flex items-center cursor-pointer rounded-lg py-2 transition-all duration-300 ease-in-out hover:bg-hoverItem"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-primary rounded-lg border-1 border-borderNewFeed flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105">
                <FiPlus className="transition-transform duration-300 ease-in-out hover:rotate-90" />
              </div>
            </div>
            <span className="ml-3 text-base text-ascent-2 truncate flex-1">
              {t("Tạo nhóm")}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarCard;
