import { message } from 'antd';
import axios from 'axios';
import { baseURL } from '~/utils';

let access = axios.create({
    baseURL: baseURL
});

access.interceptors.request.use((config) => {
    return config;
}, (error) => {
    return Promise.reject(error);
});

access.interceptors.response.use(
    async (response) => {
        return response.data;
    },
    async (error) => {

        if (error.response?.status !== 410) {
            if (error.response?.data?.message === "Unauthenticated") {
                message.warning({ content: "Tên tài khoản hoặc mật khẩu không đúng" })
            } else if (error.response?.data?.code === 1035) {
                message.warning({ content: "Vui lòng đợi 3 phút trước khi yêu cầu OTP khác" })
            } else {
                message.error({ content: error.response?.data?.message || "Something went wrong!" })
            }

        }

        return Promise.reject(error);
    }
);


export default access;