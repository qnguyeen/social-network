import admin from "~/services/admin";
import instance from ".";

export const registerVolunteer = async (data) => {
    return await instance.post(`/page/volunteers/apply`, data);
};

export const getVolunteers = async () => {
    return await instance.get(`/page/volunteers/campaign/7d2145ed-16e9-4530-bb8d-abdece72b068/paged?page=0&size=10`);
};

export const getVolunteerByCampaign = async ({ campaignId }) => {
    return await instance.get(`/page/volunteers/campaign/${campaignId}`);
};

export const approve = async ({ id }) => {
    return await instance.patch(`/page/volunteers/${id}/status?status=APPROVED`);
};

export const reject = async ({ id }) => {
    return await instance.patch(`/page/volunteers/${id}/status?status=REJECTED`);
};

export const deleteVolunteer = async ({ id }) => {
    return await admin.delete(`/page/volunteers/${id}`);
};

export const createFreeTime = async ({ data }) => {
    return await instance.post(`/page/volunteers/availability`, data);
};

export const getFreeTime = async () => {
    return await instance.get(`/page/volunteers/availability`);
};





