import { FileUser, GalleryVerticalEnd, Images, Users } from "lucide-react";
import { NavLink } from "react-router";

export const Menu = () => {
  const menuItems = [
    { to: "/profile", icon: <GalleryVerticalEnd /> },
    { to: "/profile/friends", icon: <Users /> },
    { to: "/profile/images", icon: <Images /> },
    { to: "/profile/info", icon: <FileUser /> },
  ];

  return (
    <div className="h-full">
      <ul className="flex items-center justify-around p-2 w-full">
        {menuItems.map(({ to, icon }) => (
          <li
            className="transition-transform duration-300 hover:scale-105"
            key={to}
          >
            <NavLink
              to={to}
              end
              className={({ isActive }) =>
                ` ${isActive ? "text-pink-400" : "dark:text-white text-white-theme"}`
              }
            >
              {icon}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};
