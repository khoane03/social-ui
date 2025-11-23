import { BadgeCheck, MapPin, SwitchCamera, X, Upload } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { UpdateProfile } from "./UpdateProfile";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import userService from "../../service/userService";
import { useAlerts } from "../../context/AlertContext";
import { ImageModal } from "../common/ImageModal";

export const Header = () => {
  const { user, getCurrentUser } = useAuth();
  const { addAlert } = useAlerts();

  const [updateProfile, setUpdateProfile] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadType, setUploadType] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageToView, setImageToView] = useState(null);

  const openUploadModal = (type) => {
    setUploadType(type);
    setImagePreview(null);
    setSelectedFile(null);
    setShowImageUpload(true);
  };

  const closeModal = () => {
    setShowImageUpload(false);
    setImagePreview(null);
    setSelectedFile(null);
    setUploadType(null);
  };

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setSelectedFile(f);
      const r = new FileReader();
      r.onloadend = () => setImagePreview(r.result);
      r.readAsDataURL(f);
    }
  };

  const handleSaveImage = async () => {
    if (!selectedFile) {
      addAlert({ type: "warning", message: "Vui lòng chọn ảnh" });
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("id", user.id);
      formData.append("file", selectedFile);
      formData.append("type", uploadType);

      await userService.uploadImage(formData);

      addAlert({
        type: "success",
        message: `Cập nhật ${uploadType === "AVATAR" ? "ảnh đại diện" : "ảnh bìa"} thành công`,
      });

      closeModal();
      await getCurrentUser();
    } catch (e) {
      if (e.response?.status === 413) {
        addAlert({
          type: "error",
          message: "Ảnh tải lên quá lớn! Vui lòng chọn ảnh khác.",
        });
        return;
      } else {
        addAlert({
          type: "error",
          message: e?.response?.data?.message || e?.message || "Lỗi máy chủ!",
        });
      }

    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {updateProfile && <UpdateProfile onClose={() => setUpdateProfile(false)} />}

      <ImageModal
        imageUrl={imageToView}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

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
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white">
                  Cập nhật {uploadType === "AVATAR" ? "ảnh đại diện" : "ảnh bìa"}
                </h2>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5 dark:text-white" />
                </motion.button>
              </div>

              <div className="space-y-6 select-none">
                <div className="relative">
                  <div
                    className={`w-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden ${uploadType === "AVATAR"
                      ? "h-64 flex justify-center items-center"
                      : "h-48"
                      }`}
                  >
                    {imagePreview ? (
                      <motion.img
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={imagePreview}
                        alt="Preview"
                        className={`object-cover ${uploadType === "AVATAR"
                          ? "w-48 h-48 rounded-full"
                          : "w-full h-full"
                          }`}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Chọn ảnh
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
                    className="absolute bottom-3 right-3 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 text-sm shadow-lg"
                  >
                    {imagePreview ? "Thay đổi" : "Chọn ảnh"}
                  </motion.label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeModal}
                  disabled={isUploading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white font-medium disabled:opacity-50"
                >
                  Hủy
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveImage}
                  disabled={isUploading || !selectedFile}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {isUploading ? "Đang tải..." : "Lưu"}
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
        onClick={() => {
          setImageToView(user?.coverUrl || "cover_default.jpg");
          setIsModalOpen(true);
        }}
        className="relative select-none md:rounded-2xl bg-cover bg-center p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 dark:text-white text-bg-white-theme"
      >
        {isUploading && uploadType === "COVER" && (
          <div className="absolute inset-0 bg-black/40 z-30 flex items-center justify-center rounded-2xl">
            <div className="text-white font-semibold animate-pulse">Đang tải...</div>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            openUploadModal("COVER");
          }}
          className="absolute bottom-2 right-2 w-10 h-10 z-30 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 flex items-center justify-center shadow-lg"
        >
          <SwitchCamera className="w-6 h-6" />
        </motion.button>


        <div className="absolute inset-0 bg-black/60 md:rounded-2xl z-0" />

        <div className="relative rounded-2xl z-10 flex flex-col md:flex-row items-center gap-4 w-full">
          <div className="relative">
            <img
              onClick={(e) => {
                e.stopPropagation();
                setImageToView(user?.avatarUrl || "default.png");
                setIsModalOpen(true);
              }}
              className="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover border-4 border-gray-700 shadow-md"
              src={user?.avatarUrl || "default.png"}
              alt="Profile"
            />

            {isUploading && uploadType === "AVATAR" && (
              <div className="absolute inset-0 bg-black/40 rounded-full z-30 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.15, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                openUploadModal("AVATAR");
              }}
              className="absolute bottom-1 right-1 w-9 h-9 bg-gray-800/90 backdrop-blur-sm rounded-full p-1.5 text-white flex items-center justify-center shadow-lg"
            >
              <SwitchCamera className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="w-full md:w-auto">
            <div className="flex justify-center md:justify-start items-center mb-2">
              <h1 className="text-lg md:text-3xl font-bold text-white drop-shadow-md">
                {user?.fullName}
              </h1>
              {user?.isVerified && <BadgeCheck className="ml-1 text-green-500 w-4 h-4" />}
            </div>

            <div className="flex flex-col text-xs md:text-sm text-zinc-300">
              <Stats />
              <div className="flex items-center mt-1 justify-center md:justify-start">
                <MapPin className="w-5 h-5 text-white" />
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

const Stat = ({ label, value, className }) => (
  <div className={className}>
    <span className="font-semibold text-white">{value}</span>
    <span className="ml-2">{label}</span>
  </div>
);
