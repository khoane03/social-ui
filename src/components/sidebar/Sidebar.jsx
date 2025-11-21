import {
  Home,
  Search as SearchIcon,
  MessageCircle,
  Bell,
  User,
  Settings,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Notification } from "../popup/Notification";
import { Search } from "../popup/Search";

const sideBar = [
  { type: "link", to: "/", icon: Home, label: "Trang chủ", match: "/" },
  { type: "popup", popupType: "search", icon: SearchIcon, label: "Tìm kiếm", match: "search" },
  { type: "link", to: "/message", icon: MessageCircle, label: "Nhắn tin", match: "/message" },
  { type: "popup", popupType: "notification", icon: Bell, label: "Thông báo", match: "notification" },
  { type: "link", to: "/profile", icon: User, label: "Trang cá nhân", match: "/profile" },
  { type: "link", to: "/friends", icon: Users, label: "Bạn bè", match: "/friends" },
  { type: "link", to: "/settings", icon: Settings, label: "Cài đặt", match: "/settings" },
];

export const Sidebar = () => {
  const [activePopup, setActivePopup] = useState(null);
  const { pathname } = useLocation();

  const hideLabel = pathname.startsWith("/message");
  const isCompact = activePopup !== null || hideLabel;

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

  return (
    <>
      {activePopup === "search" && <Search />}
      {activePopup === "notification" && <Notification />}

      <div
        className={`fixed top-0 left-0 z-30 h-screen p-4 border-r border-b-wt transition-all duration-300 ease-in-out
        bg-[#F1F4F7] text-black dark:text-white dark:bg-black dark:border-zinc-800 select-none
        ${isCompact ? "w-20" : "w-20 md:w-64"}`}
      >
        <Link
          to="/"
          className="hidden md:block mb-6 text-4xl font-bold font-lobster hover:scale-105 transition-transform duration-300 ease-in-out"
        >
          {isCompact ? "S" : "SocialMedia"}
        </Link>

        <div className="flex flex-col gap-2">
          {sideBar.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            const iconElement = (
              <Icon
                className={`w-6 h-6 flex-shrink-0 ${
                  active ? "text-blue-500" : ""
                }`}
              />
            );

            const labelClass = `
              overflow-hidden whitespace-nowrap
              max-w-0 opacity-0
              ${!hideLabel ? "md:max-w-[150px] opacity-100 ml-2" : ""}
            `;

            const commonClass = `flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer
              dark:hover:bg-zinc-800 hover:bg-zinc-200
             `;

            return item.type === "link" ? (
              <Link
                onClick={handleLinkClick}
                key={item.label}
                to={item.to}
                className={commonClass}
              >
                {iconElement}
                <span className={labelClass}>{item.label}</span>
              </Link>
            ) : (
              <div
                key={item.label}
                onClick={() => togglePopup(item.popupType)}
                className={commonClass}
              >
                {iconElement}
                <span className={labelClass}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
