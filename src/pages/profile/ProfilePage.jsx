import { Post } from "../../components/post/Post";
import { NewPost } from "../../components/post/NewPost";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAlerts } from "../../context/AlertContext";
import postService from "../../service/postService";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router";

export const ProfilePage = () => {
  const { user } = useAuth();
  const { addAlert } = useAlerts();
  const { id: userId } = useParams();
  
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const observerRef = useRef();
  const lastPostRef = useRef();
  
  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    document.title = isOwnProfile ? 'Trang cá nhân' : 'Hồ sơ người dùng';
  }, [isOwnProfile]);

  const fetchPosts = useCallback(async (pageNum, isLoadMore = false) => {
    if (!userId || (isLoadMore && !hasMore)) return;

    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      
      const pageSize = 10;
      const response = await postService.getPostusers(userId, pageNum, pageSize);
      const newPosts = response.data || [];
      
      // Check if there are more posts
      if (newPosts.length < pageSize) {
        setHasMore(false);
      }
      
      if (isLoadMore) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      
    } catch (error) {
      console.error("Error loading posts:", error);
      addAlert({
        type: "error",
        message: error.response?.data?.message || "Đã có lỗi xảy ra khi tải bài viết.",
      });
      if (!isLoadMore) {
        setPosts([]);
      }
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [userId, hasMore, addAlert]);

  // Initial load khi userId thay đổi
  useEffect(() => {
    if (!userId) return;
    
    setPage(1);
    setHasMore(true);
    setPosts([]);
    fetchPosts(1, false);
  }, [userId]);

  // Intersection Observer callback
  const handleObserver = useCallback((entries) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isLoadingMore, isLoading]);

  // Setup Intersection Observer
  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "200px", // Load trước 200px
      threshold: 0.1
    };
    
    observerRef.current = new IntersectionObserver(handleObserver, option);
    
    if (lastPostRef.current) {
      observerRef.current.observe(lastPostRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, true);
    }
  }, [page, fetchPosts]);

  // Handle new post created
  const handleNewPost = useCallback((newPost) => {
    setPosts(prev => [newPost, ...prev]);
  }, []);

  return (
    <div className="md:border min-h-screen border-b-wt dark:border-zinc-700 md:rounded-t-4xl">
      {/* New Post - Only show on own profile */}
      {isOwnProfile && <NewPost onPostCreated={handleNewPost} />}
      
      {/* Loading State */}
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-16"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải bài viết...</p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Posts List */}
          <AnimatePresence mode="popLayout">
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <motion.div
                  key={index}
                  ref={index === posts.length - 1 ? lastPostRef : null}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ 
                    duration: 0.3, 
                    ease: "easeOut",
                    delay: Math.min(index * 0.03, 0.3)
                  }}
                  layout
                >
                  <Post post={post} />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-16 px-4 text-gray-500 dark:text-gray-400"
              >
                <svg
                  className="w-20 h-20 mb-4 text-gray-300 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-lg font-medium mb-1">
                  {isOwnProfile ? "Bạn chưa có bài viết nào" : "Người dùng chưa có bài viết nào"}
                </p>
                {isOwnProfile && (
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Hãy chia sẻ khoảnh khắc của bạn
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading More Indicator */}
          {isLoadingMore && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-8"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải thêm bài viết...</p>
              </div>
            </motion.div>
          )}

          {/* End of Posts Indicator */}
          {!hasMore && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-500"
            >
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-gray-300 dark:to-gray-600" />
                <p className="text-sm font-medium">
                  {posts.length === 1 ? "1 bài viết" : `${posts.length} bài viết`}
                </p>
                <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-gray-300 dark:to-gray-600" />
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};