import { useState } from "react";
import { motion } from "framer-motion";
import { UserRound, MapPin } from "lucide-react";
import { useAlerts } from "../../context/AlertContext";

const RegisterUser = ({ onSubmit }) => {
    const { addAlert } = useAlerts();
    const [form, setForm] = useState({
        fullName: "",
        address: "",
        gender: "",
        dayOfBirth: "",
    });
    const [loadingLocation, setLoadingLocation] = useState(false);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        const { fullName, address, gender, dayOfBirth } = form;

        if (!fullName || !address || !gender || !dayOfBirth) {
            addAlert({
                type: "error",
                message: "Vui lòng điền đầy đủ thông tin.",
            });
            return;
        }

        onSubmit?.(form);
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
                console.log("Vĩ độ:", latitude, "Kinh độ:", longitude);
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );
                    const data = await res.json();
                    const addr = data.display_name || `${latitude}, ${longitude}`;

                    setForm((prev) => ({ ...prev, address: addr }));
                    addAlert({ type: "success", message: "Đã lấy vị trí thành công!" });
                } catch (error) {
                    console.error("Lỗi lấy địa chỉ từ vị trí:", error);
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
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-4 w-full max-w-sm"
        >
            {/* Họ tên */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center bg-gray-200 px-3 py-3 rounded-2xl justify-between"
            >
                <input
                    type="text"
                    className="flex-1 bg-transparent focus:outline-none px-2 placeholder:text-sm"
                    placeholder="Nhập họ tên"
                    value={form.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                />
                <UserRound className="text-gray-500" />
            </motion.div>

            {/* Địa chỉ */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex items-center bg-gray-200 px-3 py-3 rounded-2xl justify-between"
            >
                <input
                    type="text"
                    className="flex-1 bg-transparent focus:outline-none px-2 placeholder:text-sm"
                    placeholder="Nhập địa chỉ"
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                />

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleGetLocation}
                    disabled={loadingLocation}
                    className={`p-2 rounded-full transition-all duration-300
      ${loadingLocation ? "bg-blue-100 cursor-wait" : "hover:bg-blue-100 active:bg-blue-200"}
    `}
                >
                    <MapPin
                        size={22}
                        className={`transition-colors duration-300
        ${loadingLocation ? "animate-pulse text-blue-500" : "text-gray-600 hover:text-blue-600"}
      `}
                    />
                </motion.button>
            </motion.div>


            {/* Giới tính & Ngày sinh */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex gap-3"
            >
                <div className="flex-1 bg-gray-200 px-3 py-3 rounded-2xl">
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

                <div className="flex-1 bg-gray-200 px-3 py-3 rounded-2xl">
                    <input
                        type="date"
                        className="w-full bg-transparent text-sm focus:outline-none"
                        value={form.dayOfBirth}
                        onChange={(e) => handleChange("dayOfBirth", e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSubmit();
                            }
                        }}
                    />
                </div>
            </motion.div>

            {/* Nút gửi */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-sm p-4"
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="w-full bg-[#7F9FEF] hover:bg-blue-400 text-white font-semibold py-2.5 rounded-2xl transition-colors duration-300 mt-2"
                >
                    Tiếp tục
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default RegisterUser;
