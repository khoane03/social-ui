import axiosInstance from "./axiosService";

const actionService = {
    likePost: async (postId) => {
        const response = await axiosInstance.post(`/reaction/${postId}`);
        return response;
    },
    countLoves: async (postId) => {
        const response = await axiosInstance.get(`/reaction/count/${postId}`);
        return response;
    },
    getReactionByPost: async (postId) => {
        const response = await axiosInstance.get(`/reaction/${postId}`);
        return response;
    }
};
export default actionService;