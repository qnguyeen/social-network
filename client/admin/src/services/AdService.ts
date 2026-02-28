import instance from "./instance"

export const createAdByAdmin = async ({data}) => {
    return await instance.post(`/donation/main-ad-campaigns`, data)
}

export const getListAds = async () => {
    return await instance.get(`/donation/ad-campaigns`)
}

export const closeAd = async ({id}) => {
    return await instance.put(`/donation/ad-campaigns/close/${id}`)
}