import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import DialogCustom from "~/components/DialogCustom";
import AddMember from "~/components/ManageGroup/AddMember";
import GroupVisibility from "~/components/ManageGroup/GroupVisibility";
import ManageMember from "~/components/ManageGroup/ManageMember";

const ManageGroup = ({ open, handleClose, group, isOwnerGroup }) => {
  const { t } = useTranslation();
  const theme = useSelector((state) => state?.theme?.theme);
  const [activeTab, setActiveTab] = useState("addMember");

  const tabs = [
    { id: "addMember", label: t("Add Members") },
    { id: "manageMembers", label: t("Manage Members") },
    { id: "visibility", label: t("Group Visibility") },
  ];

  return (
    <DialogCustom
      isOpen={open}
      theme={theme}
      width={"660px"}
      title={t("Manage Group")}
      style={{ overflow: "visible" }}
      handleCloseDiaLogAdd={handleClose}
    >
      <div className="flex flex-col h-full w-full">
        <div className="border-b">
          <div className="flex w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 px-4 py-5 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-b-2 border-black text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {activeTab === "addMember" && (
            <AddMember handleClose={handleClose} group={group} />
          )}
          {activeTab === "manageMembers" && (
            <ManageMember
              handleClose={handleClose}
              group={group}
              isOwnerGroup={isOwnerGroup}
            />
          )}
          {activeTab === "visibility" && <GroupVisibility group={group} />}
        </div>
      </div>
    </DialogCustom>
  );
};

export default ManageGroup;
