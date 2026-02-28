import instance from "."

export const createAdPost = async ({ request }) => {
    const formData = new FormData
    formData.append("request", JSON.stringify(request));
    formData.append("files", new Blob([]));
    return await instance.post(`/donation/ad-campaigns/create`, formData)
}

export const closeAds = async ({ id }) => {
    return await instance.put(`/donation/ad-campaigns/close/${id}`)
}

export const createDonateAd = async ({ data }) => {
    return await instance.post(`/donation/ad-donations`, data)
}

export const getAds = async () => {
    return await instance.put(`/donation/ad-campaigns`)
}




