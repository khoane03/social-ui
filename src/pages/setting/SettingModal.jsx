import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, KeyRound, Shield, ChevronDown } from "lucide-react";
import { ToggleButton } from "../../components/button/ToggleButton";
import { useAlerts } from "../../context/AlertContext";
import { useAuth } from "../../context/AuthContext";
import accountService from "../../service/accountService";

export const SettingModal = ({ onClose }) => {
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    newPassword: "",
  });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordInputRef = useRef(null);
  const { addAlert } = useAlerts();
  const { account, getCurrentUser } = useAuth();

  useEffect(() => {
    if (account?.twoFactorAuth !== undefined) {
      setFormData(prev => ({ ...prev, id: account.id }));
      setIs2FAEnabled(account.twoFactorAuth);
    }
  }, [account]);

  useEffect(() => {
    if (showPasswordFields && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [showPasswordFields]);

  const resetForm = useCallback(() => {
    setFormData({ password: "", newPassword: "" });
    setShowPasswordFields(false);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    resetForm();
  }, [onClose, resetForm]);

  const handleInputChange = useCallback((field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleChange2FA = async () => {
    if (!account?.id) return;

    try {
      setIsLoading(true);
      await accountService.twoFA(account.id);
      setIs2FAEnabled(prev => !prev);
      await getCurrentUser();
      addAlert({
        type: "success",
        message: `${is2FAEnabled ? "Tắt" : "Bật"} 2FA thành công.`
      });
    } catch (error) {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Lỗi máy chủ!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePassword = useCallback(async () => {
    if (!formData.password || !formData.newPassword) return;

    try {
      setIsLoading(true);
      await accountService.changePass(formData);

      addAlert({
        type: "success",
        message: "Thay đổi mật khẩu thành công."
      });

      resetForm();
    } catch (error) {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Lỗi máy chủ!",
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, addAlert, resetForm]);

  const togglePasswordFields = useCallback(() => {
    setShowPasswordFields((prev) => !prev);
  }, []);

  const isPasswordValid = formData.password && formData.newPassword;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden dark:bg-zinc-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b dark:border-zinc-800 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-900">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-3"
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              Cài đặt bảo mật
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="p-6 space-y-6">
            {/* Password Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4"
            >
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={togglePasswordFields}
                className="flex items-center justify-between w-full cursor-pointer select-none group"
                type="button"
                aria-expanded={showPasswordFields}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
                    <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-gray-800 dark:text-white font-medium">
                    Đổi mật khẩu
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: showPasswordFields ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {showPasswordFields && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      initial={{ y: -10 }}
                      animate={{ y: 0 }}
                      className="space-y-3 mt-4 pt-4 border-t dark:border-zinc-700"
                    >
                      <input
                        ref={passwordInputRef}
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange("password")}
                        placeholder="Mật khẩu hiện tại"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-zinc-900 dark:text-white transition-all outline-none"
                      />
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={handleInputChange("newPassword")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSavePassword();
                        }}
                        placeholder="Mật khẩu mới"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-zinc-900 dark:text-white transition-all outline-none"
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSavePassword}
                        disabled={!isPasswordValid || isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 font-medium"
                      >
                        {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 2FA Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <span className="text-gray-800 dark:text-white font-medium block">
                      Xác thực hai bước
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      2FA
                    </span>
                  </div>
                </div>
                <ToggleButton
                  value={is2FAEnabled}
                  onChange={handleChange2FA}
                  disabled={isLoading}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Bảo vệ tài khoản bằng lớp xác thực thứ hai khi đăng nhập, tăng cường bảo mật cho tài khoản của bạn.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};