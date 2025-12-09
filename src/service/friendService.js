import axiosInstance from "./axiosService";

const friendService = {
    getFriendsList: async (page, size, id) => {
        const response = await axiosInstance.get(`/friend/${id}`, { params: { page, size } });
        return response;
    },
    getFriendBlockList: async (page, size, id) => {
        const response = await axiosInstance.get(`/friend/${id}/block`, { params: { page, size } });
        return response;
    },
    getFriendRequests: async (page, size, id) => {
        const response = await axiosInstance.get(`/friend/${id}/request`, { params: { page, size } });
        return response;
    },
    getSuggestedFriends: async (page, size) => {
        const response = await axiosInstance.get('/friend/suggestion', { params: { page, size } });
        return response;
    },
    checkFriendStatus: async (id) => {
        const response = await axiosInstance.get(`/friend/check/${id}`);
        return response;
    },
    checkFriend: async (id) => {
        const response = await axiosInstance.get(`/friend/check-friend/${id}`);
        return response;
    },
    sendFriendRequest: async (id) => {
        const response = await axiosInstance.post(`/friend/${id}`);
        return response;
    },
    acceptFriendRequest: async (id) => {
        console.log("friendService: acceptFriendRequest called with id:", id);
        const response = await axiosInstance.post(`/friend/${id}/accept`);
        return response;
    },
    unFriend: async (id) => {
        const response = await axiosInstance.post(`/friend/${id}/reject`);
        return response;
    },
    blockFriend: async (id) => {
        const response = await axiosInstance.post(`/friend/${id}/block`);
        return response;
    },
    unBlockFriend: async (id) => {
        const response = await axiosInstance.post(`/friend/${id}/unblock`);
        return response;
    }
};

export default friendService;   