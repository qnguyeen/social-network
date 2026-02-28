import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BlankAvatar } from "~/assets/index";
import { useInfiniteQuery } from "@tanstack/react-query";
import * as StoryService from "~/services/StoryService";
import StoryRowItem from "~/components/StoryRow/StoryRowItem";
import CreateStory from "~/components/CreateStory";
import PreviewStory from "~/components/PreviewStory";
import StoryItemSkeleton from "~/components/Skeleton/StoryItemSkeleton";
import { setStory } from "~/redux/Slices/storySlice";

const StoryRow = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state?.user);
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [openCreateStory, setOpenCreateStory] = useState(false);
  const [openPreviewStory, setOpenPreviewStory] = useState(false);
  const [viewingStory, setViewingStory] = useState(null);

  const handleCloseCreateStory = () => setOpenCreateStory(false);
  const handleClosePreviewStory = () => setOpenPreviewStory(false);

  const fetchStories = async ({ pageParam = 1 }) => {
    const res = await StoryService.getAllStory({ page: pageParam });
    if (res?.code === 200) {
      return {
        data: res.result.data,
        nextPage: pageParam < res.result.totalPage ? pageParam + 1 : undefined,
        totalPages: res.result.totalPage,
      };
    }
    return { data: [], nextPage: undefined, totalPages: 0 };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["stories"],
    queryFn: fetchStories,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const onSuccessCreateStory = () => {
    refetch();
  };

  const allStories = data?.pages?.flatMap((page) => page.data) || [];

  const userStory = allStories.find(
    (story) => story.username === user?.username
  );

  useEffect(() => {
    if (allStories) {
      dispatch(setStory(allStories));
    }
  }, [allStories]);

  const otherStories = allStories.filter(
    (story) => story.username !== user?.username
  );
  const sortedStories = userStory ? [userStory, ...otherStories] : otherStories;

  const handlePreviewStory = (story) => {
    setViewingStory(story);
    setOpenPreviewStory(true);
  };

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);

      const hasMoreToScroll =
        scrollWidth > clientWidth &&
        scrollLeft < scrollWidth - clientWidth - 10;
      setShowRightArrow(hasMoreToScroll);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, [allStories, isLoading]);

  const handleScroll = () => {
    checkScrollButtons();

    if (scrollRef.current && hasNextPage && !isFetchingNextPage) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const scrollEnd = scrollWidth - clientWidth;

      if (scrollLeft > scrollEnd * 0.8) {
        fetchNextPage();
      }
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full bg-primary py-4 border-b border-borderNewFeed">
      <CreateStory
        open={openCreateStory}
        handleClose={handleCloseCreateStory}
        onSuccess={onSuccessCreateStory}
      />
      <PreviewStory
        story={viewingStory}
        open={openPreviewStory}
        handleClose={handleClosePreviewStory}
      />
      <div className="flex px-3">
        <div className="relative flex-1">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-1 z-10"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide gap-4"
            onScroll={handleScroll}
          >
            {isLoading ? (
              // Show loading skeletons while loading
              Array(8)
                .fill(0)
                .map((_, index) => (
                  <StoryItemSkeleton key={`skeleton-${index}`} />
                ))
            ) : (
              <>
                {/* User's Create Story Button */}
                <div className="flex-shrink-0">
                  <div className="flex flex-col items-center min-w-14">
                    <div
                      onClick={() => setOpenCreateStory(true)}
                      className="relative w-14 h-14 cursor-pointer rounded-full p-0.5 bg-gradient-to-tr from-[#449BFF] to-[#9db106e3]"
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                        <img
                          src={user?.imageUrl || BlankAvatar}
                          alt="Your Story"
                          className="w-full transform transition hover:-rotate-6 h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="absolute hover:scale-105 active:scale-95 transition-transform cursor-pointer bottom-0 right-0 bg-bgStandard rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                        <span className="text-ascent-3 text-sm font-bold">
                          +
                        </span>
                      </div>
                    </div>
                    <span className="text-xs mt-1 truncate w-16 text-center">
                      {t("Tạo tin")}
                    </span>
                  </div>
                </div>

                {/* All stories (user's story will be first if exists) */}
                {sortedStories.length > 0 && (
                  <>
                    {sortedStories.map((item, index) => (
                      <StoryRowItem
                        key={item.id || index}
                        item={item}
                        onClick={() => handlePreviewStory(item)}
                      />
                    ))}
                    {isFetchingNextPage && (
                      <div className="flex-shrink-0">
                        <StoryItemSkeleton />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-1 z-10"
            >
              <ChevronRight size={20} className="text-black" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryRow;
