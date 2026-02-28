import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setIsReloadGroupDetail } from "~/redux/Slices/groupSlice";
import * as GroupService from "~/services/GroupService";

const GroupVisibility = ({ group }) => {
  const { t } = useTranslation();
  const [visibility, setVisibility] = useState(group?.visibility);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();

  const handleChangeVisibility = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await GroupService.changeVisibility({
        groupId: group?.id,
        newVisibility: visibility,
      });
      if (res?.visibility === visibility) {
        setSuccess(true);
        setVisibility(res?.visibility);
        dispatch(setIsReloadGroupDetail(true));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">{t("Group Visibility")}</h3>

      <div className="space-y-4">
        <div className="flex items-start">
          <input
            id="PRIVATE"
            type="radio"
            name="visibility"
            className="mt-1"
            checked={visibility === "PRIVATE"}
            onChange={() => setVisibility("PRIVATE")}
            disabled={loading}
          />
          <div className="ml-3">
            <label htmlFor="PRIVATE" className="font-medium">
              {t("Private")}
            </label>
            <p className="text-sm text-gray-500">
              {t("Only members can see group content and activities")}
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <input
            id="PROTECTED"
            type="radio"
            name="visibility"
            className="mt-1"
            checked={visibility === "PROTECTED"}
            onChange={() => setVisibility("PROTECTED")}
            disabled={loading}
          />
          <div className="ml-3">
            <label htmlFor="PROTECTED" className="font-medium">
              {t("Protected")}
            </label>
            <p className="text-sm text-gray-500">
              {t("Anyone can see the group, but only members can participate")}
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <input
            id="PUBLIC"
            type="radio"
            name="visibility"
            className="mt-1"
            checked={visibility === "PUBLIC"}
            onChange={() => setVisibility("PUBLIC")}
            disabled={loading}
          />
          <div className="ml-3">
            <label htmlFor="PUBLIC" className="font-medium">
              {t("Public")}
            </label>
            <p className="text-sm text-gray-500">
              {t("Anyone can see and join the group")}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {success && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          {t("Visibility settings saved successfully")}
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          className="px-4 py-2 bg-bgStandard text-ascent-3 rounded-xl hover:scale-105 active:scale-95 transition-transform hover:opacity-50"
          onClick={handleChangeVisibility}
          disabled={loading}
        >
          {loading ? t("Saving...") : t("Save Changes")}
        </button>
      </div>
    </div>
  );
};

export default GroupVisibility;
