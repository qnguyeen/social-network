import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IoIosSearch } from "react-icons/io";
import { IoClose, IoArrowBack } from "react-icons/io5";
import { useEffect, useState, useRef } from "react";
import * as SearchService from "~/services/SearchService";
import * as UserService from "~/services/UserService";
import { useDebounceHook } from "~/hooks/useDebounceHook";
import { BlankAvatar } from "~/assets";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";

const SearchResultSkeleton = () => {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="flex items-center px-3 py-2 rounded-2xl">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="flex-grow ml-3">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SearchTopBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchUser = useDebounceHook(keyword, 500);
  const [searchResults, setSearchResults] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);
  const isAuthenticated = Boolean(user?.token);

  const { data: blocks = [] } = useQuery({
    queryKey: ["blockList"],
    queryFn: UserService.blockList,
    enabled: isAuthenticated,
  });

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleChangeSearch = (e) => setKeyword(e.target.value);

  const filterBlockedUsers = (users) => {
    if (!blocks || blocks.length === 0) return users;

    const blockedUserIds = blocks.map((block) => block.userId);
    return users.filter((user) => !blockedUserIds.includes(user.userId));
  };

  const handleSearch = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      let results = [];
      const res = await SearchService.searchUser({
        keyword: searchUser,
      });
      if (res) {
        const allResults = res?.result?.items || [];
        results = filterBlockedUsers(allResults);
      }
      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchUser && isAuthenticated) {
      setIsDropdownOpen(true);
      handleSearch();
    } else {
      setIsDropdownOpen(false);
    }
  }, [searchUser, isAuthenticated, blocks]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (keyword.trim() && isAuthenticated) {
        navigate("/search", { state: { stateKeyword: keyword } });
        setIsExpanded(false);
        setIsDropdownOpen(false);
      } else if (!isAuthenticated) {
        navigate("/login");
      }
    }
  };

  const handleFocus = () => {
    if (isAuthenticated) {
      setIsExpanded(true);
      setIsDropdownOpen(Boolean(keyword));
    } else {
      navigate("/login");
    }
  };

  const handleBackClick = () => {
    setIsExpanded(false);
    setIsDropdownOpen(false);
    setKeyword("");
  };

  const handleResultClick = () => {
    if (isMobile) {
      setIsExpanded(false);
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
        if (isMobile) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobile]);

  const mobileOverlayStyles =
    isMobile && isExpanded
      ? {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: "var(--bg-color, #ffffff)",
        }
      : {};

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleBackClick}
        />
      )}

      <div
        ref={containerRef}
        className={`relative ${
          isMobile && isExpanded
            ? "fixed top-0 left-0 right-0 z-50 bg-bgColor p-4"
            : "bg-bgSearch rounded-full shadow-sm"
        }`}
        style={mobileOverlayStyles}
      >
        <div
          className={`flex items-center transition-all duration-200 ${
            isMobile && isExpanded
              ? "w-full py-3 bg-bgSearch rounded-full"
              : isExpanded
              ? "w-full py-[2px] rounded-full"
              : "w-full sm:w-[210px] py-[2px] rounded-full"
          }`}
        >
          {isExpanded ? (
            <button
              onClick={handleBackClick}
              className="p-2 text-gray-500 hover:opacity-50 active:scale-95 transition-transform flex-shrink-0"
            >
              <IoArrowBack size={isMobile ? 24 : 20} />
            </button>
          ) : (
            <div className="flex items-center justify-center pl-3 flex-shrink-0">
              <IoIosSearch
                size={isMobile ? 18 : 20}
                className="text-gray-500"
              />
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={handleChangeSearch}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onClick={handleFocus}
            placeholder={
              isAuthenticated
                ? t("Tìm kiếm trên LinkVerse")
                : t("Đăng nhập để tìm kiếm")
            }
            className={`w-full py-2 px-2 bg-transparent outline-none text-ascent-1 ${
              isMobile ? "text-base" : "text-sm"
            }`}
          />

          {keyword && (
            <button
              className="p-2 text-gray-500 hover:opacity-50 active:scale-95 transition-transform flex-shrink-0"
              onClick={() => setKeyword("")}
            >
              <IoClose size={isMobile ? 20 : 18} />
            </button>
          )}
        </div>

        {isDropdownOpen && isAuthenticated && (
          <div
            ref={dropdownRef}
            className={`absolute bg-primary rounded-xl shadow-xl z-50 flex flex-col ${
              isMobile
                ? "top-16 left-0 right-0 mx-0 max-h-96"
                : "top-full left-0 right-0 mt-2 w-full sm:w-[360px] max-h-96"
            }`}
            style={{
              maxHeight: isMobile ? "calc(100vh - 120px)" : "480px",
              ...(isMobile ? {} : { minWidth: "300px" }),
            }}
          >
            {keyword && (
              <>
                <div
                  className="overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                  style={{
                    maxHeight: isMobile ? "calc(100vh - 180px)" : "430px",
                  }}
                >
                  {isLoading ? (
                    <div className="w-full py-3">
                      <div className="flex justify-between items-center px-4 pb-2">
                        <h3
                          className={`font-medium text-ascent-1 ${
                            isMobile ? "text-lg" : "text-base"
                          }`}
                        >
                          {t("Mới đây")}
                        </h3>
                      </div>
                      <SearchResultSkeleton />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="px-1">
                      <div className="flex justify-between items-center px-4 py-3">
                        <h3
                          className={`font-medium text-ascent-1 ${
                            isMobile ? "text-lg" : "text-base"
                          }`}
                        >
                          {t("Mới đây")}
                        </h3>
                      </div>
                      {searchResults.map((user) => (
                        <Link
                          key={user.id}
                          to={"/profile/" + user?.id}
                          onClick={handleResultClick}
                          className={`flex items-center px-3 hover:bg-hoverItem rounded-2xl cursor-pointer ${
                            isMobile ? "py-3" : "py-2"
                          }`}
                        >
                          <div className="relative flex-shrink-0">
                            <img
                              src={user?.imageUrl ?? BlankAvatar}
                              alt="avatar"
                              className={`rounded-full object-cover ${
                                isMobile ? "w-10 h-10" : "w-8 h-8"
                              }`}
                            />
                            {user?.status === "ONLINE" && (
                              <div
                                className={`absolute -bottom-1 -right-0 bg-green-500 rounded-full border-2 border-white ${
                                  isMobile ? "w-3 h-3" : "w-[10px] h-[10px]"
                                }`}
                              ></div>
                            )}
                          </div>

                          <div className="flex-grow ml-3 min-w-0">
                            <p
                              className={`text-ascent-1 font-semibold truncate ${
                                isMobile ? "text-base" : "text-sm"
                              }`}
                            >
                              {user.username}
                            </p>
                            <p
                              className={`text-ascent-2 truncate ${
                                isMobile ? "text-sm" : "text-xs"
                              }`}
                            >
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`p-4 text-center text-gray-500 ${
                        isMobile ? "text-base" : "text-sm"
                      }`}
                    >
                      {t("No results found...")}
                    </div>
                  )}
                </div>

                <div className="sticky bottom-0 w-full p-2 border-t border-borderNewFeed bg-primary rounded-b-xl">
                  <Link
                    to="/search"
                    state={{ stateKeyword: keyword }}
                    onClick={handleResultClick}
                    className={`flex items-center justify-center text-ascent-2 hover:bg-hoverItem rounded-lg ${
                      isMobile ? "py-3 px-4" : "py-2 px-3"
                    }`}
                  >
                    <IoIosSearch
                      size={isMobile ? 20 : 18}
                      className="mr-2 flex-shrink-0"
                    />
                    <span
                      className={`truncate ${
                        isMobile ? "text-base" : "text-sm"
                      }`}
                    >
                      {t("See all results for")} "{keyword}"
                    </span>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchTopBar;
