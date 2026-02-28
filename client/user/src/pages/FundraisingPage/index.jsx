import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  FaSearch,
  FaRegCheckCircle,
  FaRegTimesCircle,
  FaPlus,
  FaUser,
  FaChevronDown,
  FaRegUserCircle,
  FaChevronUp,
} from "react-icons/fa";
import { BsGridFill, BsListUl } from "react-icons/bs";
import { IoDocumentOutline } from "react-icons/io5";
import {
  TopBar,
  ProfileCard,
  ProfileCardSkeleton,
  PageMeta,
} from "~/components";
import { APP_NAME } from "~/utils";
import { BlankAvatar } from "~/assets";
import * as CampaignService from "~/services/CampaignService";
import * as PageService from "~/services/PageService";
import CreateCampaign from "~/components/CreateCampaign";
import CampaignItemList from "~/pages/FundraisingPage/CampaignItemList";
import CampaignItemGrid from "~/pages/FundraisingPage/CampaignItemGrid";
import SidebarCard from "~/components/SidebarCard";
import {
  CampaignItemGridSkeleton,
  CampaignItemListSkeleton,
} from "~/components/Skeleton/CampaignSkeleton";
import TopCampaignsCard from "~/components/TopCampaignsCard";
import VolunteerTimeSelector from "~/components/VolunteerTimeSelector";
import RecommendCampaignCard from "~/components/RecommedCampaignCard";

