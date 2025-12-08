import axiosInstance from "./axiosService";

const postService = {
    createPost: async (postData) => {
        const response = await axiosInstance.post('/post', postData);  
        return response;
    },
    getByPostId: async (id) => {
        const response = await axiosInstance.get(`/post/${id}`);
        return response;
    },
    getPostusers: async (userId, page, size) => {
        const response = await axiosInstance.get(`/post/author/${userId}`, { params: { page, size } });
        return response;
    },
    getAllPosts: async (page, size) => {
        const response = await axiosInstance.get('/post/public', { params: { page, size } });
        return response;
    },
    getPostFriends: async (page, size) => {
        const response = await axiosInstance.get('/post/friend', { params: { page, size } });
        return response;
    },
    getByAdmin: async (page, size) => {
        const response = await axiosInstance.get('/post/admin', { params: { page, size } });
        return response;
    },
    updatePost: async (postData) => {
        const response = await axiosInstance.put('/post', postData);
        return response;
    },
    countPostByMonth: async () => {
        const response = await axiosInstance.put('/post/statistical');
        return response;
    },
    countAll: async () => {
        const response = await axiosInstance.get('/post/count-all');
        return response;
    },
    countByAuthor: async (id) => {
        const response = await axiosInstance.get(`/post/count/${id}`);
        return response;
    },
    deletePost: async (postId) => {
        const response = await axiosInstance.delete(`/post/${postId}`);
        return response;
    },
};
export default postService;