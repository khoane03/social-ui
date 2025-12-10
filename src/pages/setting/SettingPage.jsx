import { motion } from "framer-motion";
import { User, Lock, LogOut, Moon } from "lucide-react";
import { useMemo, useState } from "react";
import { ThemeToggleButton } from "../../components/button/ThemeToggleButton";
import { UpdateProfile } from "../../components/profile/UpdateProfile";
import { SettingModal } from "./SettingModal";
import { useAuth } from "../../context/AuthContext";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import authService from "../../service/authService";
import { getRefreshToken } from "../../service/storeService";

export const SettingPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout } = useAuth();

  const settings = useMemo(
    () => [
      {
        icon: <User />,
        title: "Tài khoản",
        description: "Chỉnh sửa thông tin cá nhân",
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
        description: "Chọn chế độ sáng / tối",
        component: <ThemeToggleButton />,
      },
      {
        icon: <LogOut />,
        title: "Đăng xuất",
        description: "Đăng xuất khỏi tài khoản",
        onClick: () => setIsModalOpen(true),
      },
    ],
    []
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleLogout = async () => {
    try {
      await authService.logout(getRefreshToken());
      logout();
      setIsModalOpen(false);
    } catch (error) {

    }

  };

  return (
    <>
      {showModal && <UpdateProfile onClose={() => setShowModal(false)} />}
      {showSecurityModal && (
        <SettingModal onClose={() => setShowSecurityModal(false)} />
      )}
      {<ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất không?"
        confirmText="Đăng xuất"
      />}

      <motion.div
        className="max-w-2xl mx-auto px-4 py-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
          Cài đặt
        </h1>

        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {settings.map(
            ({ icon, title, description, component, onClick }, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClick}
                className={`flex items-center justify-between gap-4 p-4 rounded-xl shadow-sm border cursor-pointer
                  bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700
                  transition-colors duration-200`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-zinc-200 dark:bg-zinc-700 text-blue-500">
                    {icon}
                  </div>
                  <div>
                    <h2 className="font-medium text-zinc-900 dark:text-zinc-100">
                      {title}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {description}
                    </p>
                  </div>
                </div>
                {component && <div>{component}</div>}
              </motion.div>
            )
          )}
        </motion.div>
      </motion.div>
    </>
  );
};
