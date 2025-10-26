import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserRound, MapPin, Phone } from "lucide-react";
import { useAlerts } from "../../context/AlertContext";
import userService from "../../service/userService";

const ModalUpdateProfile = () => {
  const { addAlert } = useAlerts();
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    gender: "",
    dayOfBirth: "",
    phoneNumber: "",
  });
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    const { fullName, address, gender, dayOfBirth, phoneNumber } = form;

    if (!fullName || !address || !gender || !dayOfBirth || !phoneNumber) {
      addAlert({
        type: "error",
        message: "Vui lòng điền đầy đủ thông tin.",
      });
      return;
    }

    try {
        await userService.createUserProfile(form);
        addAlert({ type: "success", message: "Cập nhật thông tin cá nhân thành công!" });
        window.location.replace("/");
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

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      addAlert({ type: "error", message: "Trình duyệt không hỗ trợ định vị." });
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.display_name || `${latitude}, ${longitude}`;
          setForm((prev) => ({ ...prev, address: addr }));
          addAlert({ type: "success", message: "Đã lấy vị trí thành công!" });
        } catch (error) {
          addAlert({
            type: "error",
            message: "Không thể lấy địa chỉ từ vị trí.",
          });
        } finally {
          setLoadingLocation(false);
        }
      },
      () => {
        addAlert({ type: "error", message: "Không thể truy cập vị trí của bạn." });
        setLoadingLocation(false);
      }
    );
  };

  return (
    <AnimatePresence>
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4"
          >
            <h2 className="text-xl font-semibold text-center mb-2 text-gray-700">
              Yêu cầu cập nhật thông tin cá nhân
            </h2>

            {/* Họ tên */}
            <div className="flex items-center bg-gray-100 px-3 py-3 rounded-2xl">
              <input
                type="text"
                placeholder="Nhập họ tên"
                className="flex-1 bg-transparent focus:outline-none px-2 placeholder:text-sm"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
              />
              <UserRound className="text-gray-500" />
            </div>

            {/* Số điện thoại */}
            <div className="flex items-center bg-gray-100 px-3 py-3 rounded-2xl">
              <input
                type="text"
                placeholder="Nhập số điện thoại"
                className="flex-1 bg-transparent focus:outline-none px-2 placeholder:text-sm"
                value={form.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
              />
              <Phone className="text-gray-500" />
            </div>

            {/* Địa chỉ */}
            <div className="flex items-center bg-gray-100 px-3 py-3 rounded-2xl justify-between">
              <input
                type="text"
                placeholder="Nhập địa chỉ"
                className="flex-1 bg-transparent focus:outline-none px-2 placeholder:text-sm"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleGetLocation}
                disabled={loadingLocation}
                className={`p-2 rounded-full transition-all duration-300 ${
                  loadingLocation
                    ? "bg-blue-100 cursor-wait"
                    : "hover:bg-blue-100 active:bg-blue-200"
                }`}
              >
                <MapPin
                  size={22}
                  className={`transition-colors duration-300 ${
                    loadingLocation
                      ? "animate-pulse text-blue-500"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                />
              </motion.button>
            </div>

            {/* Giới tính & Ngày sinh */}
            <div className="flex gap-3">
              <div className="flex-1 bg-gray-100 px-3 py-3 rounded-2xl">
                <select
                  id="gender"
                  className="w-full bg-transparent text-sm focus:outline-none"
                  value={form.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                >
                  <option value="">Giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div className="flex-1 bg-gray-100 px-3 py-3 rounded-2xl">
                <input
                  type="date"
                  className="w-full bg-transparent text-sm focus:outline-none"
                  value={form.dayOfBirth}
                  onChange={(e) => handleChange("dayOfBirth", e.target.value)}
                />
              </div>
            </div>

            {/* Nút gửi */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreate}
              className="w-full bg-[#7F9FEF] hover:bg-blue-500 text-white font-semibold py-2.5 rounded-2xl mt-2 transition-all duration-300"
            >
              Tiếp tục
            </motion.button>
          </motion.div>
        </motion.div>
    </AnimatePresence>
  );
};

export default ModalUpdateProfile;
