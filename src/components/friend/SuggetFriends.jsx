import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Loader2 } from "lucide-react";
import friendService from "../../service/friendService";
import { useAuth } from "../../context/AuthContext";
import { useAlerts } from "../../context/AlertContext";
import { Link } from "react-router";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";

const SuggetFriends = () => {
    const { user } = useAuth();
    const { addAlert } = useAlerts();

    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const containerRef = useRef(null);
    const hasNextPage = page <= totalPages;
    const hasFetchedRef = useRef(false);
    const isFetchingRef = useRef(false);

    const fetchFriends = async () => {
        if (isFetchingRef.current || !user || page > totalPages) return;

        isFetchingRef.current = true;
        setLoading(true);

        try {
            const res = await friendService.getSuggestedFriends(page, 10);
            console.log("Fetch page:", page, "Data:", res.data);

            if (res.data && res.data.length > 0) {
                // Lọc duplicate
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

    // Infinite scroll với containerRef
    useInfiniteScroll({
        hasNextPage,
        isLoading: loading,
        threshold: 100,
        onLoadMore: fetchFriends,
        containerRef
    });

    // Load page đầu tiên khi mount
    useEffect(() => {
        if (user && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchFriends();
        }
    }, [user]);

    return (
        <div className="flex flex-col h-full space-y-4 bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
            <motion.h3
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-semibold"
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
                        <p className="text-center text-gray-500 text-sm py-3">
                            Đã hiển thị tất cả gợi ý
                        </p>
                    )}

                    {!loading && friends.length === 0 && (
                        <p className="text-center text-gray-500 text-sm py-3">
                            Không có gợi ý kết bạn
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SuggetFriends;