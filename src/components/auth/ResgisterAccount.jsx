import { motion } from "framer-motion";
import { AtSign, Eye, EyeOff, LockKeyhole, RotateCcw } from "lucide-react";
import { useAlerts } from "../../context/AlertContext";
import { useCallback, useState } from "react";

export const RegisterAccount = ({ onSubmit }) => {
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

    const handleSubmit = () => {
        const { email, password, confirmPassword } = form;

        if (!email || !password || !confirmPassword) {
            addAlert({ type: "error", message: "Vui lòng điền đầy đủ thông tin" });
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
                message: "Mật khẩu và xác nhận mật khẩu không khớp",
            });
            return;
        }

        onSubmit(form);
    };


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
                className="flex items-center bg-gray-200 px-3 py-3 rounded-2xl justify-between"
            >
                <input
                    type="text"
                    className="flex-1 bg-transparent focus:outline-none px-2"
                    placeholder="Nhập Email"
                    onChange={(e) => handleChange("email", e.target.value)}
                />
                <AtSign className="text-gray-500" />
            </motion.div>

            {/* Password */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="flex items-center bg-gray-200 px-3 py-3 rounded-2xl justify-between"
            >
                <input
                    type={showPassword ? "text" : "password"}
                    className="flex-1 bg-transparent focus:outline-none px-2"
                    placeholder="Nhập mật khẩu"
                    onChange={(e) => handleChange("password", e.target.value)}
                />
               <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </button>
            </motion.div>

            {/* Confirm Password */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex items-center bg-gray-200 px-3 py-3 rounded-2xl justify-between"
            >
                <input
                    type={showPassword ? "text" : "password"}
                    className="flex-1 bg-transparent focus:outline-none px-2"
                    placeholder="Nhập lại mật khẩu"
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSubmit();
                        }
                    }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </button>
            </motion.div>

            {/* Submit button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="w-full bg-[#7F9FEF] hover:bg-blue-400 text-white font-semibold py-2.5 rounded-2xl transition-colors duration-300 mt-2"
            >
                Đăng ký
            </motion.button>
        </motion.div>
    );
};
