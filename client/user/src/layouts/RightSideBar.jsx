import React from "react";
import { useSelector } from "react-redux";
import { FriendRequest, FriendSuggest } from "~/components";
import FriendRequestSkeleton from "~/components/Skeleton/FriendRequestSkeleton";
import FriendSuggestSkeleton from "~/components/Skeleton/FriendSuggestSkeleton";

const RightSideBar = () => {
  const user = useSelector((state) => state?.user);
  const isAuthenticated = Boolean(user?.token);

  return (
    <>
      {isAuthenticated ? <FriendSuggest /> : <FriendSuggestSkeleton />}
      {isAuthenticated ? <FriendRequest /> : <FriendRequestSkeleton />}
    </>
  );
};

export default RightSideBar;
