import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, ChevronDown } from "lucide-react";
import { useAlerts } from "../../context/AlertContext";
import accountService from "../../service/accountService";

export const PasswordSection = ({ accountId }) => {
  const { addAlert } = useAlerts();
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [formData, setFormData] = useState({ id: accountId, password: "", newPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState("");
  const passwordInputRef = useRef(null);

  useEffect(() => {
    if (showPasswordFields && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [showPasswordFields]);

  const resetForm = useCallback(() => {
    setFormData({ id: accountId, password: "", newPassword: "" });
    setNewPasswordError("");
  }, [accountId]);

  const togglePasswordFields = useCallback(() => {
    setShowPasswordFields(prev => !prev);
  }, []);

  const handleInputChange = useCallback((field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

    // validate mật khẩu mới
    if (field === "newPassword") {
      const value = e.target.value;
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!regex.test(value)) {
        setNewPasswordError("Mật khẩu phải ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số");
      } else {
        setNewPasswordError("");
      }
    }
  }, []);

  const handleSavePassword = useCallback(async () => {
    if (!formData.password || !formData.newPassword) return;
    if (newPasswordError) return;

    try {
      setIsLoading(true);
      await accountService.changePass(formData);
      addAlert({ type: "success", message: "Thay đổi mật khẩu thành công." });
      resetForm();
      setShowPasswordFields(false);
    } catch (error) {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Lỗi máy chủ!"
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, addAlert, resetForm, newPasswordError]);

  const isPasswordValid = formData.password && formData.newPassword && !newPasswordError;

  return (
    <motion.div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
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
          <span className="text-gray-800 dark:text-white font-medium">Đổi mật khẩu</span>
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
            className="overflow-hidden mt-4"
          >
            <div className="space-y-3 pt-4 border-t dark:border-zinc-700">
              <input
                ref={passwordInputRef}
                type="password"
                value={formData.password}
                onChange={handleInputChange("password")}
                placeholder="Mật khẩu hiện tại"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-zinc-900 dark:text-white outline-none"
              />
              <input
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange("newPassword")}
                onKeyDown={(e) => { if (e.key === "Enter") handleSavePassword(); }}
                placeholder="Mật khẩu mới"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-zinc-900 dark:text-white outline-none"
              />
              {newPasswordError && (
                <p className="text-sm text-red-500">{newPasswordError}</p>
              )}
              <button
                onClick={handleSavePassword}
                disabled={!isPasswordValid || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 font-medium"
              >
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
