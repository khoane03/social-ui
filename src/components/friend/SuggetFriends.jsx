import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Loader2 } from "lucide-react";
import friendService from "../../service/friendService";
import { useAuth } from "../../context/AuthContext";
import { useAlerts } from "../../context/AlertContext";
import { Link } from "react-router";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { ConfirmModal } from "../common/ConfirmModal";

const SuggetFriends = () => {
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
    const containerRef = useRef(null);
    const hasNextPage = page <= totalPages;
    const hasFetchedRef = useRef(false);
    const isFetchingRef = useRef(false);

    const openModal = (friend, action) => {
        const configs = {
            request: {
                title: "Xác nhận gửi lời mời kết bạn",
                message: `Bạn có chắc chắn muốn gửi lời mời kết bạn đến ${friend.fullName}?`
            },
            block: {
                title: "Xác nhận chặn người dùng",
                message: `Bạn có chắc chắn muốn chặn ${friend.fullName}? Người này sẽ không thể xem trang cá nhân, gửi tin nhắn hoặc tương tác với bạn.`
            },
            cancelRequest: {
                title: "Hủy yêu cầu kết bạn",
                message: `Bạn có chắc chắn muốn hủy yêu cầu kết bạn với ${friend.fullName}?`
            },
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

            if (action === "request") {
                await friendService.sendFriendRequest(friendId);
                setFriends((prev) =>
                    prev.map((f) =>
                        (f.friendId || f.id) === friendId ? { ...f, pending: true } : f
                    )
                );
                addAlert({
                    type: "success",
                    message: `Đã gửi lời mời kết bạn đến ${friend.fullName}`
                });
            } else if (action === "block") {
                await friendService.blockFriend(friendId);
                setFriends(prev => prev.filter(f => (f.friendId || f.id) !== friendId));
                addAlert({
                    type: "success",
                    message: `Đã chặn ${friend.fullName}`
                });
            } else if (action === "cancelRequest") {
                await friendService.sendFriendRequest(friendId);
                setFriends((prev) =>
                    prev.map((f) =>
                        (f.friendId || f.id) === friendId ? { ...f, pending: false } : f
                    )
                );
                addAlert({
                    type: "success",
                    message: `Đã hủy yêu cầu kết bạn với ${friend.fullName}`
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
            const res = await friendService.getSuggestedFriends(page, 10);

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
            console.error("Fetch error:", error);
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
        threshold: 100,
        onLoadMore: fetchFriends,
        containerRef
    });

    useEffect(() => {
        if (user && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchFriends();
        }
    }, [user]);

    const getButtonConfig = (friend) => {
        if (friend.pending) {
            return {
                text: "Hủy yêu cầu",
                action: "cancelRequest",
                className: "bg-yellow-500 hover:bg-yellow-600"
            };
        }
        return {
            text: "Kết bạn",
            action: "request",
            className: "bg-green-500 hover:bg-green-600"
        };
    };

    const getConfirmText = (action) => {
        switch (action) {
            case "request":
                return "Gửi lời mời";
            case "cancelRequest":
                return "Hủy yêu cầu";
            case "block":
                return "Chặn";
            default:
                return "Xác nhận";
        }
    };

    const getConfirmStyle = (action) => {
        switch (action) {
            case "request":
                return "success";
            case "cancelRequest":
                return "warning";
            case "block":
                return "danger";
            default:
                return "primary";
        }
    };

    return (
        <>
            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={handleConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={getConfirmText(modalConfig.action)}
                confirmStyle={getConfirmStyle(modalConfig.action)}
                loading={loading}
            />
            <div className="flex flex-col h-full space-y-4 bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
                <motion.h3
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-semibold dark:text-white"
                >
                    Gợi ý kết bạn
                </motion.h3>

                {loading && friends.length === 0 ? (
                    <div className="flex justify-center items-center flex-1">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div
                        ref={containerRef}
                        className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-2"
                        style={{ scrollbarWidth: 'thin' }}
                    >
                        <AnimatePresence mode="popLayout">
                            {friends.map((f) => {
                                const friendId = f.friendId || f.id;
                                const buttonConfig = getButtonConfig(f);
                                
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
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                disabled={loading || modalConfig.isOpen}
                                                onClick={() => openModal(f, buttonConfig.action)}
                                                className={`px-3 py-1.5 text-white text-sm rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md ${buttonConfig.className}`}
                                            >
                                                {buttonConfig.text}
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
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {loading && friends.length > 0 && (
                            <div className="text-center py-3">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500 mx-auto" />
                            </div>
                        )}

                        {!hasNextPage && friends.length > 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-3">
                                Đã hiển thị tất cả gợi ý
                            </p>
                        )}

                        {!loading && friends.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-3">
                                Không có gợi ý kết bạn
                            </p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default SuggetFriends;