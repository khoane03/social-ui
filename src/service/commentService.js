import axiosInstance from "./axiosService";

const commentService = {
    addComment: async (commentData) => {
        const response = await axiosInstance.post('/comment', commentData);
        return response;
    },
    getComments: async (postId) => {
        const response = await axiosInstance.get(`/comment/${postId}`);
        return response;
    },
    getRepliesByComment: async (id) => {
        const response = await axiosInstance.get(`/comment/replies/${id}`);
        return response;
    }
};

export default commentService;