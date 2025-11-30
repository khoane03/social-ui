import { FileUser, GalleryVerticalEnd, Images, Users } from "lucide-react";
import { NavLink, useParams } from "react-router";

export const Menu = () => {
  const userId = useParams().id;

  const menuItems = [
    { to: `/profile/${userId}`, icon: <GalleryVerticalEnd /> },
    { to: `/profile/${userId}/friend`, icon: <Users /> },
    { to: `/profile/${userId}/images`, icon: <Images /> },
    { to: `/profile/${userId}/info`, icon: <FileUser /> },
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
