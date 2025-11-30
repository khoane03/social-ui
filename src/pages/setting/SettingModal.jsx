import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PasswordSection } from "./PasswordSection";
import { TwoFASection } from "./TwoFASection";
import { IdentitySection } from "./IdentitySection";

export const SettingModal = ({ onClose }) => {
  const { account } = useAuth();

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    if(!account) return;
    if (account) {
      setIs2FAEnabled(account.twoFactorAuth);
    }
  }, [account]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

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
          className="bg-white rounded-2xl shadow-2xl max-h-[80vh] w-full max-w-md overflow-y-scroll scroll-smooth dark:bg-zinc-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b dark:border-zinc-800 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-900">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              Cài đặt bảo mật
            </h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <PasswordSection  
              accountId={account?.id}
            />
            <TwoFASection
              accountId={account?.id}
              initial2FA={is2FAEnabled}
            />
            <IdentitySection />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
