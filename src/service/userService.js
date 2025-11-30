import { del } from "motion/react-client";
import axiosInstance from "./axiosService";

const userService = {
    getUserLogin: async () => {
        const response = await axiosInstance.get('/user');
        return response;
    },
    getUserByAccount: async (id) => {
        const response = await axiosInstance.get(`/user/acc/${id}`);
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
    },
    searchUser: async (keyword) => {
        const response = await axiosInstance.get('/user/search', {params: {keyword}});
        return response;
    },
    getUserById: async (id) => {
        const response = await axiosInstance.get(`/user/${id}`);
        return response;
    },
    createUserIdentity: async (identityData) => {
        const response = await axiosInstance.post('/user-identity', identityData);
        return response;
    },
    getIdentity: async () => {
        const response = await axiosInstance.get('/user-identity');
        return response;
    },
    getIdentityById: async () => {
        const response = await axiosInstance.get(`/user-identity/me`);
        return response;
    },
    updateUserIdentity: async (identityData) => {
        const response = await axiosInstance.put(`/user-identity`, identityData);
        return response;
    },
    updateUserIdentityByAdmin: async (identityData) => {
        const response = await axiosInstance.put(`/user-identity/admin`, identityData);
        return response;
    },
    deleteUserIdentity: async (id) => {
        const response = await axiosInstance.delete(`/user-identity/${id}`);
        return response;
    },
};
export default userService;