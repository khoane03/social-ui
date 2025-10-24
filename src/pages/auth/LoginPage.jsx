import { Eye, EyeOff, User, KeyRound } from "lucide-react";
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
  const { addAlert } = useAlerts();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [requireOtp, setRequireOtp] = useState(false);
  const [resendTime, setResendTime] = useState(60);
  const [canResend, setCanResend] = useState(true);
  const { login, getCurrentUser } = useAuth();
  const navigate = useNavigate();

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

      setTimeout(() => {
        navigate("/");
      }, 1500);
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
  }

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
    if (requireOtp && otpRef.current) {
      otpRef.current.focus();
    } else if (!requireOtp && formRef.current) {
      formRef.current.focus();
    }
  }, [requireOtp]);
  if (isLoading) return <IntroLoading />;
  return (
    <div className="flex flex-col md:flex-row gap-4 md:rounded-4xl w-full h-full overflow-hidden select-none">
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
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
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex items-center justify-between w-full max-w-sm px-2"
              >
                <label
                  htmlFor="remember-me"
                  className="inline-flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id="remember-me"
                    className="h-4 w-4 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Nhớ mật khẩu
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="w-full max-w-sm"
              >
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#60a5fa" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  className="w-full bg-[#7F9FEF] text-white font-semibold py-2.5 rounded-2xl mt-2"
                >
                  Đăng nhập
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
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-semibold text-2xl text-center py-4"
              >
                Xác thực OTP
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-sm text-gray-600 text-center max-w-sm px-4"
              >
                Vui lòng nhập mã OTP 6 số đã được gửi đến bạn
              </motion.p>

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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full max-w-sm flex flex-col gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#60a5fa" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleVerifyOtp}
                  className="w-full bg-[#7F9FEF] text-white font-semibold py-2.5 rounded-2xl"
                >
                  Xác nhận
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBackToLogin}
                  className="w-full bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-2xl hover:bg-gray-300 transition-colors"
                >
                  Quay lại
                </motion.button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center mt-4"
              >
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

                {!canResend && (
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: `${(resendTime / 60) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                    className="h-0.5 bg-blue-400 rounded-full mt-2"
                    style={{ maxWidth: "120px" }}
                  />
                )}
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};