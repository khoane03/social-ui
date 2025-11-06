import { BadgeCheck, LogOut, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggleButton } from "../button/ThemeToggleButton";

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-white dark:bg-[#121C2F] shadow px-6 py-3 rounded-3xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={user?.avatarUrl || "default.png"}
          className="w-12 h-12 rounded-full border-2 border-pink-500 object-cover"
          alt="Avatar"
        />
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-gray-800 dark:text-b-wt">
            {user?.fullName}
          </p>
          {user?.isVerified &&
            <div className="flex items-center text-xs text-green-500 font-medium">
              <BadgeCheck className="w-4 h-4 mr-1" />
              Đã xác thực
            </div>

          }
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12">
          <ThemeToggleButton />
        </div>

        <button
          title="Đăng xuất"
          onClick={logout}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-red-100 dark:hover:bg-red-900 shadow-md transition"
        >
          <LogOut className="text-red-500" />
        </button>
      </div>
    </header>
  );
};
