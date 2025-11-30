import {
  Home,
  Search as SearchIcon,
  MessageCircle,
  Bell,
  User,
  Settings,
  Users,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { Notification } from "../popup/Notification";
import { Search } from "../popup/Search";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import notificationService from "../../service/notificationService";
import { useWebsocket } from "../../context/WsContext";

export const Sidebar = () => {
  const [activePopup, setActivePopup] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { subscribeNotify, notifyConnected } = useWebsocket();
  const subscriptionRef = useRef(null);
  const isMountedRef = useRef(true);

  const hideLabel = pathname.startsWith("/message");
  const isCompact = activePopup !== null || hideLabel;

  const sideBar = [
    { type: "link", to: "/", icon: Home, label: "Trang chủ", match: "/" },
    { type: "popup", popupType: "search", icon: SearchIcon, label: "Tìm kiếm", match: "search" },
    { type: "link", to: "/message", icon: MessageCircle, label: "Nhắn tin", match: "/message" },
    { type: "popup", popupType: "notification", icon: Bell, label: "Thông báo", match: "notification", badge: unreadCount },
    { type: "link", to: `/profile/${user?.id}`, icon: User, label: "Trang cá nhân", match: "/profile" },
    { type: "link", to: "/friend", icon: Users, label: "Bạn bè", match: "/friend" },
    { type: "link", to: "/settings", icon: Settings, label: "Cài đặt", match: "/settings" },
  ];

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    if (!user?.id) return;
    
    try {
      const { data } = await notificationService.countUnRead(user.id);
      if (isMountedRef.current) {
        setUnreadCount(data || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    if (!user?.id) return;

    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [user?.id]);

  // Subscribe to WebSocket for real-time updates
  useEffect(() => {

    if (!notifyConnected || !user?.id) {
      return;
    }

    const topic = `/topic/notification/count/${user.id}`;
    const unsubscribe = subscribeNotify(topic, (message) => {
      if (!isMountedRef.current) {
        return;
      }

      try {
        // Handle different message formats
        let count = 0;
        
        if (typeof message === 'number') {
          count = message;
        } else if (message?.count !== undefined) {
          count = message.count;
        } else if (message?.data?.count !== undefined) {
          count = message.data.count;
        } else if (message?.body) {
          const parsed = JSON.parse(message.body);
          count = parsed.count || parsed;
        }
        setUnreadCount(count);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error, message);
      }
    });

    subscriptionRef.current = unsubscribe;

    return () => {
      if (subscriptionRef.current && typeof subscriptionRef.current === 'function') {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, [notifyConnected, user?.id, subscribeNotify]);

  // Refetch when closing notification popup
  useEffect(() => {
    if (activePopup !== "notification" && user?.id) {
      fetchUnreadCount();
    }
  }, [activePopup, user?.id]);

  // Component mounted/unmounted tracking
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleLinkClick = () => {
    if (activePopup) {
      setActivePopup(null);
    }
  };

  const togglePopup = (type) => {
    setActivePopup((prev) => (prev === type ? null : type));
  };

  const isActive = (item) => {
    if (activePopup) {
      return item.type === "popup" && activePopup === item.match;
    }
    return item.type === "link" && pathname === item.match;
  };

  // Callback when notification is read
  const handleNotificationRead = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <>
      <AnimatePresence>
        {activePopup === "search" && <Search key="search" />}
      </AnimatePresence>
      
      <AnimatePresence>
        {activePopup === "notification" && (
          <Notification 
            key="notification"
            onRead={handleNotificationRead}
            onRefresh={fetchUnreadCount}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 z-30 h-screen p-4 border-r border-b-wt transition-all duration-300 ease-in-out
        bg-[#F1F4F7] text-black dark:text-white dark:bg-black dark:border-zinc-800 select-none
        ${isCompact ? "w-20" : "w-20 md:w-64"}`}
      >
        <Link
          to="/"
          className="hidden md:block mb-6 text-4xl font-bold font-lobster hover:scale-105 transition-transform duration-300 ease-in-out"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isCompact ? "S" : "SocialMedia"}
          </motion.span>
        </Link>

        <div className="flex flex-col gap-2">
          {sideBar.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item);

            const iconElement = (
              <div className="relative">
                <Icon
                  className={`w-6 h-6 flex-shrink-0 transition-colors ${
                    active ? "text-blue-500" : ""
                  }`}
                />
                {/* Notification Badge */}
                <AnimatePresence>
                  {item.badge > 0 && (
                    <motion.div
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg"
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );

            const labelClass = `
              overflow-hidden whitespace-nowrap
              max-w-0 opacity-0 transition-all duration-300
              ${!hideLabel ? "md:max-w-[150px] md:opacity-100 ml-2" : ""}
            `;

            const commonClass = `flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer
              dark:hover:bg-zinc-800 hover:bg-zinc-200 transition-colors relative
              ${active ? "bg-zinc-200 dark:bg-zinc-800" : ""}
            `;

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {item.type === "link" ? (
                  <Link
                    onClick={handleLinkClick}
                    to={item.to}
                    className={commonClass}
                  >
                    {iconElement}
                    <span className={labelClass}>{item.label}</span>
                  </Link>
                ) : (
                  <div
                    onClick={() => togglePopup(item.popupType)}
                    className={commonClass}
                  >
                    {iconElement}
                    <span className={labelClass}>{item.label}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};