import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { BlankAvatar } from "~/assets";

const SuggestItem = ({ user, handleAddUser }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const onAddUser = async () => {
    setIsLoading(true);
    try {
      await handleAddUser(user?.userId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div key={user.id} className="p-3 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3">
          <img
            src={user?.imageUrl || BlankAvatar}
            alt="avatar"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <div>
          <p className="font-medium">{user?.username}</p>
          <p className="text-sm text-gray-500">
            {user?.firstName} {user?.lastName}
          </p>
        </div>
      </div>
      <button
        className="px-3 py-1 text-sm bg-bgStandard text-ascent-3 rounded hover:bg-opacity-50"
        onClick={onAddUser}
        disabled={isLoading}
      >
        {isLoading ? t("Adding...") : t("Add")}
      </button>
    </div>
  );
};

export default SuggestItem;
