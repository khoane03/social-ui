import axiosInstance from "./axiosService";

const chatService = {
    getMessages: async (conversationId) => {
        const response = await axiosInstance.get(`/chat/${conversationId}`);
        return response;
    },
    deleteMessage: async (data) => {
        const response = await axiosInstance.delete('/chat', {data});
        return response;
    },
    sendMessage: async (messageData) => {
        const response = await axiosInstance.post('/chat', messageData);
        return response;
    }
};

export default chatService;