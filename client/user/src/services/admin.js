import { message } from 'antd';
import axios from 'axios';
import { baseURL, getTokenAdmin } from '~/utils';

let admin = axios.create({
    baseURL: baseURL
});

admin.interceptors.request.use(
    async (config) => {
        const token = getTokenAdmin();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


admin.interceptors.response.use(
    async (response) => {
        return response.data;
    },
    async (error) => {

        if (error.response?.status !== 410) {
            message.open({
                type: "warning",
                content: error.response?.data?.message || "Something went wrong!"
            })
        }

        return Promise.reject(error);
    }
);


export default admin;