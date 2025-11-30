import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { ToggleButton } from "../../components/button/ToggleButton";
import { useAlerts } from "../../context/AlertContext";
import { useAuth } from "../../context/AuthContext";
import accountService from "../../service/accountService";

export const TwoFASection = ({ initial2FA, accountId }) => {
    const { getCurrentUser } = useAuth();
    const { addAlert } = useAlerts();
    const [is2FAEnabled, setIs2FAEnabled] = useState(initial2FA || false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange2FA = useCallback(async () => {
        if (!accountId) return;

        try {
            setIsLoading(true);
            await accountService.twoFA(accountId);

            const newStatus = !is2FAEnabled;
            setIs2FAEnabled(newStatus);

            await getCurrentUser();
            addAlert({
                type: "success",
                message: `${newStatus ? "Tắt" : "Bật"} 2FA thành công.`,
            });
        } catch (error) {
            addAlert({
                type: "error",
                message: error?.response?.data?.message || error?.message || "Lỗi máy chủ!",
            });
        } finally {
            setIsLoading(false);
        }
    }, [accountId, addAlert, getCurrentUser, is2FAEnabled]);


    return (
        <motion.div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
                        <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <span className="text-gray-800 dark:text-white font-medium block">
                            Xác thực hai bước
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">2FA</span>
                    </div>
                </div>
                <ToggleButton
                    value={initial2FA}
                    onChange={handleChange2FA}
                    disabled={isLoading}
                />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Bảo vệ tài khoản bằng lớp xác thực thứ hai khi đăng nhập, tăng cường bảo mật cho tài khoản của bạn.
            </p>
        </motion.div>
    );
};
