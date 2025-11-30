import { X, User, Hash, Calendar, FileText, Image as ImageIcon, CheckCircle, Mail, Phone, MapPin, Cake } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";

// Constants
const STATUS_MAP = {
  PENDING: {
    label: "Chờ duyệt",
    className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  },
  APPROVED: {
    label: "Đã duyệt",
    className: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  },
  REJECTED: {
    label: "Đã từ chối",
    className: "bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400",
  },
};

const GENDER_MAP = {
  MALE: { text: "Nam", color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30" },
  FEMALE: { text: "Nữ", color: "text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30" },
  OTHER: { text: "Khác", color: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30" },
};

// Utility functions
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

// Sub-components
const InfoCard = ({ icon: Icon, label, value, iconBg, iconColor, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
  >
    <div className={`p-2 ${iconBg} rounded-lg`}>
      <Icon size={20} className={iconColor} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <div className="font-medium text-gray-900 dark:text-white truncate">
        {value}
      </div>
    </div>
  </motion.div>
);

const ImagePreview = ({ url, alt, label, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="cursor-pointer group"
    onClick={onClick}
  >
    <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <img
        src={url}
        alt={alt}
        className="w-full h-64 object-contain group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 text-white font-medium bg-black/50 px-4 py-2 rounded-lg">
          Nhấn để phóng to
        </span>
      </div>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center font-medium">
      {label}
    </p>
  </motion.div>
);

export const VerificationDetailModal = ({ isOpen, onClose, requestData }) => {
  const [imagePreview, setImagePreview] = useState(null);

  const userProfile = useMemo(() => requestData?.userProfile, [requestData]);
  
  const statusBadge = useMemo(
    () => STATUS_MAP[requestData?.status] || STATUS_MAP.PENDING,
    [requestData?.status]
  );

  const genderInfo = useMemo(
    () => GENDER_MAP[userProfile?.gender] || { 
      text: "Không xác định", 
      color: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30" 
    },
    [userProfile?.gender]
  );

  if (!isOpen || !requestData) return null;

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
            className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Chi tiết yêu cầu xác minh
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    ID: {requestData.id}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="Đóng"
                >
                  <X size={24} className="text-gray-500 dark:text-gray-400" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-5rem)] p-6">
              {/* User Profile Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User size={20} />
                  Thông tin người dùng
                </h3>

                {/* Avatar & Basic Info */}
                <div className="flex items-start gap-6 mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
                  <img
                    src={userProfile?.avatarUrl || "https://via.placeholder.com/100"}
                    alt={userProfile?.fullName || "Avatar"}
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-zinc-800 shadow-lg"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userProfile?.fullName || "N/A"}
                      </h4>
                      {userProfile?.isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          <CheckCircle size={14} />
                          Đã xác minh
                        </span>
                      )}
                    </div>
                    {userProfile?.bio && (
                      <p className="text-gray-600 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                        {userProfile.bio}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>ID: {userProfile?.accountId}</span>
                      <span>•</span>
                      <span>Tuổi: {userProfile?.age}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard
                    icon={Mail}
                    label="Email"
                    value={userProfile?.email || "Chưa cập nhật"}
                    iconBg="bg-indigo-100 dark:bg-indigo-900/30"
                    iconColor="text-indigo-600 dark:text-indigo-400"
                    delay={0.1}
                  />

                  <InfoCard
                    icon={Phone}
                    label="Số điện thoại"
                    value={userProfile?.phoneNumber || "Chưa cập nhật"}
                    iconBg="bg-green-100 dark:bg-green-900/30"
                    iconColor="text-green-600 dark:text-green-400"
                    delay={0.15}
                  />

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
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-sm font-medium ${genderInfo.color}`}>
                        {genderInfo.text}
                      </span>
                    </div>
                  </motion.div>

                  <InfoCard
                    icon={Cake}
                    label="Ngày sinh"
                    value={formatDate(userProfile?.dayOfBirth)}
                    iconBg="bg-pink-100 dark:bg-pink-900/30"
                    iconColor="text-pink-600 dark:text-pink-400"
                    delay={0.25}
                  />

                  <InfoCard
                    icon={MapPin}
                    label="Địa chỉ"
                    value={userProfile?.address || "Chưa cập nhật"}
                    iconBg="bg-red-100 dark:bg-red-900/30"
                    iconColor="text-red-600 dark:text-red-400"
                    delay={0.3}
                  />
                </div>
              </motion.div>

              {/* Verification Info Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Thông tin CCCD
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash size={16} className="text-gray-400" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Số CCCD</p>
                    </div>
                    <p className="font-mono font-semibold text-gray-900 dark:text-white">
                      {requestData.citizenId}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={16} className="text-gray-400" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Ngày cấp</p>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(requestData.dateOfIssue)}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-gray-400" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Trạng thái</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${statusBadge.className}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Images Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ImageIcon size={20} />
                  Hình ảnh CCCD
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImagePreview
                    url={requestData.frontImageUrl}
                    alt="CCCD mặt trước"
                    label="Mặt trước"
                    onClick={() => setImagePreview(requestData.frontImageUrl)}
                  />
                  <ImagePreview
                    url={requestData.backImageUrl}
                    alt="CCCD mặt sau"
                    label="Mặt sau"
                    onClick={() => setImagePreview(requestData.backImageUrl)}
                  />
                </div>
              </motion.div>

              {/* Timestamps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8"
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
                        {formatDateTime(userProfile?.createAt)}
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
                        {formatDateTime(userProfile?.updateAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Image Preview Modal */}
          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setImagePreview(null)}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
              >
                <motion.img
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                />
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Đóng preview"
                >
                  <X size={24} className="text-white" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};