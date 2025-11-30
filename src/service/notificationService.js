import axiosInstance from "./axiosService";

const notificationService = {
    getNotifications: async (id, page, size) => {
        const response = await axiosInstance.get(`/notification/${id}`, {
            params: { page, size }
        });
        return response;
    },
    countUnRead: async (id) => {
        const response = await axiosInstance.get(`/notification/count/${id}`);
        return response;
    },
    markAsRead: async (notificationId) => {
        const response = await axiosInstance.put(`/notification/${notificationId}`);
        return response;
    },
    deleteNotification: async (notificationId) => {
        const response = await axiosInstance.delete(`/notification/${notificationId}`);
        return response;
    },
    deleteAllNotifications: async (userId) => {
        const response = await axiosInstance.delete(`/notification/all/${userId}`);
        return response;
    }
};
export default notificationService;