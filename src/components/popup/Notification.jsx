import { X, Trash2, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import notificationService from "../../service/notificationService";
import { useAlerts } from "../../context/AlertContext";
import { useWebsocket } from "../../context/WsContext";
import { useNavigate } from "react-router";

export const Notification = ({ onRead, onRefresh }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const isMountedRef = useRef(true);
  const loadedRef = useRef(false);
  const subscriptionRef = useRef(null);
  const scrollRef = useRef(null);

  const { user } = useAuth();
  const { addAlert } = useAlerts();
  const { subscribeNotify, notifyConnected } = useWebsocket();
  const navigate = useNavigate();

  const PAGE_SIZE = 10;

  const loadNotifications = useCallback(async (page = 1, append = false) => {
    if (!user?.id) return;

    const loadingState = page === 1 ? setIsLoading : setIsLoadingMore;
    loadingState(true);

    try {
      const res = await notificationService.getNotifications(user.id, page, PAGE_SIZE);
      const newNotifications = res.data.data || [];
      const total = res.data.totalPages || 0;

      setTotalPages(total);
      setHasMore(page < total);

      if (append) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }
    } catch (error) {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Lỗi hệ thống",
      });
    } finally {
      loadingState(false);
    }
  }, [user?.id, addAlert]);

  // Initial load
  useEffect(() => {
    if (!user?.id || loadedRef.current) return;

    loadedRef.current = true;
    loadNotifications(1, false);
  }, [user?.id, loadNotifications]);

  // WebSocket subscription
  useEffect(() => {
    if (!notifyConnected || !user?.id) return;

    const topic = `/topic/notification/${user.id}`;
    const subscription = subscribeNotify(topic, (payload) => {
      if (!isMountedRef.current) return;
      
      setNotifications((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload, ...prev];
      });
      
      // Notify parent to update badge
      if (onRefresh) {
        onRefresh();
      }
    });

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe?.();
        subscriptionRef.current = null;
      }
    };
  }, [notifyConnected, user?.id, subscribeNotify, onRefresh]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Load more when scrolled 80%
    if (scrollPercentage > 0.8) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadNotifications(nextPage, true);
    }
  }, [currentPage, hasMore, isLoadingMore, loadNotifications]);

  // Attach scroll listener
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Component mount tracking
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const formatTime = useCallback((date) => {
    if (!date) return "";

    const updatedDate = new Date(date);
    const now = new Date();
    const diffMs = now - updatedDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffHours < 48) return "Hôm qua";

    return updatedDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  const handleDeleteNotification = useCallback(
    async (e, notificationId) => {
      e.stopPropagation();
      try {
        await notificationService.deleteNotification(notificationId);
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );
        addAlert({
          type: "success",
          message: "Đã xoá thông báo!",
        });
      } catch (error) {
        addAlert({
          type: "error",
          message: error?.response?.data?.message || error?.message || "Lỗi hệ thống",
        });
      }
    },
    [addAlert]
  );

  const handleReadNotification = useCallback(async (notificationId, isRead) => {
    if (isRead) return;

    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Notify parent to update badge
      if (onRead) {
        onRead();
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  }, [onRead]);

  const handleClickNotification = useCallback(
    (notification) => {
      handleReadNotification(notification.id, notification.isRead);

      if (notification?.target?.link) {
        navigate(notification.target.link);
      }
    },
    [handleReadNotification, navigate]
  );

  const handleDeleteAllNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      await notificationService.deleteAllNotifications(user.id);
      setNotifications([]);
      addAlert({
        type: "success",
        message: "Đã xoá tất cả thông báo!",
      });
      
      // Notify parent to update badge
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Lỗi hệ thống",
      });
    }
  }, [user?.id, addAlert, onRefresh]);

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center h-32 text-gray-500"
        >
          <p className="text-sm">Bạn không có thông báo mới</p>
        </motion.div>
      );
    }

    return (
      <>
        <ul className="space-y-3">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification, index) => (
              <motion.li
                key={index}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                onClick={() => handleClickNotification(notification)}
                className={`p-3 rounded-xl shadow hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-start group ${
                  !notification.isRead
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                    : "bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700"
                }`}
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    {!notification.isRead && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"
                      />
                    )}
                    <p className="text-gray-800 dark:text-white text-sm leading-relaxed break-words">
                      {notification.message}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-4">
                    {formatTime(notification?.createAt)}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleDeleteNotification(e, notification.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded ml-2 flex-shrink-0"
                >
                  <X size={16} className="text-gray-400 hover:text-red-500" />
                </motion.button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {/* Loading more indicator */}
        {isLoadingMore && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-4"
          >
            <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
          </motion.div>
        )}

        {/* End of list indicator */}
        {!hasMore && notifications.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4 text-xs text-gray-500 dark:text-gray-400"
          >
            Đã hiển thị tất cả thông báo
          </motion.div>
        )}
      </>
    );
  }, [
    notifications,
    isLoading,
    isLoadingMore,
    hasMore,
    formatTime,
    handleClickNotification,
    handleDeleteNotification,
  ]);

  return (
    <motion.div
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute top-0 left-[80px] h-full w-80 rounded-r-2xl bg-white dark:bg-zinc-900 z-20 shadow-2xl"
    >
      <div className="flex flex-col h-full w-full rounded-r-2xl text-gray-800 dark:text-white border-r border-gray-200 dark:border-zinc-800">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-shrink-0 px-4 py-4 border-b border-gray-200 dark:border-zinc-800"
        >
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold">Thông báo</h1>
            {notifications.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeleteAllNotifications}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={14} />
                <span>Xoá tất cả</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Scrollable content */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-zinc-600"
        >
          {content}
        </div>
      </div>
    </motion.div>
  );
};