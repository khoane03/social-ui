import axiosInstance from "./axiosService";

const chatService = {
    getMessages: async (conversationId) => {
        const response = await axiosInstance.get(`/chat/${conversationId}`);
        return response;
    },
    deleteMessage: async (data) => {
        console.log('Deleting message with data:', data);
        const response = await axiosInstance.delete('/chat', {data});
        return response;
    }
};

export default chatService;