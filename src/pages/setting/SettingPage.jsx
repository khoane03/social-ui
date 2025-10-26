import {
  User,
  Lock,
  LogOut,
  Moon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ThemeToggleButton } from "../../components/button/ThemeToggleButton";
import { UpdateProfile } from "../../components/profile/UpdateProfile";
import { SettingModal } from "./SettingModal";
import { useAuth } from "../../context/AuthContext";

export const SettingPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const { logout } = useAuth();

  const settings = useMemo(() => [
    {
      icon: <User />,
      title: "Tài khoản",
      description: "Chỉnh sửa thông tin",
      onClick: () => setShowModal(true),
    },
    {
      icon: <Lock />,
      title: "Bảo mật",
      description: "Xác thực hai yếu tố, thay đổi mật khẩu",
      onClick: () => setShowSecurityModal(true),
    },
    {
      icon: <Moon />,
      title: "Giao diện",
      description: "Chọn sáng tối",
      component: <ThemeToggleButton />,
    },
    {
      icon: <LogOut />,
      title: "Đăng xuất",
      description: "Đăng xuất tài khoản của bạn",
      onClick: () => {
        logout();
      },
    },
  ], []);

  return (
    <>
      {showModal && <UpdateProfile onClose={() => setShowModal(false)} />}
      {showSecurityModal && <SettingModal onClose={() => setShowSecurityModal(false)} />}

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white text-white-theme">Cài đặt</h1>

        <div className="space-y-4">
          {settings.map(({ icon, title, description, component, onClick }, index) => (
            <div
              key={index}
              onClick={onClick}
              className={`
                flex items-center justify-between gap-4 p-4 rounded-xl transition group cursor-pointer
                bg-[#F1F4F7] dark:bg-zinc-800 text-white-theme dark:hover:bg-zinc-700
                ${onClick ? "hover:opacity-90" : "cursor-default"}
              `}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 dark:bg-zinc-700 bg-zinc-200 rounded-full text-blue-400 group-hover:scale-105 transition">
                  {icon}
                </div>
                <div>
                  <h2 className="dark:text-white font-medium">{title}</h2>
                  <p className="text-sm text-zinc-400">{description}</p>
                </div>
              </div>
              {component && <div>{component}</div>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
