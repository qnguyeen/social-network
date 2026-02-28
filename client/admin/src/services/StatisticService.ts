import instance from "./instance"

export const getUsers = async () => {
    return await instance.get(`/statistics/users/all`)
}

export const getGroupGeneral = async () => {
    return await instance.get(`/statistics/groups/all`)
}

export const getPostGeneral = async () => {
    return await instance.get(`/statistics/posts/all`)
}

export const getCampaignGeneral = async () => {
    return await instance.get(`/statistics/campaign/summary`)
}

export const getDonationGeneral = async () => {
    return await instance.get(`/statistics/donations/all`)
}

export const getTop10Group = async () => {
    return await instance.get(`/statistics/groups/top10`)
}

export const getStatsByDate = async () => {
    return await instance.get(`/statistics/campaign/date-range`)
}

export const getCampaignAverageTimeFinish = async () => {
    return await instance.get(`/statistics/campaign/completion-duration`)
}

export const getTop10ByTargetAmount = async () => {
    return await instance.get(`/statistics/campaign/top-amount-campaigns`)
}

export const getDonationStatisticsForToday = async () => {
    return await instance.get(`/statistics/donations/today`)
}

export const getAverageCampaignCompletionTime = async () => {
    return await instance.get(`/statistics/donations/today`)
}

export const getDonationStatisticsForThisMonth = async () => {
    return await instance.get(`/statistics/donations/this-month`)
}

export const getDonationStatisticsForThisYear = async () => {
    return await instance.get(`/statistics/donations/this-year`)
}

export const getUserRegisterByTime = async ({startDate, endDate}) => {
    return await instance.get(`/statistics/users/chart?start=${startDate}&end=${endDate}`)
}