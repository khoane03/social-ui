import { AddComment } from "../components/comment/AddComment";
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
    },
    checkReaction: async (postId) => {
        const response = await axiosInstance.get(`/reaction/check/${postId}`);
        return response;
    },

    // comment
    addComment: async (commentData) => {
        const response = await axiosInstance.post(`/comment`, commentData);
        return response;
    },
    updateComment: async (commentData) => {
        const response = await axiosInstance.put(`/comment`, commentData);
        return response;
    },
    getCommentsByPost: async (postId) => {
        const response = await axiosInstance.get(`/comment/${postId}` );
        return response;
    },
    getCommentByPrarent: async (parentId, page, size) => {
        const response = await axiosInstance.get(`comment/replies/${parentId}`, { params: { page, size } });
        return response;
    },
    deleteComment: async (commentId) => {
        const response = await axiosInstance.delete(`/comment/${commentId}`);
        return response;
    }
};
export default actionService;