const FundraisingPage = () => {
  const user = useSelector((state) => state?.user);
  const { t } = useTranslation();
  const isAuthenticated = !!user?.token;
  const [campaignData, setCampaignData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [openSelectTime, setOpenSelectTime] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef(null);
  const handleCloseSelectTime = () => setOpenSelectTime(false);

  const {
    data: campaignsData,
    isLoading: isLoadingCampaigns,
    refetch: refetchGetCampaign,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await CampaignService.getAllCampaign();
      return res?.result || [];
    },
  });

  const { data: registeredTimes } = useQuery({
    queryKey: ["checkTimeSelector"],
    queryFn: async () => {
      const res = await PageService.getFreeTime();
      return res?.result || [];
    },
  });

  useEffect(() => {
    const processCampaigns = async () => {
      if (campaignsData && campaignsData.length > 0) {
        const processedCampaigns = campaignsData.map((campaign) => {
          const createdDate = new Date(campaign.created_date);
          const daysActive = Math.ceil(
            (new Date() - createdDate) / (1000 * 60 * 60 * 24)
          );
          const progress =
            campaign.target_amount > 0
              ? Math.round(
                  (campaign.current_amount / campaign.target_amount) * 100
                )
              : 0;

          return {
            ...campaign,
            daysActive,
            progress,
            daysLeft: 90 - daysActive > 0 ? 90 - daysActive : 0,
            goalReached: campaign.status === "FINISHED",
            featured: progress > 50 && campaign.status === "UNFINISHED",
          };
        });
        setCampaignData(processedCampaigns);
      }
    };

    processCampaigns();
  }, [campaignsData]);

  // Handle click outside sort menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getFilteredCampaigns = () => {
    let dataToFilter = campaignData;

    // Apply search filter
    if (searchQuery.trim()) {
      dataToFilter = dataToFilter.filter((campaign) =>
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    const sortedData = [...dataToFilter];

    switch (sortOption) {
      case "newest":
        sortedData.sort(
          (a, b) => new Date(b.created_date) - new Date(a.created_date)
        );
        break;
      case "oldest":
        sortedData.sort(
          (a, b) => new Date(a.created_date) - new Date(b.created_date)
        );
        break;
      case "progress-high":
        sortedData.sort((a, b) => b.progress - a.progress);
        break;
      case "progress-low":
        sortedData.sort((a, b) => a.progress - b.progress);
        break;
      case "amount-high":
        sortedData.sort((a, b) => b.current_amount - a.current_amount);
        break;
      case "amount-low":
        sortedData.sort((a, b) => a.current_amount - b.current_amount);
        break;
      case "days-left":
        sortedData.sort((a, b) => a.daysLeft - b.daysLeft);
        break;
      default:
        break;
    }

    return sortedData;
  };

  const filteredCampaigns = getFilteredCampaigns();

  const getSortOptionLabel = (option) => {
    switch (option) {
      case "newest":
        return t("Newest");
      case "oldest":
        return t("Oldest");
      case "progress-high":
        return t("Progress (High to Low)");
      case "progress-low":
        return t("Progress (Low to High)");
      case "amount-high":
        return t("Amount (High to Low)");
      case "amount-low":
        return t("Amount (Low to High)");
      case "days-left":
        return t("Days Left");
      default:
        return t("Newest");
    }
  };

  const FilterButton = ({ id, label, icon, active }) => (
    <button
      className={`flex items-center py-2 px-3 rounded-md whitespace-nowrap transition-all ${
        active
          ? "bg-bgSearch text-ascent-1 font-medium"
          : "text-gray-500 hover:bg-gray-100"
      }`}
      onClick={() => setActiveFilter(id)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const [openCreateCampaign, setOpenCreateCampaign] = useState(false);
  const handleCloseCreateCampaign = () => setOpenCreateCampaign(false);

  const handleSuccessCreateCampaign = () => {
    refetchGetCampaign();
  };

  const isLoading = isLoadingCampaigns;

  const skeletonCount = 6;

  const LeftSidebar = useCallback(
    () => (
      <>
        {isAuthenticated ? <ProfileCard /> : <ProfileCardSkeleton />}
        <SidebarCard />
      </>
    ),
    [isAuthenticated]
  );

  const onSuccess = () => {
    refetchGetCampaign();
  };

  const renderSkeletons = () => {
    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {[...Array(skeletonCount)].map((_, index) => (
            <CampaignItemGridSkeleton key={`grid-skeleton-${index}`} />
          ))}
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          {[...Array(skeletonCount)].map((_, index) => (
            <CampaignItemListSkeleton key={`list-skeleton-${index}`} />
          ))}
        </div>
      );
    }
  };

  return (
    <div>
      <PageMeta title={t(`Gây quỹ - ${APP_NAME}`)} />

      <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
        <TopBar />
        <CreateCampaign
          open={openCreateCampaign}
          handleClose={handleCloseCreateCampaign}
          onSuccessCreateCampaign={handleSuccessCreateCampaign}
        />
        <VolunteerTimeSelector
          open={openSelectTime}
          handleClose={handleCloseSelectTime}
        />
        <div className="w-full flex gap-2 pb-8 lg:gap-8 h-full">
          {/* Left */}
          <div className="hidden w-1/4 lg:w-1/5 h-full md:flex flex-col gap-6 overflow-y-auto">
            {user?.token && <LeftSidebar />}
          </div>

          {/* Center */}
          <div className="flex-1 h-full bg-primary lg:m-0 flex overflow-y-auto rounded-tl-3xl rounded-tr-3xl shadow-sm">
            <div className="max-w-6xl mx-auto p-6 font-sans w-full">
              {/* Header with Create Button */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-ascent-1">
                    {t("Fundraising Campaigns")}
                  </h1>
                  <p className="text-ascent-2 mt-1">
                    {t("Featured campaigns with highest funding progress")}
                  </p>
                </div>
                <div className="flex items-center gap-x-2">
                  <button
                    onClick={() => setOpenSelectTime(true)}
                    className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform bg-primary   py-2 px-4 rounded-xl border-1 text-ascent-1 border-borderNewFeed"
                  >
                    <FaPlus size={14} />
                    <span>{t("Create free time")}</span>
                  </button>
                  <button
                    onClick={() => setOpenCreateCampaign(true)}
                    className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform bg-bgStandard text-ascent-3 py-2 px-4 rounded-xl border-1 border-borderNewFeed"
                  >
                    <FaPlus size={14} />
                    <span>{t("Create campaign")}</span>
                  </button>
                </div>
              </div>

              {/* Search and Filter Bar */}
              <div className="bg-bgSearch rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search Input */}
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border-1 border-borderNewFeed rounded-lg bg-bgSearch"
                      placeholder={t("Search campaigns...")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* View Toggle and Sort */}
                  <div className="flex items-center gap-2">
                    <div className="border rounded-md overflow-hidden flex bg-white">
                      <button
                        className={`py-2 px-3 ${
                          viewMode === "grid"
                            ? "bg-indigo-50 text-black"
                            : "text-gray-500"
                        }`}
                        onClick={() => setViewMode("grid")}
                      >
                        <BsGridFill />
                      </button>
                      <button
                        className={`py-2 px-3 ${
                          viewMode === "list"
                            ? "bg-indigo-50 text-black"
                            : "text-gray-500"
                        }`}
                        onClick={() => setViewMode("list")}
                      >
                        <BsListUl />
                      </button>
                    </div>
                    <div className="relative" ref={sortMenuRef}>
                      <button
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="border rounded-md flex items-center py-2 px-3 bg-white whitespace-nowrap hover:bg-gray-50"
                      >
                        <span className="text-gray-600 mr-2">
                          {t("Sort by")}: {getSortOptionLabel(sortOption)}
                        </span>
                        {showSortMenu ? (
                          <FaChevronUp className="text-gray-500 text-xs" />
                        ) : (
                          <FaChevronDown className="text-gray-500 text-xs" />
                        )}
                      </button>

                      {/* Sort Dropdown Menu */}
                      {showSortMenu && (
                        <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                          <ul className="py-1">
                            <li>
                              <button
                                className={`px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${
                                  sortOption === "newest"
                                    ? "bg-indigo-50 text-indigo-600"
                                    : ""
                                }`}
                                onClick={() => {
                                  setSortOption("newest");
                                  setShowSortMenu(false);
                                }}
                              >
                                {t("Newest")}
                              </button>
                            </li>
                            <li>
                              <button
                                className={`px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${
                                  sortOption === "oldest"
                                    ? "bg-indigo-50 text-indigo-600"
                                    : ""
                                }`}
                                onClick={() => {
                                  setSortOption("oldest");
                                  setShowSortMenu(false);
                                }}
                              >
                                {t("Oldest")}
                              </button>
                            </li>
                            <li>
                              <button
                                className={`px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${
                                  sortOption === "progress-high"
                                    ? "bg-indigo-50 text-indigo-600"
                                    : ""
                                }`}
                                onClick={() => {
                                  setSortOption("progress-high");
                                  setShowSortMenu(false);
                                }}
                              >
                                {t("Progress (High to Low)")}
                              </button>
                            </li>
                            <li>
                              <button
                                className={`px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${
                                  sortOption === "progress-low"
                                    ? "bg-indigo-50 text-indigo-600"
                                    : ""
                                }`}
                                onClick={() => {
                                  setSortOption("progress-low");
                                  setShowSortMenu(false);
                                }}
                              >
                                {t("Progress (Low to High)")}
                              </button>
                            </li>
                            <li>
                              <button
                                className={`px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${
                                  sortOption === "amount-high"
                                    ? "bg-indigo-50 text-indigo-600"
                                    : ""
                                }`}
                                onClick={() => {
                                  setSortOption("amount-high");
                                  setShowSortMenu(false);
                                }}
                              >
                                {t("Amount (High to Low)")}
                              </button>
                            </li>
                            <li>
                              <button
                                className={`px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${
                                  sortOption === "amount-low"
                                    ? "bg-indigo-50 text-indigo-600"
                                    : ""
                                }`}
                                onClick={() => {
                                  setSortOption("amount-low");
                                  setShowSortMenu(false);
                                }}
                              >
                                {t("Amount (Low to High)")}
                              </button>
                            </li>
                            <li>
                              <button
                                className={`px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${
                                  sortOption === "days-left"
                                    ? "bg-indigo-50 text-indigo-600"
                                    : ""
                                }`}
                                onClick={() => {
                                  setSortOption("days-left");
                                  setShowSortMenu(false);
                                }}
                              >
                                {t("Days Left")}
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex  items-center mb-6 overflow-x-auto pb-2">
                <FilterButton
                  id="all"
                  active={activeFilter === "all"}
                  label={t("All Campaigns")}
                  icon={<span className="mr-2 text-lg">📋</span>}
                />
              </div>

              {/* Campaigns Display */}
              {isLoading ? (
                renderSkeletons()
              ) : (
                <>
                  {/* Show campaign count */}
                  <div className="mb-4 text-gray-500">
                    {t("Showing")}{" "}
                    <span className="font-medium">
                      {filteredCampaigns.length}
                    </span>{" "}
                    {t("campaigns")}
                  </div>

                  {filteredCampaigns.length > 0 ? (
                    viewMode === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {filteredCampaigns.map((campaign) => (
                          <CampaignItemGrid
                            onSuccessClose={onSuccess}
                            key={campaign.id}
                            campaign={campaign}
                          />
                        ))}
                      </div>
                    ) : (
                      // List View
                      <div className="space-y-4">
                        {filteredCampaigns.map((campaign) => (
                          <CampaignItemList
                            onSuccessClose={onSuccess}
                            key={campaign.id}
                            campaign={campaign}
                          />
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="flex justify-center items-center h-64 bg-primary rounded-lg border-1 border-borderNewFeed border-dashed">
                      <div className="text-center p-8">
                        <div className="bg-bgSearch w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaSearch className="text-ascent-1 text-xl" />
                        </div>
                        <h3 className="text-lg font-medium text-ascent-1 mb-2">
                          {t("No campaigns found")}
                        </h3>
                        <p className="text-ascent-2 mb-4">
                          {t(
                            "Try adjusting your search or filter to find what you're looking for"
                          )}
                        </p>
                        <button
                          onClick={() => setOpenCreateCampaign(true)}
                          className="bg-bgStandard text-ascent-3 py-2 px-4 rounded-lg transition-all"
                        >
                          {t("Create campaign")}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="hidden w-1/5 h-full lg:flex flex-col gap-6 overflow-y-auto">
            <TopCampaignsCard />
            {registeredTimes?.length > 0 && <RecommendCampaignCard />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundraisingPage;
