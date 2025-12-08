import axiosInstance from "./axiosService";

const authService = {
    login: async (email, password) => {
        const response = await axiosInstance.post('/auth', { email, password });
        return response;
    },
    resendOTP: async (email) => {
        const response = await axiosInstance.post('/auth/send-otp', { email });
        return response;
    },
    loginWithOTP: async (email, code) => {
        const response = await axiosInstance.post('/auth/2fa', { email, code });
        return response;
    },
    signup: async (email, password) => {
        const response = await axiosInstance.post('/auth/register', { email, password });
        return response;
    },
    refreshToken: async (refreshToken) => {
        const response = await axiosInstance.post('/auth/refresh', { refreshToken });
        return response;
    },
    forgetPass: async (email) => {
        const response = await axiosInstance.post('/auth/forgot', { email });
        return response;
    }
};
export default authService;