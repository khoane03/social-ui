import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { useState, useCallback } from "react";
import { useAlerts } from "../../context/AlertContext";
import postService from "../../service/postService";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const privacyOptions = [
  { value: "PUBLIC", label: "Công khai", icon: "🌍" },
  { value: "FRIENDS", label: "Bạn bè", icon: "👥" },
  { value: "PRIVATE", label: "Riêng tư", icon: "🔒" }
];

export const EditPost = ({ post, onClose, onSuccess }) => {
  const [content, setContent] = useState(post?.content || "");
  const [privacy, setPrivacy] = useState(post?.privacy || "PUBLIC");
  const [images, setImages] = useState(post?.urls || []);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addAlert } = useAlerts();

  const handleImageChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length + newImages.length > 10) {
      addAlert({
        type: "warning",
        message: "Chỉ được phép tải lên tối đa 10 ảnh"
      });
      return;
    }

    const imageUrls = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    }));
    setNewImages(prev => [...prev, ...imageUrls]);
  }, [images.length, newImages.length, addAlert]);

  const handleRemoveImage = useCallback((index, isNew) => {
    if (isNew) {
      setNewImages(prev => {
        const updated = [...prev];
        URL.revokeObjectURL(updated[index].preview);
        updated.splice(index, 1);
        return updated;
      });
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) {
      addAlert({
        type: "warning",
        message: "Vui lòng nhập nội dung bài viết"
      });
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append("content", content);
      formData.append("privacy", privacy);
      
      // Add existing images URLs
      images.forEach(url => {
        formData.append("existingImages", url);
      });
      
      // Add new images files
      newImages.forEach(img => {
        formData.append("images", img.file);
      });

      await postService.updatePost(post.id, formData);
      
      addAlert({
        type: "success",
        message: "Cập nhật bài viết thành công!"
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Có lỗi xảy ra khi cập nhật bài viết"
      });
    } finally {
      setLoading(false);
    }
  }, [content, privacy, images, newImages, post.id, addAlert, onClose, onSuccess]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  }, [loading, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white dark:bg-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-zinc-700">
            <h2 className="text-xl font-semibold dark:text-white">Chỉnh sửa bài viết</h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
            >
              <X size={20} className="dark:text-white" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-4">
            {/* Privacy Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quyền riêng tư
              </label>
              <div className="flex gap-2">
                {privacyOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPrivacy(option.value)}
                    disabled={loading}
                    className={`flex-1 px-4 py-2 rounded-xl border-2 transition-all ${
                      privacy === option.value
                        ? "border-[#7F9FEF] bg-[#7F9FEF]/10 text-[#7F9FEF] dark:bg-[#7F9FEF]/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:text-white"
                    } disabled:opacity-50`}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Content Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              placeholder="Bạn đang nghĩ gì?"
              className="w-full min-h-[120px] p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#7F9FEF] focus:outline-none resize-none dark:bg-zinc-900 dark:text-white disabled:opacity-50 transition-colors"
            />

            {/* Images Preview */}
            {(images.length > 0 || newImages.length > 0) && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {/* Existing Images */}
                {images.map((url, index) => (
                  <motion.div
                    key={`existing-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group aspect-square"
                  >
                    <img
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveImage(index, false)}
                      disabled={loading}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </motion.div>
                ))}

                {/* New Images */}
                {newImages.map((img, index) => (
                  <motion.div
                    key={`new-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group aspect-square"
                  >
                    <img
                      src={img.preview}
                      alt={`New image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border-2 border-green-400"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                      Mới
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveImage(index, true)}
                      disabled={loading}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Add Images Button */}
            <motion.label
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-[#7F9FEF] transition-colors"
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
                className="hidden"
              />
              <ImageIcon size={20} className="dark:text-white" />
              <span className="text-sm font-medium dark:text-white">Thêm ảnh</span>
            </motion.label>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-4 border-t dark:border-zinc-700">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Hủy
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#7F9FEF] text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[#7F9FEF]/30 hover:shadow-xl hover:shadow-[#7F9FEF]/40 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                "Cập nhật"
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};