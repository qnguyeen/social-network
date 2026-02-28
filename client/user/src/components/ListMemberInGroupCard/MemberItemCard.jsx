import React from "react";
import { Link } from "react-router-dom";
import { BlankAvatar } from "~/assets";
import useGetDetailUserById from "~/hooks/useGetDetailUserById";

const MemberItemCard = ({ member }) => {
  const { user } = useGetDetailUserById({ id: member?.userId });

  return (
    <div key={user.id} className="flex items-center justify-between py-2">
      <Link
        to={`/profile/${user?.userId}`}
        className="flex gap-3 items-center cursor-pointer"
      >
        <img
          src={user?.imageUrl ?? BlankAvatar}
          alt={user?.username || "User"}
          className="w-8 h-8 object-cover rounded-full"
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-ascent-1 truncate max-w-[150px]">
            {user?.username ?? "No username"}
          </span>
          <span className="text-xs text-ascent-2">
            {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
              "No name"}
          </span>
        </div>
      </Link>
      <div className="flex items-center gap-x-4 text-ascent-2 text-xs font-normal ">
        {member?.role}
      </div>
    </div>
  );
};

export default MemberItemCard;
