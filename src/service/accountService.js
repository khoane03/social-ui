import axiosInstance from "./axiosService";

const accountService = {
    getAccountLogin: async () => {
        const response = await axiosInstance.get('/account');
        return response;
    },
    changePass: async (data) => {
        console.log(data)
        const response = await axiosInstance.put('/account/change-pass', data);
        return response;
    },
    twoFA: async (id) => {
        const response = await axiosInstance.put(`/account/two-factor-auth/${id}`);
        return response;
    },
};

export default accountService;