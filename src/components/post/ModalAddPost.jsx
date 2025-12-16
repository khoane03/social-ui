import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircleX,
  BadgeCheck,
  ChevronRight,
  ImagePlus,
  Globe,
  Lock,
  Users,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAlerts } from "../../context/AlertContext";
import Loading from "../common/Loading";
import postService from "../../service/postService";


const bannedWords = ["dm", "đm", "what the fuck", "shit", "vcl", "cc", "lồn", "cặc", "đĩ", "ngu", "địt", "đéo", "chó", "spam"];

// Hàm kiểm tra từ cấm
const containsBannedWords = (text) => {
  if (!text) return { hasBanned: false, bannedWords: [] };
  
  // Chuyển về chữ thường và bỏ dấu
  let cleanText = text.toLowerCase();
  cleanText = cleanText.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a');
  cleanText = cleanText.replace(/[èéẹẻẽêềếệểễ]/g, 'e');
  cleanText = cleanText.replace(/[ìíịỉĩ]/g, 'i');
  cleanText = cleanText.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o');
  cleanText = cleanText.replace(/[ùúụủũưừứựửữ]/g, 'u');
  cleanText = cleanText.replace(/[ỳýỵỷỹ]/g, 'y');
  cleanText = cleanText.replace(/đ/g, 'd');
  
  const foundWords = [];
  
  for (const word of bannedWords) {
    let cleanWord = word.toLowerCase();
    cleanWord = cleanWord.replace(/đ/g, 'd');
    
    if (cleanText.includes(cleanWord)) {
      foundWords.push(word);
    }
  }
  
  return {
    hasBanned: foundWords.length > 0,
    bannedWords: foundWords
  };
};

