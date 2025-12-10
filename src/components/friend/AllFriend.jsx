import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Loader2 } from "lucide-react";
import friendService from "../../service/friendService";
import { useAuth } from "../../context/AuthContext";
import { useAlerts } from "../../context/AlertContext";
import { Link, useParams } from "react-router";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { ConfirmModal } from "../common/ConfirmModal";

const AllFriend = () => {
    const { user } = useAuth();
    const { addAlert } = useAlerts();
    const { id } = useParams();
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        friend: null,
        action: null,
        title: "",
        message: ""
    });
    const hasFetchedRef = useRef(false);
    const isFetchingRef = useRef(false);
    const hasNextPage = page <= totalPages;
    
    // Determine which user ID to use
    const targetUserId = id || user?.id;
    const isOwnProfile = !id || id === user?.id;

    const openModal = (friend, action) => {
        const configs = {
            unfriend: {
                title: "Xác nhận hủy kết bạn",
                message: `Bạn có chắc chắn muốn hủy kết bạn với ${friend.fullName}? Bạn sẽ cần gửi lời mời kết bạn lại nếu muốn kết nối.`
            },
            block: {
                title: "Xác nhận chặn người dùng",
                message: `Bạn có chắc chắn muốn chặn ${friend.fullName}? Người này sẽ không thể xem trang cá nhân, gửi tin nhắn hoặc tương tác với bạn.`
            }
        };

        setModalConfig({
            isOpen: true,
            friend,
            action,
            ...configs[action]
        });
    };

    const closeModal = () => {
        setModalConfig({
            isOpen: false,
            friend: null,
            action: null,
            title: "",
            message: ""
        });
    };

    const handleConfirm = async () => {
        const { friend, action } = modalConfig;
        if (!friend || !action) return;

        try {
            setLoading(true);
            const friendId = friend.friendId || friend.id;

            if (action === "unfriend") {
                await friendService.unFriend(friendId);
                setFriends(prev => prev.filter(f => (f.friendId || f.id) !== friendId));
                addAlert({
                    type: "success",
                    message: `Đã hủy kết bạn với ${friend.fullName}`
                });
            } else if (action === "block") {
                await friendService.blockFriend(friendId);
                setFriends(prev => prev.filter(f => (f.friendId || f.id) !== friendId));
                addAlert({
                    type: "success",
                    message: `Đã chặn ${friend.fullName}`
                });
            }

            closeModal();
        } catch (error) {
            addAlert({
                type: "error",
                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Lỗi hệ thống, vui lòng thử lại!",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchFriends = async () => {
        if (isFetchingRef.current || !targetUserId || page > totalPages) return;

        isFetchingRef.current = true;
        setLoading(true);

        try {
            console.log(`Fetching friends for user ${targetUserId}`);
            const res = await friendService.getFriendsList(page, 10, targetUserId);

            if (res.data && res.data.length > 0) {
                setFriends(prev => {
                    const existingIds = new Set(prev.map(f => f.friendId || f.id));
                    const newFriends = res.data.filter(f => !existingIds.has(f.friendId || f.id));
                    return [...prev, ...newFriends];
                });
                setTotalPages(res.totalPages || 1);
                setPage(prev => prev + 1);
            } else {
                setTotalPages(page - 1);
            }

        } catch (error) {
            addAlert({
                type: "error",
                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Lỗi hệ thống, vui lòng thử lại!",
            });
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    };

    useInfiniteScroll({
        hasNextPage,
        isLoading: loading,
        threshold: 200,
        onLoadMore: fetchFriends
    });

    useEffect(() => {
        // Reset state when userId changes
        if (targetUserId) {
            setFriends([]);
            setPage(1);
            setTotalPages(1);
            hasFetchedRef.current = false;
        }
    }, [targetUserId]);

    useEffect(() => {
        if (targetUserId && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchFriends();
        }
    }, [targetUserId]);

    return (
        <>
            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={handleConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.action === "unfriend" ? "Hủy kết bạn" : "Chặn"}
                loading={loading}
            />

            <div className="flex flex-col h-full space-y-4 bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
                <motion.h3
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-semibold dark:text-white"
                >
                    {isOwnProfile ? "Tất cả bạn bè" : "Bạn bè"} ({friends.length})
                </motion.h3>

                {loading && friends.length === 0 ? (
                    <div className="flex justify-center items-center flex-1">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <>
                        <div className="flex-1 space-y-4">
                            <AnimatePresence mode="popLayout">
                                {friends.map((f) => {
                                    const friendId = f.friendId || f.id;
                                    return (
                                        <motion.div
                                            key={friendId}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                        >
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={f.avatarUrl || "/default.png"}
                                                    alt={f.fullName}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                                                />
                                                <Link
                                                    to={`/profile/${friendId}`}
                                                    className="text-sm font-semibold hover:text-pink-500 dark:text-white transition-colors"
                                                >
                                                    {f.fullName}
                                                </Link>
                                                {f.verified && <BadgeCheck className="text-green-500 w-4 h-4" />}
                                            </div>
                                            
                                            {/* Only show action buttons on own profile */}
                                            {isOwnProfile && (
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        disabled={loading || modalConfig.isOpen}
                                                        onClick={() => openModal(f, "unfriend")}
                                                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                                    >
                                                        Hủy kết bạn
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        disabled={loading || modalConfig.isOpen}
                                                        onClick={() => openModal(f, "block")}
                                                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 text-white text-sm rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                                    >
                                                        Chặn
                                                    </motion.button>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {loading && friends.length > 0 && (
                            <div className="text-center py-3">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500 mx-auto" />
                            </div>
                        )}

                        {!hasNextPage && friends.length > 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-3">
                                Đã hiển thị tất cả bạn bè
                            </p>
                        )}

                        {!loading && friends.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-3">
                                Chưa có bạn bè nào
                            </p>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default AllFriend;