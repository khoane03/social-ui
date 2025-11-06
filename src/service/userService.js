import { create } from "motion/react-m";
import axiosInstance from "./axiosService";

const userService = {
    getUserLogin: async () => {
        const response = await axiosInstance.get('/user');
        return response;
    },
    createUserProfile: async (profileData) => {
        const response = await axiosInstance.post('/user', profileData);
        return response;
    },
    updateUserProfile: async (id, profileData) => {
        const response = await axiosInstance.put(`/user/${id}`, profileData);
        return response;
    },
    uploadImage: async (params) => {
        const response = await axiosInstance.put('/user/image', params);
        return response;
    }
};
export default userService;