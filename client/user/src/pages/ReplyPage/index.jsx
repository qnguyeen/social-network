import { PageMeta, TopBar } from "~/components";
import { useParams } from "react-router-dom";
import * as PostService from "~/services/PostService";
import * as UserService from "~/services/UserService";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { APP_NAME } from "~/utils";
import ReplyPostCard from "~/components/ReplyPostCard";

const ReplyPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const {
    isLoading,
    data: post,
    refetch: refetchPost,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => PostService.getPostById({ id }).then((res) => res?.result),
    enabled: !!id,
  });

  const { data: userDetail } = useQuery({
    queryKey: ["user", post?.userId],
    queryFn: () =>
      UserService.getDetailUserByUserId({ id: post?.userId }).then(
        (res) => res?.result
      ),
    enabled: !!post?.userId,
  });

  const handleSuccess = () => {
    refetchPost();
  };

  return (
    <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
      <TopBar title={t("Posts")} iconBack />
      <PageMeta title={`${t("Posts")} - ${APP_NAME}`} />

      <div className="w-full h-full flex justify-center">
        <div className="w-[680px] flex flex-col h-full bg-primary p-5 rounded-tl-3xl rounded-tr-3xl shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed overflow-y-auto">
          {isLoading ? (
            <div className="animate-pulse h-40 bg-gray-200 rounded-lg"></div>
          ) : (
            <ReplyPostCard
              post={post}
              userDetail={userDetail}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReplyPage;
