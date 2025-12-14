import {
  ChartNoAxesColumn,
  Command,
  Info,
  RefreshCcw,
  ShieldUser,
  UserCog,
} from "lucide-react";
import { NavLink } from "react-router";

const MENU_ITEMS = [
  { icon: ChartNoAxesColumn, text: "Tổng Quan", link: "/dashboard" },
  { icon: UserCog, text: "Quản lý tài khoản", link: "/dashboard/account" },
  { icon: Command, text: "Quản lý bài viết", link: "/dashboard/post" },
  { icon: Command, text: "Quản lý bài viết đang chờ", link: "/dashboard/post-pending" },
  { icon: RefreshCcw, text: "Quản lý yêu cầu", link: "/dashboard/request" },
  // { icon: ShieldUser, text: "Cấp quyền", link: "/dashboard/add-role" },
  { icon: Info, text: "Thông tin", link: "/dashboard/info" },
];

const getNavLinkClass = (isActive) =>
  `p-3 font-bold flex items-center gap-3 rounded-s-3xl cursor-pointer relative group 
   ${isActive 
      ? `bg-gray-100 dark:bg-[#384A71] text-gray-800 dark:text-white
         before:absolute before:content-[''] before:right-0 before:rounded-full before:bg-transparent before:w-8 before:h-8 before:top-[-32px] before:shadow-[18px_18px_0_3px_#F3F4F6] dark:before:shadow-[18px_18px_0_3px_#384A71] before:transition-all before:duration-300 before:ease-in-out
         after:absolute after:content-[''] after:right-0 after:rounded-full after:bg-transparent after:w-8 after:h-8 after:bottom-[-32px] after:shadow-[18px_-18px_0_3px_#F3F4F6] dark:after:shadow-[18px_-18px_0_3px_#384A71] after:transition-all after:duration-300 after:ease-in-out`
      : `text-white hover:bg-blue-300/20 dark:hover:bg-white/10`
    }`;

export const Menu = () => {
  return (
    <div className="bg-[#7F9FEF] dark:bg-[#121C2F] absolute top-0 bottom-0 left-0 w-64 h-screen rounded-r-2xl shadow-lg z-50 pl-4 select-none">
      <h1 className="text-white text-3xl font-semibold font-lobster text-center mt-4">
        Social Dashboard
      </h1>
      <nav className="mt-8 space-y-2">
        {MENU_ITEMS.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              end
              to={item.link}
              key={index}
              className={({ isActive }) => getNavLinkClass(isActive)}
            >
              <IconComponent className="group-hover:scale-110 transition-transform duration-300" />
              <span className="group-hover:translate-x-1 transition-all duration-300">
                {item.text}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
