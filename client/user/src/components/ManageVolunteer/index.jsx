import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useTranslation } from "react-i18next";
import CustomModal from "~/components/CustomModal";
import ManageVolunteerItem from "~/components/ManageVolunteer/ManageVolunteerItem";
import * as PageService from "~/services/PageService";

const ManageVolunteer = ({ open, handleClose, campaign }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Fetch volunteers data
  const {
    data: volunteers = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["listVolunteers", campaign?.id],
    queryFn: async () => {
      const res = await PageService.getVolunteerByCampaign({
        campaignId: campaign?.id,
      });
      return res?.result || [];
    },
    enabled: !!campaign?.id && open,
  });

  // Approve volunteer mutation
  const approveVolunteerMutation = useMutation({
    mutationFn: async (volunteerId) => {
      return await PageService.update({
        id: volunteerId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listVolunteers", campaign?.id],
      });
    },
  });

  // Reject volunteer mutation
  const rejectVolunteerMutation = useMutation({
    mutationFn: async (volunteerId) => {
      return await PageService.reject({
        id: volunteerId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listVolunteers", campaign?.id],
      });
    },
  });

  // Delete volunteer mutation
  const deleteVolunteerMutation = useMutation({
    mutationFn: async (volunteerId) => {
      return await PageService.deleteVolunteer({
        id: volunteerId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listVolunteers", campaign?.id],
      });
    },
  });

  const onSuccess = () => {
    refetch();
  };

  return (
    <CustomModal isOpen={open} onClose={handleClose}>
      <div className="w-full p-6 bg-white rounded-2xl">
        <h2 className="text-xl font-bold mb-4">{t("Campaign Volunteers")}</h2>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : volunteers.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            {t("No volunteers found for this campaign.")}
          </p>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {volunteers.map((volunteer) => (
              <ManageVolunteerItem
                key={volunteer.id}
                volunteer={volunteer}
                onSuccess={onSuccess}
              />
            ))}
          </div>
        )}
      </div>
    </CustomModal>
  );
};

export default ManageVolunteer;
