import { X, Mail, Phone, MapPin, Calendar, Cake, User, Shield, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import userService from "../../service/userService";

export const UserDetailModal = ({ isOpen, onClose, userId }) => {
  const [userDetail, setUserDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetail();
    }
  }, [isOpen, userId]);

  const fetchUserDetail = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getUserByAccount(userId);
      setUserDetail(response.data);
      console.log("Chi tiết tài khoản:", response.data);
    } catch (error) {
      console.error("Error fetching user detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGenderText = (gender) => {
    const genderMap = {
      MALE: "Nam",
      FEMALE: "Nữ",
      OTHER: "Khác",
    };
    return genderMap[gender] || "Không xác định";
  };

  const getGenderColor = (gender) => {
    const colorMap = {
      MALE: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
      FEMALE: "text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30",
      OTHER: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30",
    };
    return colorMap[gender] || "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 dark:text-gray-400">Đang tải thông tin...</p>
                </div>
              </div>
            ) : userDetail ? (
              <>
                {/* Header với Cover */}
                <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600">
                  {userDetail.coverUrl ? (
                    <img
                      src={userDetail.coverUrl || "/cover-default.png"}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600" />
                  )}
                  
                  {/* Close Button */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={24} className="text-white" />
                  </motion.button>

                  {/* Avatar */}
                  <div className="absolute -bottom-16 left-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="relative"
                    >
                      <img
                        src={userDetail.avatarUrl || "/default.png"}
                        alt={userDetail.fullName}
                        className="w-32 h-32 rounded-2xl object-cover border-4 border-white dark:border-zinc-900 shadow-xl"
                      />
                      {userDetail.isVerified && (
                        <div className="absolute -bottom-1 -right-1 p-1 bg-blue-500 rounded-full border-2 border-white dark:border-zinc-900">
                          <CheckCircle size={20} className="text-white" />
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-12rem)] p-8 pt-20">
                  {/* Name & Bio */}
                  <div className="mb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                          {userDetail.fullName || "Chưa cập nhật"}
                          {userDetail.isVerified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                              <Shield size={14} className="mr-1" />
                              Đã xác minh
                            </span>
                          )}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          ID: {userDetail.accountId}
                        </p>
                      </div>
                    </div>
                    {userDetail.bio && (
                      <p className="text-gray-600 dark:text-gray-300 mt-3 whitespace-pre-wrap">
                        {userDetail.bio}
                      </p>
                    )}
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Email */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                    >
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Mail size={20} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {userDetail.email || "Chưa cập nhật"}
                        </p>
                      </div>
                    </motion.div>

                    {/* Phone */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                    >
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Phone size={20} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Số điện thoại</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {userDetail.phoneNumber || "Chưa cập nhật"}
                        </p>
                      </div>
                    </motion.div>

                    {/* Gender */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                    >
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <User size={20} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Giới tính</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-sm font-medium ${getGenderColor(userDetail.gender)}`}>
                          {getGenderText(userDetail.gender)}
                        </span>
                      </div>
                    </motion.div>

                    {/* Birthday */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                    >
                      <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                        <Cake size={20} className="text-pink-600 dark:text-pink-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ngày sinh</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(userDetail.dayOfBirth)}
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            ({userDetail.age} tuổi)
                          </span>
                        </p>
                      </div>
                    </motion.div>

                    {/* Address */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl md:col-span-2"
                    >
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <MapPin size={20} className="text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Địa chỉ</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {userDetail.address || "Chưa cập nhật"}
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Timestamps */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="border-t border-gray-200 dark:border-gray-700 pt-6"
                  >
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                      <Calendar size={16} />
                      Thông tin hệ thống
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Ngày tạo</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDateTime(userDetail.createAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Calendar size={18} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Cập nhật lần cuối</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDateTime(userDetail.updateAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <XCircle size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">Không tìm thấy thông tin người dùng</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};