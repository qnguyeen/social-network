import access from "~/services/access"
import instance from "."
import admin from "~/services/admin"

export const loginAdmin = async () => {
    return await access.post(`/identity/auth/token`, {
        username: "admin",
        password: "admin"
    })
}

export const deleteUser = async (id) => {
    return await instance.delete(`/identity/users/admin/delete/${id}`)
}

export const getAllUsers = async () => {
    return await instance.get(`/identity/users?page=0&size=10`)
}

export const getAllPosts = async () => {
    return await instance.get(`/post/all?page=1&size=10`)
}

export const getAllAdsPosts = async () => {
    return await admin.get(`/donation/ad-campaigns`)
}

export const getAllGroups = async ({ page, size }) => {
    return await instance.get(`/identity/groups/all?page${page}&size=${size}`)
}

export const getHistoryPosts = async ({ page, size }) => {
    return await instance.get(`/post/history?page=${page}&size=${size}`)
}