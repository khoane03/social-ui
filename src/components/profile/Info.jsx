import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { UpdateProfile } from "./UpdateProfile";
import {
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Cake,
  User,
  PencilLine,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router";
import { useAlerts } from "../../context/AlertContext";
import userService from "../../service/userService";

export const Info = () => {
  const { user, account } = useAuth();
  const { addAlert } = useAlerts();
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = useParams().id;

  const isOwnProfile = useMemo(() => user && String(user.id) === String(userId), [user, userId]);

  useEffect(() => {
    if (!userId) return;

    const loadUserInfo = async () => {
      try {
        if (isOwnProfile) {
          setUserInfo(user);
        } else {
          const response = await userService.getUserById(userId);
          setUserInfo(response.data);
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
        setLoading(false);
      }
    };

    loadUserInfo();
  }, [userId, user, isOwnProfile, addAlert]);

  const infoItems = useMemo(() => {
    if (!userInfo) return [];

    const items = [
      { icon: Phone, label: userInfo.phoneNumber, color: "from-emerald-400 to-teal-500" },
      { icon: Mail, label: isOwnProfile ? account?.email : null, color: "from-blue-400 to-indigo-500" },
      { icon: MapPin, label: userInfo.address, color: "from-rose-400 to-pink-500" },
      { icon: CalendarDays, label: userInfo.dayOfBirth ? new Date(userInfo.dayOfBirth).toLocaleDateString("vi-VN") : null, color: "from-amber-400 to-orange-500" },
      { icon: Cake, label: userInfo.age ? `${userInfo.age} tuổi` : null, color: "from-purple-400 to-violet-500" },
      { icon: User, label: userInfo.gender === "FEMALE" ? "Nữ" : userInfo.gender === "MALE" ? "Nam" : userInfo.gender === "OTHER" ? "Khác" : null, color: "from-cyan-400 to-blue-500" },
    ];

    return items.filter(i => i.label);
  }, [userInfo, isOwnProfile, account?.email]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 transition-colors">
      <motion.div className="max-w-2xl mx-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg rounded-2xl p-6 space-y-5 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Thông tin cá nhân
        </h2>

        {infoItems.length > 0 ? (
          <div className="space-y-3">
            {infoItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-white dark:bg-gray-800 px-4 py-3.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} shadow-sm`}>
                  <item.icon size={18} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Chưa có thông tin cá nhân
          </p>
        )}

        {isOwnProfile && (
          <button
            onClick={() => setShowUpdateProfile(true)}
            className="w-full sm:w-auto mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl"
          >
            <PencilLine size={18} />
            Chỉnh sửa thông tin
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {showUpdateProfile && <UpdateProfile onClose={() => setShowUpdateProfile(false)} />}
      </AnimatePresence>
    </div>
  );
};
