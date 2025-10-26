import { X, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import notificationService from "../../service/notificationService";
import { useAlerts } from "../../context/AlertContext";

export const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const { addAlert } = useAlerts();

  useEffect(() => {
    (async () => {
      try {
        const res = await notificationService.getNotifications(user.id || "");
        console.log("Notifications fetched:", res.data);
        setNotifications(res.data.data);
      } catch (error) {
        addAlert({
          type: "error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Lỗi hệ thống, vui lòng thử lại!",
        });
      }
    })();
  }, []);

  const handleDeleteNotification = async (notificationId) => {
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
          "Lỗi hệ thống, vui lòng thử lại!",
      });
    }
  };

  const handleReadNotification = async (notificationId) => {
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
          "Lỗi hệ thống, vui lòng thử lại!",
      });
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      await notificationService.deleteAllNotifications(user.id || "");
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
          "Lỗi hệ thống, vui lòng thử lại!",
      });
    }
  };

  const content = useMemo(() => {
    if (notifications.length === 0) {
      return <p className="text-gray-600 mt-4">Bạn không có thông báo mới.</p>;
    }
    return (
      <ul className="space-y-4">
        <AnimatePresence>
          {notifications.map((notification, idx) => (
            <motion.li
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleReadNotification(notification.id)}
              className={`p-3 rounded-xl shadow hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors duration-300 flex justify-between items-start ${
                !notification.isRead
                  ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                  : "bg-gray-50 dark:bg-zinc-800"
              }`}
            >
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                  <p className="text-gray-800 dark:text-white text-sm leading-snug">
                    {notification.message}
                  </p>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(notification.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
              <X
                size={14}
                onClick={() => handleDeleteNotification(notification.id)}
                className="hover:text-red-400 text-gray-500 transition-transform duration-150 cursor-pointer hover:scale-110 ml-2"
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    );
  }, [notifications]);

  return (
    <motion.div
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      exit={{ x: -320 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute top-0 left-[80px] h-full w-80 rounded-r-2xl bg-[#F1F4F7] dark:bg-black z-20"
    >
      <div className="flex flex-col h-full w-80 rounded-r-2xl text-gray-800 dark:text-b-wt border-r border-b-wt dark:border-zinc-800 shadow-2xl py-2 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Thông báo</h1>
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAllNotifications}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              <Trash2 size={14} />
              Xóa tất cả
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto mt-4">{content}</div>
      </div>
    </motion.div>
  );
};
