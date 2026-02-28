import instance from ".";

export const createPost = async ({ data }) => {
    const formData = new FormData
    formData.append("request", JSON.stringify(data.request));
    if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
            formData.append("files", file);
        });
    } else {
        formData.append('files', new Blob([]));
    }

    return await instance.post(`/post/group/post-file`, formData);
};

export const getAllPosts = async ({ id, page, size }) => {
    return await instance.get(`/post/group/all?page=${page}&size=${size}&groupId=${id}`)
}

export const changeVisibility = async ({ groupId, newVisibility }) => {
    return await instance.patch(`/identity/groups/${groupId}/visibility?newVisibility=${newVisibility}`)
}

export const getAllGroup = async ({ page, size }) => {
    return await instance.get(`/identity/groups/all?page=${page}&size=${size}`)
}

export const getMembersInGroup = async ({ groupId }) => {
    return await instance.get(`/identity/groups/${groupId}/members`)
}

export const getUserPosts = async ({ userId, groupId }) => {
    return await instance.get(`/post/group/all?page=${page}&size=${size}&userId=${userId}&groupId=${groupId}`)
}

export const createGroup = async ({ data }) => {
    return await instance.post(`/identity/groups`, data);
};

export const changeMemberRole = async ({ groupId, memberId, newRole }) => {
    return await instance.patch(`/identity/groups/${groupId}/changeMemberRole?memberId=${memberId}&newRole=${newRole}`);
};

export const deleteMember = async ({ groupId, userId }) => {
    return await instance.delete(`/identity/groups/${groupId}/members/${userId}`);
};

export const getDetailGroup = async ({ id }) => {
    return await instance.get(`/identity/groups/${id}`);
};

export const deletePost = async ({ postId }) => {
    return await instance.delete(`/post/group/${postId}`);
};

export const anonymousMode = async ({ enabled }) => {
    return await instance.patch(`/post/group/anonymous-mode?enabled=${enabled}`);
};

export const getOwnerGroup = async ({ groupId }) => {
    return await instance.get(`/identity/groups/${groupId}/isOwnerOrLeader`);
};

export const addUserToGroup = async ({ userId, groupId }) => {
    return await instance.post(`/identity/groups/${groupId}/members/${userId}`);
};

export const isUserInGroup = async ({ groupId }) => {
    return await instance.get(`/identity/groups/${groupId}/isUserInGroup`);
};




