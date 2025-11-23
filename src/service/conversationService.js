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
    },
    leaveAndKickGroup: async (data) => {
        const response = await axiosInstance.put('/conversation/leave', data);
        return response;
    },
    addMembersToGroup: async (data) => {
        const response = await axiosInstance.put('/conversation/add-member', {data});
        return response;
    },
    updateConversation: async (formData) => {
        const response = await axiosInstance.put('/conversation', formData);
        return response;
    }
};

export default conversationService; 