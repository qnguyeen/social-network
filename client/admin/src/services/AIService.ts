import auth from "@/services/auth"
import instance from "@/services/instance"



export const ask = async (data: any) => {
    return await auth.post(`/Ai/api/v1/gemini/ask`, data)
}

export const handle = async (data) => {
    return await instance.post(`/admin/ai/handle`, data)
}