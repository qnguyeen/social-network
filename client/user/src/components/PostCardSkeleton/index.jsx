import { useSelector } from "react-redux";
import { Skeleton } from "antd";

const PostCardSkeleton = () => {
  const { theme } = useSelector((state) => state?.theme);

  return (
    <div className="bg-primary rounded-xl py-3">
      {/* Header */}
      <div className="flex gap-3 px-5 items-center">
        {/* Avatar skeleton */}
        <div className="w-[50px] h-[50px] rounded-full overflow-hidden flex-shrink-0">
          <Skeleton.Avatar active size={50} shape="circle" />
        </div>

        {/* User info skeleton */}
        <div className="w-full flex justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton.Input
              active
              size="small"
              className="!w-[120px] !h-[18px]"
            />
            <Skeleton.Input
              active
              size="small"
              className="!w-[80px] !h-[14px]"
            />
          </div>

          {/* Menu button placeholder */}
          <div className="w-6 h-6">
            <Skeleton.Button
              active
              size="small"
              shape="circle"
              className="!w-6 !h-6"
            />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="px-5 mt-3">
        <Skeleton
          active
          paragraph={{ rows: 3, width: ["100%", "90%", "80%"] }}
          title={false}
        />

        {/* Image skeleton */}
        <div className="mt-3 w-full h-[200px] rounded-lg overflow-hidden">
          <Skeleton.Image active className="!w-full !h-full" />
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="w-full px-5 mt-4 flex items-center justify-between">
        <div className="flex items-center gap-x-6">
          {/* Like skeleton */}
          <div className="flex gap-2 items-center">
            <Skeleton.Button
              active
              size="small"
              shape="circle"
              className="!w-5 !h-5"
            />
          </div>

          {/* Comment skeleton */}
          <div className="flex gap-2 items-center">
            <Skeleton.Button
              active
              size="small"
              shape="circle"
              className="!w-5 !h-5"
            />
          </div>

          {/* Share skeleton */}
          <div className="flex gap-2 items-center">
            <Skeleton.Button
              active
              size="small"
              shape="circle"
              className="!w-5 !h-5"
            />
          </div>
        </div>

        {/* Save button skeleton */}
        <Skeleton.Button
          active
          size="small"
          shape="circle"
          className="!w-5 !h-5"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-[#66666645] mt-3"></div>
    </div>
  );
};

export default PostCardSkeleton;
