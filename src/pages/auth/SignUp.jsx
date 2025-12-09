import { Link, useNavigate } from "react-router";
import { Stepper } from "../../components/stepper/Stepper";
import { IntroLoading } from "../../components/common/IntroLoading";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RegisterAccount } from "../../components/auth/ResgisterAccount";
import RegisterUser from "../../components/auth/RegisterUser";
import { useAlerts } from "../../context/AlertContext";
import authService from "../../service/authService";
import { useAuth } from "../../context/AuthContext";
import userService from "../../service/userService";

export const SignUpPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const { addAlert } = useAlerts();
  const { login, getCurrentUser } = useAuth();
  const navigation = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  document.title = "Đăng ký tài khoản";

  const handleRegisterAccount = async (form) => {
    try {
      setLoading(true);
      await authService.signup(form?.email, form?.password);
      const { data } = await authService.login(form?.email, form?.password);
      await login(data?.accessToken, data?.refreshToken);
      addAlert({ type: "success", message: "Đăng ký tài khoản thành công!" });
      setCurrentStep(1);
    } catch (error) {
      addAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi hệ thống, vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterUser = async (data) => {
    try {
      setLoading(true);
      await userService.createUserProfile(data);
      await getCurrentUser();
      addAlert({ type: "success", message: "Đăng ký người dùng thành công!" });

      // ✅ Hiển thị intro loading sau khi hoàn tất
      setShowIntro(true);
      setTimeout(() => {
        navigation("/");
      }, 2000);
    } catch (error) {
      addAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi hệ thống, vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showIntro) return <IntroLoading />;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <RegisterAccount onSubmit={handleRegisterAccount} loading={loading} />;
      case 1:
        return <RegisterUser onSubmit={handleRegisterUser} loading={loading} />;
      default:
        return <IntroLoading />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:rounded-4xl w-full h-full overflow-hidden select-none">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-7 flex flex-col items-center justify-start"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-semibold text-2xl text-center py-4 "
        >
          Đăng ký
        </motion.h2>

        <Stepper currentStep={currentStep} />

        <div className="flex flex-col items-center justify-center w-full max-w-md p-4 gap-y-4 mt-2">
          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
        </div>
      </motion.div>

      <motion.div
        initial={
          isMobile
            ? { opacity: 0, x: 0, y: "100%" }
            : { opacity: 0, x: "100%", y: 0 }
        }
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={
          isMobile
            ? { opacity: 0, x: 0, y: "100%" }
            : { opacity: 0, x: 80, y: 0 }
        }
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex-5 md:flex-7 flex flex-col items-center justify-center gap-4 bg-[#7F9FEF] rounded-t-[25%] md:rounded-r-4xl md:rounded-l-[35%] p-8"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-3xl md:text-4xl font-semibold text-white"
        >
          Chào mừng!
        </motion.h1>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-base md:text-lg text-white/90"
        >
          Bạn đã có tài khoản? Hãy bắt đầu ngay!
        </motion.span>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/auth"
            className="inline-block px-6 py-2.5 border-2 border-white text-white rounded-2xl font-medium hover:bg-white hover:text-[#7F9FEF] transition-colors duration-300"
          >
            Đăng nhập
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};