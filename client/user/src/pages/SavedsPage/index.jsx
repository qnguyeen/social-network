import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  FriendRequest,
  FriendSuggest,
  PageMeta,
  PostCardSkeleton,
  ProfileCard,
  ProfileCardSkeleton,
  TopBar,
} from "~/components";
import SavedCard from "~/components/SavedCard";
import * as PostService from "~/services/PostService";
import { Empty } from "antd";
import { useSelector } from "react-redux";
import { useCallback } from "react";
import SidebarCard from "~/components/SidebarCard";
import FriendSuggestSkeleton from "~/components/Skeleton/FriendSuggestSkeleton";
import FriendRequestSkeleton from "~/components/Skeleton/FriendRequestSkeleton";
import { APP_NAME } from "~/utils";
import LeftSideBar from "~/layouts/LeftSideBar";
import RightSideBar from "~/layouts/RightSideBar";

const SavedsPage = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state?.user);
  const isAuthenticated = Boolean(user?.token);

  const fetchSaveds = async ({ pageParam = 1 }) => {
    let res = await PostService.getSaveds({
      page: pageParam,
      size: 10,
    });
    return {
      ...res.result,
      prevOffset: pageParam,
    };
  };

  const { data, fetchNextPage, hasNextPage, isLoading, refetch } =
    useInfiniteQuery({
      queryKey: ["saveds"],
      queryFn: fetchSaveds,
      staleTime: 0,
      getNextPageParam: (lastPage) => {
        if (lastPage.currentPage >= lastPage.totalPage) {
          return undefined;
        }
        return lastPage.currentPage + 1;
      },
    });

  const posts = data?.pages.reduce((acc, page) => {
    return [...acc, ...page.data];
  }, []);

  const onSuccess = () => {
    refetch();
  };

  return (
    <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
      <TopBar title={t("Saved")} />
      <PageMeta title={t(`Đã lưu - ${APP_NAME}`)} />

      <div className="w-full flex gap-2 pb-8 lg:gap-8 h-full">
        <div className="hidden w-1/4 lg:w-1/5 h-full md:flex flex-col gap-6 overflow-y-auto">
          {user?.token && <LeftSideBar />}
        </div>
        <div
          id="scroll"
          className="flex-1 h-full bg-primary lg:m-0 flex flex-col overflow-y-auto rounded-tl-3xl rounded-tr-3xl shadow-newFeed "
        >
          {isLoading ? (
            <div className="flex flex-col gap-6 p-4">
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          ) : posts?.length > 0 ? (
            <InfiniteScroll
              dataLength={posts ? posts.length : 0}
              next={fetchNextPage}
              hasMore={hasNextPage}
              loader={
                <div className="p-4">
                  <PostCardSkeleton />
                </div>
              }
              endMessage={
                <div className="text-center h-screen flex items-center justify-center pb-10 text-gray-500">
                  {t("You've seen all posts")}
                </div>
              }
              scrollableTarget="scroll"
            >
              <div className="p-4 space-y-6">
                {posts.map((post) => (
                  <SavedCard onSuccess={onSuccess} key={post.id} post={post} />
                ))}
              </div>
            </InfiniteScroll>
          ) : (
            <div className="flex items-center justify-center w-full h-full p-6">
              <div className="text-center max-w-sm">
                <Empty description={t("No post saved")} />
              </div>
            </div>
          )}
        </div>
        <div className="hidden w-1/5 h-full lg:flex flex-col gap-6 overflow-y-auto">
          {user?.token && <RightSideBar />}
        </div>
      </div>
    </div>
  );
};

export default SavedsPage;
