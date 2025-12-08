import { useState, useCallback } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { AtSign, Loader2, ArrowLeft } from "lucide-react";
import { useAlerts } from "../../context/AlertContext";
import authService from "../../service/authService";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const buttonVariants = {
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 }
};

const linkButtonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 }
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { addAlert } = useAlerts();

  const handleSubmit = useCallback(async () => {
    if (!email.trim()) {
      addAlert({
        type: "warning",
        message: "Vui lòng nhập địa chỉ email!"
      });
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
      addAlert({
        type: "error",
        message: "Email phải là địa chỉ @gmail.com hợp lệ"
      });
      return;
    }

    try {
      setLoading(true);
      await authService.forgetPass(email);
      addAlert({
        type: "success",
        message: "Đã gửi email khôi phục mật khẩu! Vui lòng kiểm tra hộp thư."
      });
      setEmail("");
    } catch (error) {
        console.log(error)
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!"
      });
    } finally {
      setLoading(false);
    }
  }, [email, addAlert]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  }, [loading, handleSubmit]);

  return (
    <div className="flex flex-col md:flex-row gap-4 md:rounded-4xl w-full h-full overflow-hidden select-none">
      {/* Left Panel */}
      <motion.div
        initial={isMobile ? { opacity: 0, y: "-100%" } : { opacity: 0, x: "-100%" }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-5 md:flex-7 flex flex-col items-center justify-center gap-4 bg-[#7F9FEF] md:rounded-l-4xl md:rounded-r-[35%] rounded-b-[25%] p-8"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white text-center"
        >
          Quên mật khẩu?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-sm md:text-base text-gray-700 text-center max-w-md px-4"
        >
          Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi link khôi phục mật khẩu.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          variants={linkButtonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-white text-white rounded-2xl font-medium hover:bg-white hover:text-[#7F9FEF] transition-colors duration-300"
          >
            <ArrowLeft size={20} />
            Quay lại đăng nhập
          </Link>
        </motion.div>
      </motion.div>

      {/* Right Panel */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex-7 flex flex-col gap-4 items-center md:justify-center h-full mx-2 md:px-4"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4 items-center w-full max-w-sm"
        >
          <motion.h2
            variants={itemVariants}
            className="font-semibold text-2xl text-center py-4 "
          >
            Khôi phục mật khẩu
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-sm text-gray-700 text-center px-4"
          >
            Nhập email bạn đã đăng ký để nhận link khôi phục mật khẩu
          </motion.p>

          {/* Email Input */}
          <motion.div
            variants={itemVariants}
            className="flex items-center bg-gray-100 px-4 py-3 rounded-2xl w-full border-2 border-transparent focus-within:border-[#7F9FEF] transition-colors"
          >
            <input
              type="email"
              className="flex-1 bg-transparent focus:outline-none px-2 text-black"
              placeholder="your.email@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
            />
            <AtSign className="text-gray-500 " size={20} />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            variants={itemVariants}
            whileHover={!loading ? "hover" : {}}
            whileTap={!loading ? "tap" : {}}
            {...buttonVariants}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#7F9FEF] text-white font-semibold py-3 rounded-2xl flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#7F9FEF]/30 hover:shadow-xl hover:shadow-[#7F9FEF]/40 transition-shadow"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Đang gửi...</span>
              </>
            ) : (
              "Lấy lại mật khẩu"
            )}
          </motion.button>

          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 text-sm text-gray-600 mt-2"
          >
            <span>Nhớ mật khẩu?</span>
            <Link
              to="/auth"
              className="text-[#7F9FEF] hover:text-[#6b8bd6] hover:underline font-medium"
            >
              Đăng nhập ngay
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;