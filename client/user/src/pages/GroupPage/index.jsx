import { BlankAvatar } from "~/assets";
import {
  TopBar,
  Welcome,
  CreatePost,
  ProfileCard,
  ProfileCardSkeleton,
  PostCardSkeleton,
  PostCard,
  PageMeta,
} from "~/components";
import { Dropdown, Space, Button, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import useGetDetailGroup from "~/hooks/useGetDetailGroup";
import { useParams } from "react-router-dom";
import * as GroupService from "~/services/GroupService";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import SidebarCard from "~/components/SidebarCard";
import InfiniteScroll from "react-infinite-scroll-component";
import { useInfiniteQuery, useQuery, useMutation } from "@tanstack/react-query";
import GroupDetailCard from "~/components/GroupDetailCard";
import LeftSideBar from "~/layouts/LeftSideBar";
import { APP_NAME } from "~/utils";
import PostCardGroup from "~/components/PostCardGroup";
import ListMemberInGroupCard from "~/components/ListMemberInGroupCard";
import { setIsReloadGroupDetail } from "~/redux/Slices/groupSlice";

const GroupPage = () => {
  const user = useSelector((state) => state?.user);
  const { t } = useTranslation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const isReloadGroupDetail = useSelector(
    (state) => state?.group?.isReloadGroupDetail
  );
  const isAuthenticated = Boolean(user?.token);
  const [isJoining, setIsJoining] = useState(false);

  const { data: isUserInGroup, refetch: refetchUserInGroup } = useQuery({
    queryKey: ["isUserInGroup", id],
    queryFn: async () => {
      try {
        const res = await GroupService.isUserInGroup({ groupId: id });
        return res;
      } catch (error) {
        console.error("Error checking if user is in group:", error);
        return false;
      }
    },
    enabled: !!id && isAuthenticated,
  });

  const { data: isOwnerGroup, refetch: refetchOwnerStatus } = useQuery({
    queryKey: ["ownersGroup", id],
    queryFn: async () => {
      try {
        const res = await GroupService.getOwnerGroup({ groupId: id });
        return res;
      } catch (error) {
        return false;
      }
    },
    enabled: !!id && isUserInGroup,
  });

  const { data: dataDetailGroup, refetch: refetchGroupDetail } = useQuery({
    queryKey: ["groupDetail", id],
    queryFn: async () => {
      const res = await GroupService.getDetailGroup({ id });
      return res?.result;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (isReloadGroupDetail) {
      refetchGroupDetail();
      dispatch(setIsReloadGroupDetail(false));
    }
  }, [isReloadGroupDetail, refetchGroupDetail, dispatch]);

  const joinGroupMutation = useMutation({
    mutationFn: () => GroupService.joinGroup({ groupId: id }),
    onSuccess: () => {
      message.success(t("Successfully joined the group"));
      refetchUserInGroup();
    },
    onError: (error) => {
      message.error(t("Failed to join group"));
      console.error("Error joining group:", error);
    },
    onSettled: () => {
      setIsJoining(false);
    },
  });

  const handleJoinGroup = () => {
    if (!isAuthenticated) {
      message.warning(t("Please log in to join this group"));
      return;
    }

    setIsJoining(true);
    joinGroupMutation.mutate();
  };

  const fetchPosts = async ({ pageParam = 1 }) => {
    const res = await GroupService.getAllPosts({
      id,
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
      queryKey: ["groupPosts", id],
      queryFn: fetchPosts,
      staleTime: 0,
      getNextPageParam: (lastPage) => {
        if (lastPage.currentPage >= lastPage.totalPage) {
          return undefined;
        }
        return lastPage.currentPage + 1;
      },
      enabled: !!id,
    });

  const handleRefetch = useCallback(
    (isCreated) => {
      if (isCreated) {
        refetch();
      }
    },
    [refetch]
  );

  const posts = useMemo(() => {
    const allPosts = data?.pages.flatMap((page) => page.data) || [];
    return allPosts.sort((a, b) => {
      return new Date(b.createdDate) - new Date(a.createdDate);
    });
  }, [data?.pages]);

  const CreatePostSection = useCallback(() => {
    // Only show create post if user is authenticated AND is in the group
    if (!isAuthenticated || !isUserInGroup) return null;

    return (
      <div className="w-full flex items-center justify-between gap-3 py-4 px-5 border-b border-borderNewFeed">
        <div className="flex items-center gap-4">
          <div className="w-[50px] h-[50px] border-1 border-borderNewFeed rounded-full overflow-hidden shadow-newFeed">
            <img
              src={user?.imageUrl ?? BlankAvatar}
              alt="User Image"
              className="w-full h-full object-cover bg-center"
            />
          </div>
          <span className="text-ascent-2 text-sm cursor-pointer">
            {t("Có gì mới ?")}
          </span>
        </div>
        <CreatePost groupId={id} group handleRefetch={handleRefetch} />
      </div>
    );
  }, [isAuthenticated, isUserInGroup, user?.imageUrl, t, handleRefetch]);

  const NotMemberBanner = useCallback(() => {
    if (!isAuthenticated || isUserInGroup) return null;

    return (
      <div className="w-full h-screen bg-primary flex flex-col items-center justify-center gap-3 py-6 px-5 border-b border-borderNewFeed ">
        <h3 className="text-lg font-medium">
          {t("You're not a member of this group")}
        </h3>
        <p className="text-ascent-2 text-sm text-center">
          {t("Join this group to post and interact with other members")}
        </p>
      </div>
    );
  }, [isAuthenticated, isUserInGroup, isJoining, t, handleJoinGroup]);

  const PostsList = useCallback(() => {
    if (isLoading) {
      return (
        <div className="w-full flex flex-col gap-y-6">
          {Array.from({ length: 3 }, (_, index) => (
            <PostCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      );
    }

    return posts.map((post) => (
      <PostCardGroup key={post?.id} post={post} handleRefetch={handleRefetch} />
    ));
  }, [isLoading, posts, t, handleRefetch]);

  return (
    <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
      <TopBar title={dataDetailGroup?.name} />
      <PageMeta title={`${t("Group")} - ${APP_NAME}`} />
      <div className="w-full flex gap-2 pb-8 lg:gap-8 h-full">
        {/* Left */}
        <div className="hidden w-1/4 lg:w-1/5 h-full md:flex flex-col gap-6 overflow-y-auto">
          {user?.token && <LeftSideBar />}
        </div>

        {/* Center */}
        <div
          id="scroll"
          className="flex-1 h-full bg-primary lg:m-0 flex flex-col overflow-y-auto rounded-tl-3xl rounded-tr-3xl shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed"
        >
          <CreatePostSection />
          <NotMemberBanner />

          {isUserInGroup && (
            <InfiniteScroll
              dataLength={posts.length}
              next={fetchNextPage}
              hasMore={hasNextPage}
              scrollableTarget="scroll"
              loader={<PostCardSkeleton />}
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
          )}
        </div>

        {/* Right */}
        <div className="hidden w-1/5 h-full lg:flex flex-col gap-6 overflow-y-auto">
          <GroupDetailCard
            group={dataDetailGroup}
            isOwnerGroup={isOwnerGroup}
          />
          {isUserInGroup && <ListMemberInGroupCard groupId={id} />}
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
