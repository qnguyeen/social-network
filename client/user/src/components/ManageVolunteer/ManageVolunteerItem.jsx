import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import * as UserService from "~/services/UserService";
import * as PageService from "~/services/PageService";
import { useTranslation } from "react-i18next";

const ManageVolunteerItem = ({ volunteer, onSuccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useTranslation();

  const { data: user, isLoading } = useQuery({
    queryKey: ["userDetail", volunteer?.userId],
    queryFn: async () => {
      const res = await UserService.getDetailUserByUserId({
        id: volunteer?.userId,
      });
      return res?.result;
    },
  });

  const handleApprove = async (id) => {
    setIsApproving(true);
    try {
      const res = await PageService.approve({ id });
      if (res?.code === 200) onSuccess();
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (id) => {
    setIsRejecting(true);
    try {
      const res = await PageService.reject({ id });
      if (res?.code === 200) onSuccess();
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const res = await PageService.deleteVolunteer({ id });
      if (res?.code === 200) onSuccess();
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <div
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          {user?.imageUrl && (
            <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={user.imageUrl}
                alt={`${user?.firstName || ""} ${user?.lastName || ""}`}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div>
            {user ? (
              <div className="font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </div>
            ) : (
              <div className="font-medium">
                {t("Volunteer ID:")} {volunteer.userId}
              </div>
            )}

            <div className="text-sm text-gray-600 flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-1 ${
                  user?.status === "ONLINE" ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
              {t("Applied:")} {formatDate(volunteer.appliedAt)}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              volunteer.status === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {volunteer.status}
          </span>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : user ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Username</span>
                  <p className="font-medium">{user.username}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Email</span>
                  <p className="font-medium flex items-center">
                    {user.email}
                    {user.emailVerified ? (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    ) : (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                        Unverified
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Phone</span>
                  <p className="font-medium">
                    {user.phoneNumber || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">{t("Gender")}</span>
                  <p className="font-medium capitalize">
                    {user.gender || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">
                    {t("Date of Birth")}
                  </span>
                  <p className="font-medium">
                    {user.dateOfBirth
                      ? formatDate(user.dateOfBirth)
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">{t("City")}</span>
                  <p className="font-medium">{user.city || "Not provided"}</p>
                </div>
              </div>

              {volunteer.message && (
                <div className="md:col-span-2 mt-2">
                  <span className="text-xs text-gray-500">{t("Message")}</span>
                  <p className="mt-1 p-2 bg-blue-50 rounded-md italic text-gray-700">
                    "{volunteer.message}"
                  </p>
                </div>
              )}

              <div className="md:col-span-2 mt-2 flex justify-end space-x-2">
                {volunteer.status === "PENDING" ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(volunteer.id);
                      }}
                      disabled={isDeleting}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-70 flex items-center"
                    >
                      {isDeleting && (
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      )}
                      {t("Remove Volunteer")}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(volunteer.id);
                      }}
                      disabled={isApproving}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-70 flex items-center"
                    >
                      {isApproving && (
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      )}
                      Approve
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(volunteer.id);
                    }}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-70 flex items-center"
                  >
                    {isDeleting && (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    Remove Volunteer
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 py-2">User details not available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageVolunteerItem;
