import { useState, useCallback, useEffect, createContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeInfo, Bell, Bug, CircleCheck, X } from "lucide-react";

const AlertContext = createContext(null);

function AlertProvider({ children }) {
    const [alerts, setAlerts] = useState([]);

    const addAlert = useCallback(({ type = "info", message, duration = 4000 }) => {
        const id = String(Date.now()) + Math.random().toString(36).slice(2, 9);
        const alert = { id, type, message, duration, timestamp: Date.now() };
        setAlerts((s) => [...s, alert]);
        return id;
    }, []);

    const removeAlert = useCallback((id) => {
        setAlerts((s) => s.filter((a) => a.id !== id));
    }, []);

    useEffect(() => {
        if (alerts.length === 0) return;

        // Tìm alert cũ nhất (xuất hiện đầu tiên)
        const oldestAlert = alerts[0];
        
        if (!oldestAlert.duration) return;

        const timer = setTimeout(() => {
            removeAlert(oldestAlert.id);
        }, oldestAlert.duration);

        return () => clearTimeout(timer);
    }, [alerts, removeAlert]);

    return (
        <AlertContext.Provider value={{ addAlert, removeAlert, alerts }}>
            {children}
            <AlertContainer alerts={alerts} removeAlert={removeAlert} />
        </AlertContext.Provider>
    );
}

function AlertContainer({ alerts, removeAlert }) {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="sync">
                {alerts.map((alert) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: 100, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="pointer-events-auto"
                    >
                        <AlertCard alert={alert} onClose={() => removeAlert(alert.id)} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

function AlertCard({ alert, onClose }) {
    const base = "w-80 max-w-[90vw] rounded-xl shadow-lg p-3 border flex items-start gap-3";
    const types = {
        success: "bg-emerald-50 border-emerald-200",
        error: "bg-red-50 border-red-200",
        warning: "bg-amber-50 border-amber-200",
        info: "bg-sky-50 border-sky-200",
    };

    const icon = {
        success: <CircleCheck className="text-green-500" />,
        error: <Bug className="text-red-500" />,
        warning: <BadgeInfo className="text-yellow-500" />,
        info: <Bell className="text-blue-500" />,
    };

    const typeLabels = {
        success: "Thành công",
        error: "Lỗi",
        warning: "Cảnh báo",
        info: "Thông báo",
    };
    
    const textColors = {
        success: "text-emerald-800",
        error: "text-red-800",
        warning: "text-amber-800",
        info: "text-sky-800",
    };

    return (
        <div className={`${base} ${types[alert.type] || types.info}`}>
            {icon[alert.type]}
            <div className="flex-1 min-w-0">
                <div className={`font-bold text-sm ${textColors[alert.type] || textColors.info}`}>
                    {typeLabels[alert.type] || "Thông báo"}
                </div>
                <div className="mt-1 text-sm text-slate-700 leading-relaxed break-words">
                    {alert.message}
                </div>
            </div>
            <button
                onClick={onClose}
                aria-label="Đóng thông báo"
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/10 active:bg-black/15 transition-colors"
            >
                <X className="w-4 h-4 text-slate-600" />
            </button>
        </div>
    );
}

export {
    AlertContext,
    AlertProvider
};