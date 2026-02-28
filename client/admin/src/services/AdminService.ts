import auth from "@/services/auth"
import instance from "./instance"
import axios from "axios"

export const getDetailUserByUserId = async ({ id }: {id: string}) => {
    return await instance.get(`/identity/users/${id}`)
}

export const getLoginHistoryOfUser = async ({ id, page, size }: {id: string, page: number, size: number}) => {
    return await instance.get(`/identity/login-history/user/${id}?page=${page}&size=${size}`)
}

export const createUser = async (data) => {
    return await auth.post(`/identity/users/registration`, data)
}

export const closeCampaign = async ({ id }) => {
    return await instance.put(`/donation/campaigns/close/${id}`);
}

export const updateUserInformation = async (data) => {
    return await instance.patch(`/identity/users/my-profile`, data)
}

export const setAvatar = async ({ userId,data }) => {
    const formData = new FormData
    formData.append("imageFile", data?.file);
    return await instance.put(`/profile/${userId}`, formData)
}

export const deleteUser = async (id: string) => {
    return await instance.delete(`/identity/users/admin/delete/${id}`)
}

export const lockUser = async ({userId}: {userId: string}) => {
    return await instance.post(`/identity/users/admin/${userId}/lock`)
}

export const unlockUser = async ({userId}: {userId: string}) => {
    return await instance.post(`/identity/users/admin/${userId}/unlock`)
}

export const changePasswordForUser = async (data) => {
    return await instance.post(`/identity/users/admin/change-password`, data)
}

export const getAllUsers = async ({page, size}: {page: number, size:number}) => {
    return await instance.get(`/identity/users?page=${page}&size=${size}`)
}

export const getAllCampaign = async () => {
    return await instance.get(`/donation/campaigns`)
}

export const getAllPosts = async ({page, size}: {page: number, size:number}) => {
    return await instance.get(`/post/all?page=${page}&size=${size}`)
}

export const createPost = async ({ data }) => {
    const formData = new FormData
    formData.append("request", JSON.stringify(data.request));
    if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
            formData.append("files", file);
        });
    } else {
        const emptyFile = new File([""], "empty.txt", { type: "text/plain" });
        formData.append('files', emptyFile);
    }
    return await instance.post(`/post/post-file`, formData);
};

export const deletePost = async (id: string) => {
    return await instance.delete(`/post/${id}`)
}

export const getAllStories = async ({page}: {page: number}) => {
    return await axios.get(`http://localhost:8888/api/v1/post/stories?page=${page}&size=10`, {
        headers: {
      Authorization: `Bearer ${import.meta.env.VITE_TOKEN}`,
    },
    })
}

export const createStory = async (data) => {
    const formData = new FormData
    formData.append("request", JSON.stringify(data.request));
    if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
            formData.append("files", file);
        });
    } else {
        formData.append('files', new Blob([]));
    }
    return await instance.post(`/post/stories`, formData)
}

export const getAllRoles = async () => {
    return await instance.get(`/identity/roles`)
}

export const createRole = async (data) => {
    return await instance.post(`/identity/roles`, data)
}

export const deleteRole = async ({role}: {role: any}) => {
    return await instance.delete(`/identity/roles/${role}`)
}

export const getAllPermissions = async () => {
    return await instance.get(`/identity/permissions`)
}

export const deletePermission = async () => {
    return await instance.delete(`/identity/permissions`)
}

export const createGroup = async ({ data }) => {
    return await instance.post(`/identity/groups`, data);
};

export const createPermission = async () => {
    return await instance.post(`/identity/permissions`)
}

export const getAllGroups = async ({ page, size }: {page: number, size:number}) => {
    return await instance.get(`/identity/groups/all?page=${page}&size=${size}`)
}

export const getHistoryPosts = async ({ page, size }: {page: number, size:number}) => {
    return await instance.get(`/post/history?page=${page}&size=${size}`)
}

