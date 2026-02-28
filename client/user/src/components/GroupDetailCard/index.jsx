import { Users, Globe, Lock, Eye } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaShieldAlt } from "react-icons/fa";
import { Button } from "~/components";
import ManageGroup from "~/components/ManageGroup";

const GroupDetailCard = ({ group, isOwnerGroup }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case "PUBLIC":
        return <Globe className="h-5 w-5 text-green-500" />;
      case "PRIVATE":
        return <Lock className="h-5 w-5 text-red-500" />;
      case "PROTECTED":
        return <FaShieldAlt className="h-5 w-5 text-blue-500" />;
      default:
        return <Eye className="h-5 w-5 text-blue-500" />;
    }
  };

  const getVisibilityText = (visibility) => {
    switch (visibility) {
      case "PUBLIC":
        return "Public Group";
      case "PROTECTED":
        return "Protected Group";
      case "PRIVATE":
        return "Private Group";
      default:
        return "Restricted Group";
    }
  };

  return (
    <>
      <ManageGroup
        open={open}
        handleClose={handleClose}
        group={group}
        isOwnerGroup={isOwnerGroup}
      />
      <div className="w-full max-w-md mx-auto bg-primary rounded-2xl shadow overflow-hidden">
        <div className="bg-primary border-b border-borderNewFeed p-6">
          <h1 className="text-ascent-1 text-base font-bold truncate">
            {group?.name}
          </h1>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-4">
            {getVisibilityIcon(group?.visibility)}
            <span className="ml-2 text-gray-700">
              {t(getVisibilityText(group?.visibility))}
            </span>
          </div>

          <div className="flex items-center mb-6">
            <Users className="h-5 w-5 text-gray-500" />
            <span className="ml-2 text-gray-700">
              {group?.memberCount}{" "}
              {group?.memberCount === 1 ? t("member") : t("members")}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-gray-700 font-semibold mb-2">{t("About")}</h3>
            <p className="text-ascent-2">
              {group?.description || t("No description provided.")}
            </p>
          </div>

          <div className="text-xs text-gray-500 mb-4">
            {t("Group ID")}: {group?.id}
          </div>

          {isOwnerGroup && (
            <Button
              onClick={() => setOpen(true)}
              title={t("Manage group")}
              className="w-full flex items-center hover:scale-105 active:scale-95 transition-transform justify-center py-2 bg-bgStandard text-ascent-3 rounded-2xl border-1 border-borderNewFeed"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default GroupDetailCard;
