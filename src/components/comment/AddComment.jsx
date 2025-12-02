import { BadgeCheck, Send, Image, X, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlerts } from "../../context/AlertContext";
import actionService from "../../service/actionService";

export const AddComment = ({ postId, onClose, cmtSuccess }) => {
  const { user } = useAuth();
  const { addAlert } = useAlerts();
  const [comment, setComment] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type first
    if (!file.type.startsWith("image/")) {
      addAlert({
        type: "error",
        message: "Vui lòng chọn file ảnh hợp lệ!",
      });
      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addAlert({
        type: "error",
        message: "Kích thước ảnh không được vượt quá 5MB!",
      });
      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // All validations passed, proceed with file
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCommentSubmit = async (e) => {
    e?.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions
    if (!comment.trim() && !selectedImage) return;

    // Double check file size before submit
    if (selectedImage && selectedImage.size > 5 * 1024 * 1024) {
      addAlert({
        type: "error",
        message: "Kích thước ảnh không được vượt quá 5MB!",
      });
      handleRemoveImage();
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("content", comment);
      formData.append("mentionIds", JSON.stringify([]));
      
      if (selectedImage) {
        formData.append("images", selectedImage);
      }
      
      await actionService.addComment(formData);

      addAlert({
        type: "success",
        message: "Bình luận đã được thêm thành công!",
      });

      // Reset form
      setComment("");
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      if (onClose) onClose();
      if (cmtSuccess) cmtSuccess();
    } catch (error) {
      addAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi hệ thống, vui lòng thử lại!",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((comment.trim() || selectedImage) && !isSubmitting) {
        handleCommentSubmit();
      }
    }
  };

  return (
    <div className="mt-4 w-full">
      <div className="flex gap-2 sm:gap-3 w-full">
        {/* Avatar */}
        <img
          src={user?.avatarUrl || "/default.png"}
          alt="User Avatar"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 object-cover flex-shrink-0"
        />

        {/* Input Container */}
        <div className="flex-1 min-w-0">
          {/* User Info */}
          <div className="flex items-center gap-1 mb-2">
            <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
              {user?.fullName}
            </span>
            {user?.isVerified && (
              <BadgeCheck className="text-green-500 w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            )}
          </div>

          {/* Input Area */}
          <div className={`relative bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-purple-500 dark:focus-within:border-purple-500 transition-colors ${
            isSubmitting ? "opacity-60 pointer-events-none" : ""
          }`}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Viết bình luận..."
              rows={2}
              disabled={isSubmitting}
              className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm bg-transparent resize-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:cursor-not-allowed"
            />

            {/* Image Preview */}
            <AnimatePresence>
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 pb-3"
                >
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-32 sm:max-h-40 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                    />
                    {!isSubmitting && (
                      <button
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                        aria-label="Xóa ảnh"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 dark:border-gray-700">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={isSubmitting}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className={`p-1.5 sm:p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label="Thêm ảnh"
              >
                <Image className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={handleCommentSubmit}
                disabled={(!comment.trim() && !selectedImage) || isSubmitting}
                className={`p-1.5 sm:p-2 rounded-lg transition-all flex items-center gap-1 sm:gap-2 ${
                  (comment.trim() || selectedImage) && !isSubmitting
                    ? "bg-purple-600 hover:bg-purple-700 text-white hover:scale-105"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
                aria-label="Gửi bình luận"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                  {isSubmitting ? "Đang gửi..." : "Gửi"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};