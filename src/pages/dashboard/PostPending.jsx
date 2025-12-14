import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  X, 
  Clock, 
  Eye, 
  BadgeCheck, 
  MessageCircle, 
  Heart,
  Globe,
  Users,
  Lock,
  Image as ImageIcon,
  Loader2,
  AlertCircle
} from "lucide-react";
import postService from "../../service/postService";
import { formatTime } from "../../service/ultilsService";
import { useAlerts } from "../../context/AlertContext";

const PostPending = () => {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const { addAlert } = useAlerts();

  const fetchPendingPosts = async () => {
    setLoading(true);
    try {
      const response = await postService.getPending();
      console.log("Pending posts:", response.data);
      setPendingPosts(response.data);
    } catch (error) {
      console.error("Error fetching pending posts:", error);
      addAlert({
        type: "error",
        message: "Không thể tải danh sách bài viết chờ duyệt"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const handleProcessPost = async (postId, status) => {
    setProcessingId(postId);
    try {
      await postService.processPost({ id: postId, status });
      addAlert({
        type: "success",
        message: status === "APPROVED" ? "Đã duyệt bài viết" : "Đã từ chối bài viết"
      });
      fetchPendingPosts();
    } catch (error) {
      console.error("Error processing post:", error);
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Có lỗi xảy ra khi xử lý bài viết"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case "PUBLIC":
        return <Globe className="w-4 h-4" />;
      case "FRIENDS":
        return <Users className="w-4 h-4" />;
      case "PRIVATE":
        return <Lock className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getPrivacyLabel = (privacy) => {
    switch (privacy) {
      case "PUBLIC":
        return "Công khai";
      case "FRIENDS":
        return "Bạn bè";
      case "PRIVATE":
        return "Riêng tư";
      default:
        return "Công khai";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Bài viết chờ duyệt
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Có {pendingPosts.length} bài viết đang chờ duyệt
        </p>
      </div>

      {/* Posts List */}
      {pendingPosts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center"
        >
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Không có bài viết nào
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Hiện tại không có bài viết nào đang chờ duyệt
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {pendingPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Post Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <img
                        src={post.author?.avatarUrl || "/default.png"}
                        alt={post.author?.fullName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            {post.author?.fullName}
                            {post.author?.isVerified && (
                              <BadgeCheck className="w-4 h-4 text-blue-500" />
                            )}
                          </h3>
                          <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Chờ duyệt
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <span>{formatTime(post.createAt)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {getPrivacyIcon(post.privacy)}
                            {getPrivacyLabel(post.privacy)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-3">
                    {post.content}
                  </p>

                  {/* Post Images */}
                  {post.urls && post.urls.length > 0 && (
                    <div className={`grid gap-2 mt-3 ${
                      post.urls.length === 1 
                        ? "grid-cols-1" 
                        : post.urls.length === 2 
                        ? "grid-cols-2" 
                        : "grid-cols-2 md:grid-cols-3"
                    }`}>
                      {post.urls.map((url, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.02 }}
                          className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                          onClick={() => setSelectedPost({ ...post, selectedImageIndex: idx })}
                        >
                          <img
                            src={url}
                            alt={`Post image ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:brightness-75 transition-all"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.totalLove}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.totalComment}</span>
                    </div>
                    {post.urls && (
                      <div className="flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        <span>{post.urls.length}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleProcessPost(post.id, "ACCEPTED")}
                    disabled={processingId === post.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === post.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Duyệt bài</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleProcessPost(post.id, "REJECTED")}
                    disabled={processingId === post.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === post.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5" />
                        <span>Từ chối</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={selectedPost.urls[selectedPost.selectedImageIndex]}
                alt="Full size"
                className="max-w-full max-h-[90vh] rounded-lg object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostPending;