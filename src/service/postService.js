import axiosInstance from "./axiosService";

const postService = {
    createPost: async (postData) => {
        const response = await axiosInstance.post('/post', postData);  
        return response;
    },
    getPostusers: async (userId) => {
        const response = await axiosInstance.get(`/post/${userId}`);
        return response;
    }
};
export default postService;