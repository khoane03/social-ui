import axiosInstance from "./axiosService";

const conversationService = {
    getConversations: async (id) => {
        const response = await axiosInstance.get(`/conversation/${id}`);
        return response;
    }, 
    createConversation: async (formData) => {
        const response = await axiosInstance.post('/conversation', formData);
        return response;
    },
    deleteConversation: async (data) => {
        const response = await axiosInstance.delete('/conversation', {data});
        return response;
    }
};

export default conversationService; 