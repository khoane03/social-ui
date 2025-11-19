import axiosInstance from "./axiosService";

const conversationService = {
    deleteConversation: async (data) => {
        const response = await axiosInstance.delete('/conversation', data);
        return response;
    }
};

export default conversationService; 