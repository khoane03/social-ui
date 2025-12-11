import { BadgeCheck, Dot, MoreHorizontal, Trash2, Edit, Reply, X, Send, Image as ImageIcon, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import actionService from "../../service/actionService";
import { formatTime } from "../../service/ultilsService";
import { ImageModal } from "../common/ImageModal";
import { useAuth } from "../../context/AuthContext";
import { useAlerts } from "../../context/AlertContext";
import commentService from "../../service/commentService";

export const ListComment = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const { user } = useAuth();
  const { addAlert } = useAlerts();
  const [selectedImage, setSelectedImage] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyImage, setReplyImage] = useState(null);
  const [replyImagePreview, setReplyImagePreview] = useState(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  const [repliesData, setRepliesData] = useState({});
  const fileInputRef = useRef(null);
  const replyInputRef = useRef(null);

  useEffect(() => {
    if (postId) {
      (async () => {
        try {
          const res = await actionService.getCommentsByPost(postId);
          setComments(res.data);
        } catch (error) {
          addAlert({
            type: "error",
            message:
              error?.response?.data?.message ||
              error?.message ||
              "Lỗi hệ thống, vui lòng thử lại!",
          });
        }
      })();
    }
  }, [postId]);

  useEffect(() => {
    if (replyingTo && replyInputRef.current) {
      const cursorPosition = replyContent.length;
      replyInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      replyInputRef.current.focus();
    }
  }, [replyingTo, replyContent]);

  const handleDeleteComment = async (commentId) => {
    try {
      await actionService.deleteComment(commentId);
      addAlert({
        type: "success",
        message: "Xóa bình luận thành công!",
      });
      setComments(comments.filter((c) => c.id !== commentId));
      setOpenMenuId(null);
    } catch (error) {
      addAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi hệ thống, vui lòng thử lại!",
      });
    }
  };

  const handleReply = (commentId, userName) => {
    setReplyingTo({ id: commentId, userName });
    setReplyContent(`@${userName} `);

    // Set cursor position after @name
    setTimeout(() => {
      if (replyInputRef.current) {
        const cursorPosition = `@${userName} `.length;
        replyInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        replyInputRef.current.focus();
      }
    }, 0);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
    setReplyImage(null);
    setReplyImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addAlert({
        type: "error",
        message: "Vui lòng chọn file ảnh hợp lệ!",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addAlert({
        type: "error",
        message: "Kích thước ảnh không được vượt quá 5MB!",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setReplyImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReplyImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setReplyImage(null);
    setReplyImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitReply = async () => {
    if (isSubmittingReply) return;
    if (!replyContent.trim() && !replyImage) return;

    try {
      setIsSubmittingReply(true);

      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("content", replyContent);
      formData.append("parentId", replyingTo.id);
      formData.append("mentionIds", JSON.stringify([]));

      if (replyImage) {
        formData.append("images", replyImage);
      }

      await actionService.addComment(formData);

      addAlert({
        type: "success",
        message: "Trả lời bình luận thành công!",
      });

      // Refresh comments
      const { data } = await actionService.getCommentsByPost(postId);
      setComments(data);

      // If replies are already loaded, refresh them
      if (expandedComments[replyingTo.id]) {
        await loadReplies(replyingTo.id);
      }

      handleCancelReply();
    } catch (error) {
      addAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi hệ thống, vui lòng thử lại!",
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((replyContent.trim() || replyImage) && !isSubmittingReply) {
        handleSubmitReply();
      }
    }
  };

  const loadReplies = async (commentId) => {
    if (loadingReplies[commentId]) return;

    try {
      setLoadingReplies(prev => ({ ...prev, [commentId]: true }));

      const { data } = await commentService.getRepliesByComment(commentId);
      console.log("Fetched replies for comment", data);
      setRepliesData(prev => ({ ...prev, [commentId]: data }));
      setExpandedComments(prev => ({ ...prev, [commentId]: true }));

    } catch (error) {
      console.error("Error loading replies:", error);
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Không thể tải phản hồi!",
      });
    } finally {
      setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const toggleReplies = async (commentId) => {
    if (expandedComments[commentId]) {
      // Collapse replies
      setExpandedComments(prev => ({ ...prev, [commentId]: false }));
    } else {
      // Load and expand replies
      await loadReplies(commentId);
    }
  };

  const canManageComment = (comment) => {
    return user?.id === comment?.commentator?.id || user?.id === comment?.authorPostId;
  };

  const renderComment = (comment, isReply = false) => (
    <motion.div
      key={comment.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 py-4 ${!isReply ? 'border-b dark:border-zinc-700 border-gray-200' : ''}`}
    >
      <img
        src={comment?.commentator?.avatarUrl || "/default.png"}
        alt={`${comment?.commentator?.fullName}'s avatar`}
        className={`${isReply ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-9 h-9 sm:w-10 sm:h-10'} rounded-full object-cover flex-shrink-0 border-2 border-gray-200 dark:border-gray-700`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-wrap gap-1">
            <span className="font-semibold text-xs sm:text-sm flex items-center dark:text-white text-gray-900">
              {comment?.commentator?.fullName}
              {comment?.commentator?.isVerified && (
                <BadgeCheck className="ml-1 text-green-500 w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </span>
            <span className="text-zinc-400 text-xs flex items-center">
              <Dot className="w-4 h-4" />
              {formatTime(comment?.createdAt)}
            </span>
          </div>

          {canManageComment(comment) && (
            <div className="relative">
              <button
                onClick={() =>
                  setOpenMenuId(openMenuId === comment.id ? null : comment.id)
                }
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Tùy chọn"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>

              <AnimatePresence>
                {openMenuId === comment.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                  >
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-b-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {comment.content && (
          <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 mt-1 break-words">
            {comment.content}
          </p>
        )}

        {comment.imgUrls && comment.imgUrls.length > 0 && (
          <div
            className={`mt-2 grid gap-2 ${comment.imgUrls.length === 1
              ? "grid-cols-1"
              : comment.imgUrls.length === 2
                ? "grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3"
              }`}
          >
            {comment.imgUrls.map((imgUrl, imgIndex) => (
              <motion.div
                key={imgIndex}
                whileHover={{ scale: 1.02 }}
                className="relative cursor-pointer group overflow-hidden rounded-lg"
                onClick={() => setSelectedImage(imgUrl)}
              >
                <img
                  src={imgUrl}
                  alt={`Comment image ${imgIndex + 1}`}
                  className="w-full h-32 sm:h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-700 group-hover:brightness-75 transition-all"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-lg">
                    Xem
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => handleReply(comment.id, comment?.commentator?.fullName)}
            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
          >
            <Reply className="w-3.5 h-3.5" />
            Trả lời
          </button>

          {comment.repliesCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleReplies(comment.id)}
              disabled={loadingReplies[comment.id]}
              className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium disabled:opacity-50"
            >
              {loadingReplies[comment.id] ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tải...</span>
                </>
              ) : expandedComments[comment.id] ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Ẩn phản hồi ({comment.repliesCount})</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Xem {comment.repliesCount} phản hồi</span>
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Reply Form */}
        {/* Reply Form */}
        <AnimatePresence>
          {replyingTo?.id === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="flex gap-2">
                <img
                  src={user?.avatarUrl || "/default.png"}
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className={`relative bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-purple-500 dark:border-purple-500 transition-colors ${isSubmittingReply ? "opacity-60 pointer-events-none" : ""
                    }`}>
                    <textarea
                      ref={replyInputRef}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={2}
                      disabled={isSubmittingReply}
                      placeholder={`Trả lời @${replyingTo.userName}...`}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-transparent resize-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:cursor-not-allowed"
                    />

                    <AnimatePresence>
                      {replyImagePreview && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-3 pb-3"
                        >
                          <div className="relative inline-block">
                            <img
                              src={replyImagePreview}
                              alt="Preview"
                              className="max-h-24 sm:max-h-32 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                            />
                            {!isSubmittingReply && (
                              <button
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                aria-label="Xóa ảnh"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          disabled={isSubmittingReply}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSubmittingReply}
                          className={`p-1 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isSubmittingReply ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          aria-label="Thêm ảnh"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelReply}
                          disabled={isSubmittingReply}
                          className={`p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isSubmittingReply ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          aria-label="Hủy"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={handleSubmitReply}
                        disabled={(!replyContent.trim() && !replyImage) || isSubmittingReply}
                        className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${(replyContent.trim() || replyImage) && !isSubmittingReply
                          ? "bg-purple-600 hover:bg-purple-700 text-white hover:scale-105"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          }`}
                        aria-label="Gửi"
                      >
                        {isSubmittingReply ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span className="text-xs font-medium hidden sm:inline">
                          {isSubmittingReply ? "Đang gửi..." : "Gửi"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Nested Replies */}
        <AnimatePresence>
          {expandedComments[comment.id] && repliesData[comment.id] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-4 sm:ml-6 mt-3 space-y-3 border-l-2 border-purple-200 dark:border-purple-900 pl-3 sm:pl-4"
            >
              {repliesData[comment.id].map(reply => renderComment(reply, true))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  return (
    <>
      <ImageModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
        isOpen={!!selectedImage}
      />
      {comments.map((comment) => renderComment(comment))}
    </>
  );
};