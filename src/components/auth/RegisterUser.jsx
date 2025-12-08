import { useState } from "react";
import { motion } from "framer-motion";
import { UserRound, MapPin, Loader2 } from "lucide-react";
import { useAlerts } from "../../context/AlertContext";

const RegisterUser = ({ onSubmit, loading }) => {
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
                className="flex items-center bg-gray-200 dark:bg-gray-800 px-3 py-3 rounded-2xl justify-between border-2 border-transparent focus-within:border-[#7F9FEF] transition-colors"
            >
                <input
                    type="text"
                    className="flex-1 bg-transparent focus:outline-none px-2 placeholder:text-sm dark:text-white"
                    placeholder="Nhập họ tên"
                    value={form.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    disabled={loading}
                />
                <UserRound className="text-gray-500 dark:text-gray-400" size={20} />
            </motion.div>

            {/* Địa chỉ */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex items-center bg-gray-200 dark:bg-gray-800 px-3 py-3 rounded-2xl justify-between border-2 border-transparent focus-within:border-[#7F9FEF] transition-colors"
            >
                <input
                    type="text"
                    className="flex-1 bg-transparent focus:outline-none px-2 placeholder:text-sm dark:text-white"
                    placeholder="Nhập địa chỉ"
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    disabled={loading}
                />

                <motion.button
                    whileHover={!loadingLocation && !loading ? { scale: 1.1 } : {}}
                    whileTap={!loadingLocation && !loading ? { scale: 0.9 } : {}}
                    onClick={handleGetLocation}
                    disabled={loadingLocation || loading}
                    className={`p-2 rounded-full transition-all duration-300 ${
                        loadingLocation || loading
                            ? "bg-blue-100 dark:bg-blue-900/30 cursor-wait"
                            : "hover:bg-blue-100 dark:hover:bg-blue-900/50 active:bg-blue-200 dark:active:bg-blue-900"
                    }`}
                >
                    <MapPin
                        size={20}
                        className={`transition-colors duration-300 ${
                            loadingLocation
                                ? "animate-pulse text-blue-500"
                                : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        }`}
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
                <div className="flex-1 bg-gray-200 dark:bg-gray-800 px-3 py-3 rounded-2xl border-2 border-transparent focus-within:border-[#7F9FEF] transition-colors">
                    <select
                        id="gender"
                        className="w-full bg-transparent text-sm focus:outline-none dark:text-white cursor-pointer"
                        value={form.gender}
                        onChange={(e) => handleChange("gender", e.target.value)}
                        disabled={loading}
                    >
                        <option value="" className="dark:bg-gray-800">Giới tính</option>
                        <option value="MALE" className="dark:bg-gray-800">Nam</option>
                        <option value="FEMALE" className="dark:bg-gray-800">Nữ</option>
                        <option value="OTHER" className="dark:bg-gray-800">Khác</option>
                    </select>
                </div>

                <div className="flex-1 bg-gray-200 dark:bg-gray-800 px-3 py-3 rounded-2xl border-2 border-transparent focus-within:border-[#7F9FEF] transition-colors">
                    <input
                        type="date"
                        className="w-full bg-transparent text-sm focus:outline-none dark:text-white cursor-pointer dark:[color-scheme:dark]"
                        value={form.dayOfBirth}
                        onChange={(e) => handleChange("dayOfBirth", e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !loading) {
                                handleSubmit();
                            }
                        }}
                        disabled={loading}
                    />
                </div>
            </motion.div>

            {/* Nút gửi */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-sm"
            >
                <motion.button
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-[#7F9FEF] text-white font-semibold py-3 rounded-2xl flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#7F9FEF]/30 hover:shadow-xl hover:shadow-[#7F9FEF]/40 transition-all duration-300"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            <span>Đang xử lý...</span>
                        </>
                    ) : (
                        "Hoàn tất"
                    )}
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default RegisterUser;