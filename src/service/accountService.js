import axiosInstance from "./axiosService";

const accountService = {
    getAccountLogin: async () => {
        const response = await axiosInstance.get('/account');
        return response;
    },
    changePass: async (data) => {
        const response = await axiosInstance.put('/account/change-pass', data);
        return response;
    },
    twoFA: async (id) => {
        const response = await axiosInstance.put(`/account/two-factor-auth/${id}`);
        return response;
    },
    statisticalAccounts: async () => {
        const response = await axiosInstance.get('/account/statistical');
        return response;
    },
    getAllAccounts: async () => {
        const response = await axiosInstance.get('/account/all');
        return response;
    },
    updateAccountStatus: async (accountId) => {
        const response = await axiosInstance.put(`/account/change-status/${accountId}`);
        return response;
    },
};

export default accountService;