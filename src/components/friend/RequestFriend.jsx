import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Loader2 } from "lucide-react";
import friendService from "../../service/friendService";
import { useAuth } from "../../context/AuthContext";
import { useAlerts } from "../../context/AlertContext";
import { Link } from "react-router";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { ConfirmModal } from "../common/ConfirmModal";

const RequestFriend = () => {
    const { user } = useAuth();
    const { addAlert } = useAlerts();

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

    const openModal = (friend, action) => {
        const configs = {
            accept: {
                title: "Xác nhận chấp nhận kết bạn",
                message: `Bạn có chắc chắn muốn chấp nhận lời mời kết bạn từ ${friend.fullName}?`
            },
            reject: {
                title: "Xác nhận từ chối lời mời kết bạn",
                message: `Bạn có chắc chắn muốn từ chối lời mời kết bạn từ ${friend.fullName}?`
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

            if (action === "accept") {
                await friendService.acceptFriendRequest(friend.id);
                setFriends(prev => prev.filter(f => (f.friendId || f.id) !== (friend.friendId || friend.id)));
                addAlert({
                    type: "success",
                    message: `Đã chấp nhận kết bạn với ${friend.fullName}`
                });
            } else if (action === "reject") {
                await friendService.unFriend(friend.id);
                setFriends(prev => prev.filter(f => (f.friendId || f.id) !== (friend.friendId || friend.id)));
                addAlert({
                    type: "success",
                    message: `Đã từ chối lời mời kết bạn từ ${friend.fullName}`
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
        if (isFetchingRef.current || !user || page > totalPages) return;

        isFetchingRef.current = true;
        setLoading(true);

        try {
            const res = await friendService.getFriendRequests(page, 10, user.id);
            console.log("Fetch page:", page, "Data:", res.data);
            if (res.data && res.data.length > 0) {
                // Lọc duplicate bằng Set dựa vào id
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

    // Infinite scroll
    useInfiniteScroll({
        hasNextPage,
        isLoading: loading,
        threshold: 200,
        onLoadMore: fetchFriends
    });

    // Auto load page đầu tiên khi vào
    useEffect(() => {
        if (user && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchFriends();
        }
    }, [user]);

    return (
        <>
            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={handleConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.action === "accept" ? "Chấp nhận" : "Từ chối"}
            />
            <div className="flex flex-col h-full space-y-4 bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
                <motion.h3
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-semibold"
                >
                    Yêu cầu kết bạn ({friends.length})
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
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <Link
                                                    to={`/profile/${friendId}`}
                                                    className="text-sm font-semibold hover:text-pink-500 transition-colors"
                                                >
                                                    {f.fullName}
                                                </Link>
                                                {f.verified && <BadgeCheck className="text-green-500 w-4 h-4" />}
                                            </div>
                                            <div className="flex gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    disabled={loading}
                                                    onClick={() => openModal(f, "accept")}
                                                    className={`px-3 py-1.5 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity`}
                                                >
                                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xác nhận"}
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    disabled={loading}
                                                    onClick={() => openModal(f, "reject")}
                                                    className={`px-3 py-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity`}
                                                >
                                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Từ chối"}
                                                </motion.button>
                                            </div>
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
                            <p className="text-center text-gray-500 text-sm py-3">
                                Đã hiển thị tất cả bạn bè
                            </p>
                        )}

                        {!loading && friends.length === 0 && (
                            <p className="text-center text-gray-500 text-sm py-3">
                                Chưa có bạn bè nào
                            </p>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default RequestFriend;