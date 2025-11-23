import { motion, AnimatePresence } from "framer-motion";
import { CircleX } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import userService from "../../service/userService";
import { useAlerts } from "../../context/AlertContext";

export const UpdateProfile = ({ onClose }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    gender: "",
    dayOfBirth: "",
    phoneNumber: "",
    bio: "",
  });

  const { user, getCurrentUser } = useAuth();
  const { addAlert } = useAlerts();

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user?.fullName || "",
        address: user?.address || "",
        gender: user?.gender || "",
        dayOfBirth: user?.dayOfBirth || "",
        phoneNumber: user?.phoneNumber || "",
        bio: user?.bio || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.updateUserProfile(user.id, formData);
      await getCurrentUser();
      onClose();
    } catch (error) {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Cập nhật thông tin cá nhân thất bại!"
      });
    }

  };

  return (
    <AnimatePresence>
      <motion.div
        key="modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-xl bg-white dark:bg-zinc-900 text-black dark:text-white rounded-2xl shadow-xl p-6 relative"
        >
          <motion.button
            whileHover={{ rotate: 90, scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
          >
            <CircleX size={24} />
          </motion.button>

          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold mb-6 text-center"
          >
            Cập nhật hồ sơ
          </motion.h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Họ và tên", name: "fullName", type: "text", placeholder: "Nhập tên" },
              { label: "Giới tính", name: "gender", type: "select" },
              { label: "Ngày sinh", name: "dayOfBirth", type: "date" },
              { label: "Số điện thoại", name: "phoneNumber", type: "text", placeholder: "Nhập số điện thoại" },
              { label: "Địa chỉ", name: "address", type: "text", placeholder: "Nhập địa chỉ" },
            ].map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                <label className="block mb-1 font-medium">{field.label}</label>

                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none"
                    required
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none"
                    required
                  />
                )}
              </motion.div>
            ))}

            {/* Thêm bio */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block mb-1 font-medium">Giới thiệu bản thân</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Chia sẻ đôi chút về bạn..."
                rows="3"
                className="w-full px-4 py-2 rounded-lg border dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none resize-none"
              />
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Lưu thay đổi
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