export const ModalAddPost = ({ onClose }) => {
  const { user } = useAuth();
  const { addAlert } = useAlerts();
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);  
  const [files, setFiles] = useState([]);   
  const [privacy, setPrivacy] = useState("PUBLIC");
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [bannedWordWarning, setBannedWordWarning] = useState(null);

  const privacyOptions = useMemo(() => [
    { id: "PUBLIC", label: "Công khai", icon: Globe, description: "Mọi người có thể xem" },
    { id: "FRIENDS", label: "Bạn bè", icon: Users, description: "Chỉ bạn bè của bạn" },
    { id: "PRIVATE", label: "Riêng tư", icon: Lock, description: "Chỉ mình bạn" }
  ], []);

  const currentPrivacy = useMemo(
    () => privacyOptions.find((p) => p.id === privacy),
    [privacy, privacyOptions]
  );

  const handleImageChange = useCallback((e) => {
    const selected = Array.from(e.target.files || []);
    const imageUrls = selected.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...imageUrls]);
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = null;
  }, []);

  const handleRemoveImage = useCallback((index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Xử lý thay đổi nội dung với kiểm tra từ cấm
  const handleContentChange = useCallback((e) => {
    const value = e.target.value;
    setContent(value);
    
    if (value.trim()) {
      const check = containsBannedWords(value);
      console.log('Check banned words:', check);
      
      if (check.hasBanned) {
        setBannedWordWarning({
          message: `Phát hiện ${check.bannedWords.length} từ ngữ không phù hợp`,
          words: check.bannedWords
        });
      } else {
        setBannedWordWarning(null);
      }
    } else {
      setBannedWordWarning(null);
    }
  }, []);

  const handlePost = useCallback(async () => {
    if (!content.trim()) return;

    // KIỂM TRA TỪ CẤM TRƯỚC KHI ĐĂNG
    const check = containsBannedWords(content);
    if (check.hasBanned) {
      addAlert({
        type: "error",
        message: `Không thể đăng bài! Nội dung chứa từ ngữ không phù hợp: ${check.bannedWords.join(', ')}`
      });
      return;
    }

    setIsPosting(true);

    try {
      const formData = new FormData();
      formData.append("content", content.trim());
      formData.append("privacy", privacy);
      files.forEach((file) => {
        formData.append("files", file);
      });
      await postService.createPost(formData);
      addAlert({ type: "success", message: "Đăng bài viết thành công!" });
      images.forEach((url) => URL.revokeObjectURL(url));

      setContent("");
      setImages([]);
      setFiles([]);
      setBannedWordWarning(null);
      window.dispatchEvent(new CustomEvent('postCreated', { 
        detail: {
          event: 'postCreated',
          timestamp: Date.now()
        }
      }));
      onClose?.();
    } catch (err) {
      console.error("Lỗi đăng bài:", err);
      addAlert({
        type: "error",
        message: err?.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại!",
      });
    } finally {
      setIsPosting(false);
    }
  }, [content, privacy, images, files, addAlert, onClose]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.4,
        bounce: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const canPost = content.trim() && !bannedWordWarning;

  if (isPosting) {
    return (
      <Loading />
    )
  }

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 "
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <CircleX size={24} />
          </motion.button>
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Tạo bài viết
          </h2>
          <div className="w-6" />
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* User Info & Privacy */}
          <div className="flex items-start gap-3">
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              src={user?.avatarUrl || "default.png"}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500 dark:ring-blue-400"
              alt="avatar"
            />

            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <span className="text-gray-900 dark:text-white">{user?.fullName}</span>
                {user?.isVerified && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <BadgeCheck className="text-blue-500 w-4 h-4" />
                  </motion.div>
                )}
              </div>

              {/* Privacy Selector */}
              <div className="relative mt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors"
                >
                  <currentPrivacy.icon size={14} />
                  <span>{currentPrivacy.label}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showPrivacyMenu ? 'rotate-180' : ''}`}
                  />
                </motion.button>

                <AnimatePresence>
                  {showPrivacyMenu && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-10"
                        onClick={() => setShowPrivacyMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-20"
                      >
                        {privacyOptions.map((option, index) => (
                          <motion.button
                            key={option.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => {
                              setPrivacy(option.id);
                              setShowPrivacyMenu(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${privacy === option.id
                              ? 'bg-gray-50 dark:bg-gray-700'
                              : ''
                              }`}
                          >
                            <option.icon size={18} className="text-gray-600 dark:text-gray-400" />
                            <div className="flex-1 text-left">
                              <div className="font-medium text-gray-800 dark:text-white text-sm">
                                {option.label}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {option.description}
                              </div>
                            </div>
                            {privacy === option.id && (
                              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Text Input */}
          <motion.textarea
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            value={content}
            onChange={handleContentChange}
            placeholder="Bạn đang nghĩ gì?"
            rows={6}
            className={`w-full bg-transparent resize-none text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors ${
              bannedWordWarning 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-gray-900 dark:text-white'
            }`}
          />

          {/* WARNING MESSAGE - HIỂN THỊ NGAY BÊN DƯỚI TEXTAREA */}
          <AnimatePresence>
            {bannedWordWarning && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle size={24} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-base font-bold text-red-800 dark:text-red-200 mb-2">
                      🚫 {bannedWordWarning.message}
                    </p>
                    
                    {/* DANH SÁCH TỪ CẤM */}
                    <div className="mb-2">
                      <p className="text-sm text-red-700 dark:text-red-300 mb-2 font-semibold">
                        Từ vi phạm được phát hiện:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {bannedWordWarning.words.map((word, index) => (
                          <motion.span
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="inline-flex items-center px-3 py-1.5 bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 rounded-full font-bold text-sm"
                          >
                            ❌ {word}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-red-800 dark:text-red-200 font-semibold">
                      ⚠️ Vui lòng xóa hoặc thay thế những từ này để đăng bài
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image Preview */}
          <AnimatePresence>
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-2"
              >
                {images.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group rounded-xl overflow-hidden aspect-square"
                  >
                    <img
                      src={img}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <CircleX className="text-red-500 w-5 h-5" />
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Thêm vào bài viết:</span>

            <motion.label
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              htmlFor="img"
              className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ImagePlus size={20} className="text-green-500" />
              <input
                accept="image/*"
                multiple
                type="file"
                id="img"
                className="hidden"
                onChange={handleImageChange}
              />
            </motion.label>
          </div>
        </div>

        {/* Footer - Submit Button */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <motion.button
            whileHover={canPost ? { scale: 1.02 } : {}}
            whileTap={canPost ? { scale: 0.98 } : {}}
            disabled={!canPost}
            onClick={handlePost}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              canPost
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }`}
          >
            {bannedWordWarning 
              ? "🚫 Không thể đăng bài" 
              : content.trim() 
                ? "Đăng bài viết" 
                : "Vui lòng nhập nội dung"
            }
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};