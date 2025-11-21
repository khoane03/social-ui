import { BadgeCheck, MapPin, SwitchCamera, UserRoundCog, X, Upload } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { UpdateProfile } from "./UpdateProfile";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import userService from "../../service/userService";
import { useAlerts } from "../../context/AlertContext";

export const Header = () => {
  const { user, getCurrentUser } = useAuth();
  const { addAlert } = useAlerts();
  const { id } = useParams();
  const [updateProfile, setUpdateProfile] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadType, setUploadType] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const openUploadModal = (type) => {
    setUploadType(type);
    setImagePreview(null);
    setSelectedFile(null);
    setShowImageUpload(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (!selectedFile) {
      addAlert({
        type: "warning",
        message: "Vui lòng chọn ảnh"
      });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('id', user.id);
      formData.append('file', selectedFile);
      formData.append('type', uploadType);

      await userService.uploadImage(formData);

      addAlert({
        type: "success",
        message: `Cập nhật ${uploadType === 'AVATAR' ? 'ảnh đại diện' : 'ảnh bìa'} thành công`
      });

      setShowImageUpload(false);
      setImagePreview(null);
      setSelectedFile(null);
      await getCurrentUser();
    } catch (error) {
      addAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi máy chủ!",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    setShowImageUpload(false);
    setImagePreview(null);
    setSelectedFile(null);
    setUploadType(null);
  };

  return (
    <>
      {updateProfile && (
        <UpdateProfile onClose={() => setUpdateProfile(false)} />
      )}

      <AnimatePresence>
        {showImageUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white">
                  Cập nhật {uploadType === 'AVATAR' ? 'ảnh đại diện' : 'ảnh bìa'}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 dark:text-white" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden ${uploadType === 'AVATAR' ? 'h-64 flex justify-center items-center' : 'h-48'
                    }`}>
                    {imagePreview ? (
                      <motion.img
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={imagePreview}
                        alt="Preview"
                        className={`object-cover ${uploadType === 'AVATAR'
                          ? 'w-48 h-48 rounded-full'
                          : 'w-full h-full'
                          }`}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Chọn {uploadType === 'AVATAR' ? 'ảnh đại diện' : 'ảnh bìa'}
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="image-upload"
                    hidden
                  />
                  <motion.label
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    htmlFor="image-upload"
                    className="absolute bottom-3 right-3 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-sm font-medium shadow-lg"
                  >
                    {imagePreview ? 'Thay đổi' : 'Chọn ảnh'}
                  </motion.label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeModal}
                  disabled={isUploading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white font-medium disabled:opacity-50"
                >
                  Hủy
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveImage}
                  disabled={isUploading || !selectedFile}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Đang tải...' : 'Lưu'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        style={{
          backgroundImage: user?.coverUrl ? `url(${user.coverUrl})` : "cover_default.jpg",
        }}
        className={`relative select-none md:rounded-2xl bg-cover bg-center p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 dark:text-white text-bg-white-theme`}>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openUploadModal('COVER')}
          className="absolute bottom-2 right-2 w-8 h-8 md:w-10 md:h-10 dark:bg-gray-800/90 bg-white/90 backdrop-blur-sm rounded-full p-1.5 text-white z-20 flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
          title="Cập nhật ảnh bìa"
        >
          <SwitchCamera className="w-5 h-5 md:w-6 md:h-6" />
        </motion.button>
        <div className="absolute md:rounded-2xl inset-0 bg-black/60 z-0" />
        <div className="relative rounded-2xl z-10 flex flex-col md:flex-row items-center gap-4 w-full">
          <div className="relative">
            <img
              className="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover border-4 border-gray-700 shadow-md"
              src={user?.avatarUrl || "default.png"}
              alt="Profile"
            />
            <motion.button
              whileHover={{ scale: 1.15, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => openUploadModal('AVATAR')}
              className="absolute bottom-1 right-1 w-7 h-7 md:w-9 md:h-9 bg-gray-800/90 backdrop-blur-sm rounded-full p-1.5 text-white flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
              title="Cập nhật ảnh đại diện"
            >
              <SwitchCamera className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          </div>
          <div className="w-full md:w-auto">
            <div className="flex justify-center md:justify-start items-center mb-2">
              <h1 className="text-lg md:text-3xl font-bold ml-0 md:ml-2 text-white drop-shadow-md">
                {user?.fullName}
                {user?.bio && (
                  <span className="text-sm md:text-base ml-2 text-gray-300">({user?.bio})</span>
                )}
              </h1>
              {user?.isVerified && (
                <BadgeCheck className="ml-1 text-green-500 w-3 h-3 md:w-4 md:h-4" />
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUpdateProfile(!updateProfile)}
                className="flex items-center border px-2 py-1 ml-3 border-zinc-600 text-white rounded-xl bg-gray-900 hover:bg-gray-700 transition-all"
              >
                <UserRoundCog className="w-4 h-4 md:w-5 md:h-5 inline" />
                <span className="hidden md:inline ml-1">Chỉnh sửa</span>
              </motion.button>
            </div>
            <div className="flex flex-col text-xs md:text-sm text-zinc-300 ml-0 md:ml-2">
              <Stats />
              <div className="flex items-center mt-1 justify-center md:justify-start">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-white" />
                <span className="ml-2">{user?.address}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

const Stats = () => (
  <div className="flex items-center justify-center md:justify-start">
    <Stat label="Bài viết" value="100+" />
    <Stat label="Bạn bè" value="100+" className="ml-4" />
  </div>
);

const Stat = ({ label, value, className = "" }) => (
  <div className={className}>
    <span className="font-semibold text-white">{value}</span>
    <span className="ml-2">{label}</span>
  </div>
);