import axiosInstance from "./axiosService";

const chatService = {
    getMessages: async (conversationId) => {
        const response = await axiosInstance.get(`/chat/${conversationId}`);
        return response;
    },
};

export default chatService;