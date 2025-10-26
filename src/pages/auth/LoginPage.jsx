import { Eye, EyeOff, User, KeyRound, Loader2 } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from 'framer-motion';
import { useAlerts } from "../../context/AlertContext";
import authService from "../../service/authService";
import { useAuth } from "../../context/AuthContext";
import { IntroLoading } from "../../components/common/IntroLoading";

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef(null);
  const otpRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const { addAlert } = useAlerts();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [requireOtp, setRequireOtp] = useState(false);
  const [resendTime, setResendTime] = useState(60);
  const [canResend, setCanResend] = useState(true);
  const { login, getCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      addAlert({
        type: "warning",
        message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!",
      });
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.login(username, password);

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

        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      addAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi hệ thống, vui lòng thử lại!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
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
      await login(res.data.accessToken, res.data.refreshToken);
      await getCurrentUser();
      addAlert({ type: "success", message: "Xác thực thành công!" });
      setIsLoginSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      addAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Mã OTP không hợp lệ!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReSendOtp = async () => {
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
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Mã OTP không hợp lệ!",
      });
    }
  };

  const handleBackToLogin = () => {
    setRequireOtp(false);
    setOtp('');
    setPassword('');
  };

  useEffect(() => {
    let timer;
    if (!canResend && resendTime > 0) {
      timer = setInterval(() => {
        setResendTime((prev) => prev - 1);
      }, 1000);
    } else if (resendTime === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [canResend, resendTime]);

  useEffect(() => {
    if (requireOtp && otpRef.current) otpRef.current.focus();
    else if (!requireOtp && formRef.current) formRef.current.focus();
  }, [requireOtp]);

  if (isLoginSuccess) return <IntroLoading />;

  return (
    <div className="flex flex-col md:flex-row gap-4 md:rounded-4xl w-full h-full overflow-hidden select-none">
      <motion.div
        initial={
          isMobile
            ? { opacity: 0, x: 0, y: "-100%" }
            : { opacity: 0, x: "-100%", y: 0 }
        }
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex-5 md:flex-7 flex flex-col items-center justify-center bg-[#7F9FEF] md:rounded-l-4xl md:rounded-r-[35%] rounded-b-[25%]"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl font-semibold"
        >
          Chào bạn, trở lại!
        </motion.h1>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg mt-2"
        >
          Bạn chưa có tài khoản?
        </motion.span>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="register"
            className="p-2 border rounded-2xl mt-2 inline-block"
          >
            Đăng ký
          </Link>
        </motion.div>
      </motion.div>

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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4 items-center w-full"
            >
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="font-semibold text-2xl text-center py-4"
              >
                Đăng nhập
              </motion.h2>

              {/* Username */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center bg-gray-200 px-3 py-3 rounded-2xl w-full max-w-sm justify-between"
              >
                <input
                  ref={formRef}
                  type="text"
                  className="flex-1 bg-transparent focus:outline-none px-2"
                  placeholder="Tài khoản"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <User className="text-gray-500" />
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center bg-gray-200 px-3 py-3 rounded-2xl w-full max-w-sm justify-between"
              >
                <input
                  type={showPassword ? "text" : "password"}
                  className="flex-1 bg-transparent focus:outline-none px-2"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
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

              {/* Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="w-full max-w-sm"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-[#7F9FEF] text-white font-semibold py-2.5 rounded-2xl mt-2 flex justify-center items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Đăng nhập"
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4 items-center w-full"
            >
              <motion.h2 className="font-semibold text-2xl text-center py-4">
                Xác thực OTP
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center bg-gray-200 px-3 py-3 rounded-2xl w-full max-w-sm justify-between"
              >
                <input
                  ref={otpRef}
                  type="text"
                  maxLength={6}
                  className="flex-1 bg-transparent focus:outline-none px-2 text-center text-2xl tracking-widest font-semibold"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerifyOtp();
                  }}
                />
                <KeyRound className="text-gray-500" />
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="w-full max-w-sm bg-[#7F9FEF] text-white font-semibold py-2.5 rounded-2xl flex justify-center items-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Xác nhận"}
              </motion.button>

              <button
                onClick={handleBackToLogin}
                className="w-full max-w-sm bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-2xl hover:bg-gray-300"
              >
                Quay lại
              </button>

              <motion.button
                whileHover={canResend ? { scale: 1.05 } : {}}
                whileTap={canResend ? { scale: 0.95 } : {}}
                className={`text-sm font-medium tracking-wide ${canResend
                  ? "text-blue-500 hover:text-blue-600 hover:underline"
                  : "text-gray-400 cursor-not-allowed"
                  }`}
                disabled={!canResend}
                onClick={handleReSendOtp}
              >
                {canResend
                  ? "Gửi lại mã OTP"
                  : `Gửi lại mã OTP sau ${resendTime}s`}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
