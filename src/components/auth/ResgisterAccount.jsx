import { motion } from "framer-motion";
import { AtSign, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAlerts } from "../../context/AlertContext";
import { useCallback, useState } from "react";

export const RegisterAccount = ({ onSubmit, loading }) => {
    const { addAlert } = useAlerts();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = useCallback(() => {
        const { email, password, confirmPassword } = form;

        if (!email || !password || !confirmPassword) {
            addAlert({ type: "error", message: "Vui lòng điền đầy đủ thông tin" });
            return;
        }

        // ✅ Kiểm tra email phải là Gmail
        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
            addAlert({
                type: "error",
                message: "Email phải là địa chỉ @gmail.com hợp lệ",
            });
            return;
        }

        // ✅ Kiểm tra độ mạnh của mật khẩu
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            addAlert({
                type: "error",
                message:
                    "Mật khẩu phải có ít nhất 8 ký tự, gồm 1 chữ in hoa, 1 chữ thường và 1 số",
            });
            return;
        }

        // ✅ Kiểm tra xác nhận mật khẩu
        if (password !== confirmPassword) {
            addAlert({
                type: "error",
                message: "Mật khẩu và xác nhận mật khẩu không khớp",
            });
            return;
        }

        onSubmit(form);
    }, [form, addAlert, onSubmit]);

    const handleKeyPress = useCallback(
        (e) => {
            if (e.key === "Enter" && !loading) {
                handleSubmit();
            }
        },
        [loading, handleSubmit]
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-4 w-full max-w-sm"
        >
            {/* Email */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex items-center bg-gray-200 px-4 py-3 rounded-2xl border-2 border-transparent focus-within:border-[#7F9FEF] transition-colors"
            >
                <input
                    type="text"
                    className="flex-1 bg-transparent focus:outline-none px-2 "
                    placeholder="Nhập Email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={loading}
                />
                <AtSign className="text-gray-500 " size={20} />
            </motion.div>

            {/* Password */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="flex items-center bg-gray-200 px-4 py-3 rounded-2xl border-2 border-transparent focus-within:border-[#7F9FEF] transition-colors"
            >
                <input
                    type={showPassword ? "text" : "password"}
                    className="flex-1 bg-transparent focus:outline-none px-2 "
                    placeholder="Nhập mật khẩu"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={loading}
                />
                <motion.button
                    whileHover={!loading ? { scale: 1.1 } : {}}
                    whileTap={!loading ? { scale: 0.9 } : {}}
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                    className="text-gray-500  hover:text-gray-700  transition-colors disabled:opacity-50"
                >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </motion.button>
            </motion.div>

            {/* Confirm Password */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex items-center bg-gray-200  px-4 py-3 rounded-2xl border-2 border-transparent focus-within:border-[#7F9FEF] transition-colors"
            >
                <input
                    type={showPassword ? "text" : "password"}
                    className="flex-1 bg-transparent focus:outline-none px-2 "
                    placeholder="Nhập lại mật khẩu"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={loading}
                />
                <motion.button
                    whileHover={!loading ? { scale: 1.1 } : {}}
                    whileTap={!loading ? { scale: 0.9 } : {}}
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                    className="text-gray-500  hover:text-gray-700  transition-colors disabled:opacity-50"
                >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </motion.button>
            </motion.div>

            {/* Submit button */}
            <motion.button
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#7F9FEF] text-white font-semibold py-3 rounded-2xl flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#7F9FEF]/30 hover:shadow-xl hover:shadow-[#7F9FEF]/40 transition-all duration-300 mt-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Đang xử lý...</span>
                    </>
                ) : (
                    "Tiếp tục"
                )}
            </motion.button>
        </motion.div>
    );
};