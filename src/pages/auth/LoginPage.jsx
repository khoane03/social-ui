import { Eye, EyeOff, User, KeyRound, Loader2 } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from 'framer-motion';
import { useAlerts } from "../../context/AlertContext";
import authService from "../../service/authService";
import { useAuth } from "../../context/AuthContext";
import { IntroLoading } from "../../components/common/IntroLoading";

// Animation variants
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

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [requireOtp, setRequireOtp] = useState(false);
  const [resendTime, setResendTime] = useState(60);
  const [canResend, setCanResend] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const formRef = useRef(null);
  const otpRef = useRef(null);

  const { addAlert } = useAlerts();
  const { login, getCurrentUser } = useAuth();
  const navigate = useNavigate();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load saved credentials
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  // Auto focus
  useEffect(() => {
    if (requireOtp && otpRef.current) {
      otpRef.current.focus();
    } else if (!requireOtp && formRef.current) {
      formRef.current.focus();
    }
  }, [requireOtp]);

  // Resend timer
  useEffect(() => {
    if (!canResend && resendTime > 0) {
      const timer = setInterval(() => {
        setResendTime((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [canResend, resendTime]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const saveCredentials = useCallback(() => {
    if (rememberMe) {
      localStorage.setItem('rememberedUsername', username);
      localStorage.setItem('rememberedPassword', password);
    } else {
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('rememberedPassword');
    }
  }, [rememberMe, username, password]);

  const handleLogin = useCallback(async () => {
    if (!username.trim() || !password.trim()) {
      addAlert({
        type: "warning",
        message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!",
      });
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.login(username, password);

      saveCredentials();

      if (res.data?.requireOtp) {
        setRequireOtp(true);
        setCanResend(false);
        setResendTime(60);
        addAlert({
          type: "info",
          message: "Vui lòng nhập mã OTP đã được gửi đến bạn",
        });
      } else {
        await login(res.data.accessToken, res.data.refreshToken);
        await getCurrentUser();
        addAlert({ type: "success", message: "Đăng nhập thành công!" });
        setIsLoginSuccess(true);
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (error) {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại!",
      });
    } finally {
      setIsLoading(false);
    }
  }, [username, password, addAlert, saveCredentials, login, getCurrentUser, navigate]);

  const handleVerifyOtp = useCallback(async () => {
    if (!otp || otp.length < 6) {
      addAlert({
        type: "warning",
        message: "Vui lòng nhập mã OTP đầy đủ (6 số)",
      });
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.loginWithOTP(username, otp);

      saveCredentials();

      await login(res.data.accessToken, res.data.refreshToken);
      await getCurrentUser();
      addAlert({ type: "success", message: "Xác thực thành công!" });
      setIsLoginSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Mã OTP không hợp lệ!",
      });
    } finally {
      setIsLoading(false);
    }
  }, [otp, username, addAlert, saveCredentials, login, getCurrentUser, navigate]);

  const handleReSendOtp = useCallback(async () => {
    try {
      await authService.resendOTP(username);
      setCanResend(false);
      setResendTime(60);
      addAlert({
        type: "info",
        message: "Mã OTP mới đã được gửi!"
      });
    } catch (error) {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Không thể gửi lại OTP!",
      });
    }
  }, [username, addAlert]);

  const handleBackToLogin = useCallback(() => {
    setRequireOtp(false);
    setOtp('');
    setPassword('');
  }, []);

  const handleKeyPress = useCallback((e, action) => {
    if (e.key === "Enter" && !isLoading) {
      action();
    }
  }, [isLoading]);

  if (isLoginSuccess) return <IntroLoading />;

  return (
    <div className="flex flex-col md:flex-row gap-4 md:rounded-4xl w-full h-full overflow-hidden select-none">
      {/* Left Panel */}
      <motion.div
        initial={isMobile ? { opacity: 0, y: "-100%" } : { opacity: 0, x: "-100%" }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-5 md:flex-7 flex flex-col items-center justify-center gap-3 md:gap-4 bg-[#7F9FEF] md:rounded-l-4xl md:rounded-r-[35%] rounded-b-[25%] p-6 md:p-8"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white text-center"
        >
          Chào bạn, trở lại!
        </motion.h1>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-sm md:text-base lg:text-lg text-white/90 text-center"
        >
          Bạn chưa có tài khoản?
        </motion.span>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="flex flex-col gap-2 md:gap-3 w-full max-w-[200px] md:max-w-none"
        >
          <motion.div variants={linkButtonVariants} whileHover="hover" whileTap="tap">
            <Link
              to="register"
              className="px-4 py-2 md:px-6 md:py-2.5 border-2 border-white text-white rounded-2xl inline-block font-medium hover:bg-white hover:text-[#7F9FEF] transition-colors duration-300 text-sm md:text-base text-center w-full"
            >
              Đăng ký
            </Link>
          </motion.div>

          <motion.div variants={linkButtonVariants} whileHover="hover" whileTap="tap">
            <Link
              to="forgot-password"
              className="px-4 py-2 md:px-6 md:py-2.5 border-2 border-white text-white rounded-2xl inline-block font-medium hover:bg-white hover:text-[#7F9FEF] transition-colors duration-300 text-sm md:text-base text-center w-full"
            >
              Quên mật khẩu
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right Panel */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex-7 flex flex-col gap-4 items-center md:justify-center h-full mx-2 md:px-4"
      >
        <AnimatePresence mode="wait">
          {!requireOtp ? (
            <motion.div
              key="login"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4 items-center w-full max-w-sm"
            >
              <motion.h2
                variants={itemVariants}
                className="font-semibold text-2xl text-center py-4 dark:text-white"
              >
                Đăng nhập
              </motion.h2>

              {/* Username */}
              <motion.div
                variants={itemVariants}
                className="flex items-center bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl w-full border-2 border-transparent focus-within:border-[#7F9FEF] transition-colors"
              >
                <input
                  ref={formRef}
                  type="text"
                  className="flex-1 bg-transparent focus:outline-none px-2 dark:text-white"
                  placeholder="Tài khoản"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, handleLogin)}
                />
                <User className="text-gray-500 dark:text-gray-400" size={20} />
              </motion.div>

              {/* Password */}
              <motion.div
                variants={itemVariants}
                className="flex items-center bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl w-full border-2 border-transparent focus-within:border-[#7F9FEF] transition-colors"
              >
                <input
                  type={showPassword ? "text" : "password"}
                  className="flex-1 bg-transparent focus:outline-none px-2 dark:text-white"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, handleLogin)}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </motion.button>
              </motion.div>

              {/* Remember Me */}
              <motion.div
                variants={itemVariants}
                className="w-full flex items-center gap-2 px-2"
              >
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#7F9FEF] bg-gray-100 border-gray-300 rounded focus:ring-[#7F9FEF] focus:ring-2 cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none"
                >
                  Nhớ mật khẩu
                </label>
              </motion.div>

              {/* Login Button */}
              <motion.button
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                {...buttonVariants}
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-[#7F9FEF] text-white font-semibold py-3 rounded-2xl flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#7F9FEF]/30 hover:shadow-xl hover:shadow-[#7F9FEF]/40 transition-shadow"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Đăng nhập"
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-4 items-center w-full max-w-sm"
            >
              <motion.h2
                variants={itemVariants}
                className="font-semibold text-2xl text-center py-4 dark:text-white"
              >
                Xác thực OTP
              </motion.h2>

              <motion.div
                variants={itemVariants}
                className="flex items-center bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl w-full border-2 border-transparent focus-within:border-[#7F9FEF] transition-colors"
              >
                <input
                  ref={otpRef}
                  type="text"
                  maxLength={6}
                  className="flex-1 bg-transparent focus:outline-none px-2 text-center text-2xl tracking-widest font-semibold dark:text-white"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleKeyPress(e, handleVerifyOtp)}
                />
                <KeyRound className="text-gray-500 dark:text-gray-400" size={20} />
              </motion.div>

              <motion.button
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                {...buttonVariants}
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="w-full bg-[#7F9FEF] text-white font-semibold py-3 rounded-2xl flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#7F9FEF]/30 hover:shadow-xl hover:shadow-[#7F9FEF]/40 transition-shadow"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Xác nhận"}
              </motion.button>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBackToLogin}
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Quay lại
              </motion.button>

              <motion.button
                variants={itemVariants}
                whileHover={canResend ? { scale: 1.05 } : {}}
                whileTap={canResend ? { scale: 0.95 } : {}}
                className={`text-sm font-medium tracking-wide transition-colors ${canResend
                    ? "text-[#7F9FEF] hover:text-[#6b8bd6] hover:underline"
                    : "text-gray-400 cursor-not-allowed"
                  }`}
                disabled={!canResend}
                onClick={handleReSendOtp}
              >
                {canResend ? "Gửi lại mã OTP" : `Gửi lại sau ${resendTime}s`}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};