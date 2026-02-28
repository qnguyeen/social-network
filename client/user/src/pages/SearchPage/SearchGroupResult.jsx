import { Avatar, Card } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { HiUserGroup } from "react-icons/hi";

const SearchGroupResult = ({ group }) => {
  const { t } = useTranslation();
  return (
    <Card
      hoverable
      cover={
        group.cover && (
          <img
            alt={group.name}
            src={group.cover}
            className={`object-cover ${isMobile ? "h-24" : "h-32"}`}
          />
        )
      }
    >
      <Card.Meta
        avatar={<Avatar icon={<HiUserGroup />} />}
        title={<span className={isMobile ? "text-sm" : ""}>{group.name}</span>}
        description={`${group.memberCount} ${t("members")}`}
      />
      {group.description && (
        <p className={`mt-2 line-clamp-2 ${isMobile ? "text-xs" : "text-sm"}`}>
          {group.description}
        </p>
      )}
    </Card>
  );
};

export default SearchGroupResult;
