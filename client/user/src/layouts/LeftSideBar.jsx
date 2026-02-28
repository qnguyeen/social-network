import React from "react";
import { useSelector } from "react-redux";
import { ProfileCard, ProfileCardSkeleton } from "~/components";
import SidebarCard from "~/components/SidebarCard";

const LeftSideBar = () => {
  const user = useSelector((state) => state?.user);
  const isAuthenticated = Boolean(user?.token);

  return (
    <div className="w-full h-full flex flex-col gap-4 md:gap-6">
      <div className="w-full">
        {isAuthenticated ? <ProfileCard /> : <ProfileCardSkeleton />}
      </div>

      <div className="w-full">
        <SidebarCard />
      </div>
    </div>
  );
};

export default LeftSideBar;
