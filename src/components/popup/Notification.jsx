import { X, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import notificationService from "../../service/notificationService";
import { useAlerts } from "../../context/AlertContext";
import { useWebsocket } from "../../context/WsContext";

export const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  const { user } = useAuth();
  const { addAlert } = useAlerts();
  const { subscribeNotify, notifyConnected } = useWebsocket();

  const loadedRef = useRef(false);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!user?.id || loadedRef.current) return;

    loadedRef.current = true;

    const loadNotifications = async () => {
      setIsLoading(true);
      try {
        const res = await notificationService.getNotifications(user.id);
        setNotifications(res.data.data || []);
      } catch (error) {
        addAlert({
          type: "error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Lỗi hệ thống"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [user?.id, addAlert]);


  // Subscribe to real-time notifications
  useEffect(() => {
    if (!notifyConnected || !user?.id) return;

    let subscription = null;

    const topic = `/topic/notification/${user.id}`;
    subscription = subscribeNotify(topic, (payload) => {
      if (!isMountedRef.current) return;
      setNotifications(prev => {
        if (prev.some(n => n.id === payload.id)) return prev;
        return [payload, ...prev];
      });
    });

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe?.();
        subscriptionRef.current = null;
      }
    };
  }, [notifyConnected, user?.id, subscribeNotify]);



  const formatTime = useCallback((date) => {
    if (!date) return "";

    const updatedDate = new Date(date);
    const now = new Date();
    const diffMs = now - updatedDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) {
      return "Vừa xong";
    } else if (diffMins < 60) {
      return `${diffMins} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffHours < 48) {
      return "Hôm qua";
    } else {
      return updatedDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }, []);

  const handleDeleteNotification = useCallback(async (e, notificationId) => {
    e.stopPropagation();

    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
      addAlert({
        type: "success",
        message: "Đã xóa thông báo!",
      });
    } catch (error) {
      addAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi hệ thống"
      });
    }
  }, [addAlert]);

  const handleReadNotification = useCallback(async (notificationId, isRead) => {
    if (isRead) return; // Already read, skip

    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      addAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi hệ thống"
      });
    }
  }, []);

  const handleDeleteAllNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      await notificationService.deleteAllNotifications(user.id);
      setNotifications([]);
      addAlert({
        type: "success",
        message: "Đã xóa tất cả thông báo!",
      });
    } catch (error) {
      addAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi hệ thống"
      });
    }
  }, [user?.id, addAlert]);

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-gray-500">
          <p className="text-sm">Bạn không có thông báo mới</p>
        </div>
      );
    }

    return (
      <ul className="space-y-3">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <motion.li
              key={notification.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleReadNotification(notification.id, notification.isRead)}
              className={`p-3 rounded-xl shadow hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-start group ${!notification.isRead
                ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                : "bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700"
                }`}
            >
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  )}
                  <p className="text-gray-800 dark:text-white text-sm leading-relaxed break-words">
                    {notification.message}
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-4">
                  {formatTime(notification?.createAt)}
                </span>
              </div>
              <button
                onClick={(e) => handleDeleteNotification(e, notification.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded ml-2 flex-shrink-0"
                aria-label="Xóa thông báo"
              >
                <X
                  size={16}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    );
  }, [notifications, isLoading, formatTime, handleReadNotification, handleDeleteNotification]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  return (
    <motion.div
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      exit={{ x: -320 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute top-0 left-[80px] h-full w-80 rounded-r-2xl bg-white dark:bg-zinc-900 z-20 shadow-2xl"
    >
      <div className="flex flex-col h-full w-full rounded-r-2xl text-gray-800 dark:text-white border-r border-gray-200 dark:border-zinc-800">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold">Thông báo</h1>
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAllNotifications}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label="Xóa tất cả thông báo"
              >
                <Trash2 size={14} />
                <span>Xóa tất cả</span>
              </button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {unreadCount} thông báo chưa đọc
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700">
          {content}
        </div>
      </div>
    </motion.div>
  );
};