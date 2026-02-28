import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { BlankAvatar } from "~/assets/index";
import { useQuery } from "@tanstack/react-query";
import * as FriendService from "~/services/FriendService";
import FriendSuggestRowItem from "~/components/FriendSuggestRow/FriendSuggestRowItem";

const FriendSuggestRow = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state?.user);
  const scrollRef = useRef(null);
  const [showNavButtons, setShowNavButtons] = useState(false);

  const {
    data: suggestedUsers = [],
    isLoading: isLoadingSuggestions,
    refetch,
  } = useQuery({
    queryKey: ["friendsSuggest"],
    queryFn: async () => {
      const res = await FriendService.friendSuggesstion();
      return res?.result || [];
    },
  });

  const onSuccess = () => {
    refetch();
  };

  useEffect(() => {
    const checkScrollable = () => {
      if (scrollRef.current) {
        const { scrollWidth, clientWidth } = scrollRef.current;
        setShowNavButtons(scrollWidth > clientWidth);
      }
    };

    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [suggestedUsers]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 150 : 200;
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 150 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full bg-white py-3 md:py-4 border-b border-borderNewFeed">
      <div className="flex items-center justify-between px-3 md:px-4 mb-3 md:mb-4">
        <h2 className="text-black text-base md:text-lg font-medium">
          Gợi ý cho bạn
        </h2>
        {/* Desktop navigation buttons */}
        {showNavButtons && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={scrollLeft}
              className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollRight}
              className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Mobile navigation buttons */}
        {showNavButtons && (
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={scrollLeft}
              className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={scrollRight}
              className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide gap-3 md:gap-4 px-3 md:px-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x mandatory",
          }}
        >
          {suggestedUsers.map((suggestion) => (
            <FriendSuggestRowItem
              onSuccess={onSuccess}
              key={suggestion.id}
              suggestion={suggestion}
            />
          ))}
        </div>
      </div>

      {/* Mobile scroll indicators */}
      <div className="flex sm:hidden justify-center mt-2 gap-1">
        {suggestedUsers.length > 2 && (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          </>
        )}
      </div>
    </div>
  );
};

export default FriendSuggestRow;
