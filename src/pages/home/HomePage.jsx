import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NewPost } from "../../components/post/NewPost";
import { Post } from "../../components/post/Post";
import { Suggestion } from "../../components/suggestion/Suggestion";
import { useAuth } from "../../context/AuthContext";
import { useAlerts } from "../../context/AlertContext";
import postService from "../../service/postService";
import { Header } from "./Header";
import friendService from "../../service/friendService";

export const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('public');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();
  const { addAlert } = useAlerts();
  const observerRef = useRef();
  const lastPostRef = useRef();

  useEffect(() => {
    document.title = 'Trang cá nhân';
  }, []);

  const fetchPosts = useCallback(async (pageNum, isLoadMore = false) => {
    if (!user?.id || (isLoadMore && !hasMore)) return;

    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      let response;
      const pageSize = 10;

      switch (activeTab) {
        case 'public':
          response = await postService.getAllPosts(pageNum, pageSize);

          // Filter blocked users' posts
          const filteredPosts = [];
          for (const post of response.data) {
            if (post.author.id !== user.id) {
              try {
                const { data } = await friendService.checkFriendStatus(post.author.id);
                if (data !== 'BLOCKED') {
                  filteredPosts.push(post);
                }
              } catch (error) {
                // If check fails, include the post to avoid blocking all posts
                filteredPosts.push(post);
              }
            } else {
              // Always include user's own posts
              filteredPosts.push(post);
            }
          }
          response.data = filteredPosts;
          break;

        case 'friends':
          response = await postService.getPostFriends(pageNum, pageSize);
          break;

        case 'mine':
          response = await postService.getPostusers(user.id, pageNum, pageSize);
          break;

        default:
          response = await postService.getAllPosts(pageNum, pageSize);
      }

      const newPosts = response.data || [];

      if (newPosts.length < pageSize) {
        setHasMore(false);
      }

      if (isLoadMore) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

    } catch (error) {
      console.error("Lỗi tải bài viết:", error);
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
  }, [user?.id, activeTab, hasMore, addAlert]);

  // Initial load khi tab thay đổi
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1, false);
  }, [activeTab, user?.id]);

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
      rootMargin: "100px",
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

  // Callback ref function for last post
  const setLastPostRef = useCallback((node) => {
    if (observerRef.current && lastPostRef.current) {
      observerRef.current.unobserve(lastPostRef.current);
    }

    lastPostRef.current = node;

    if (observerRef.current && node) {
      observerRef.current.observe(node);
    }
  }, []);

  return (
    <div className="flex scroll-smooth">
      <div className="flex-1 md:px-6 pb-6 max-w-2xl mx-auto">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="border min-h-screen border-b-wt dark:border-zinc-700 md:rounded-t-4xl">
          {/* New post */}
          <NewPost />

          {/* List posts */}
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-12"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải bài viết...</p>
              </div>
            </motion.div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {posts.length > 0 ? (
                  posts.map((post, index) => {
                    const isLastPost = index === posts.length - 1;

                    return (
                      <motion.div
                        key={post.id || index}
                        ref={isLastPost ? setLastPostRef : null}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          duration: 0.4,
                          ease: "easeOut",
                          delay: Math.min(index * 0.05, 0.3)
                        }}
                        layout
                      >
                        <Post post={post} />
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400"
                  >
                    <svg
                      className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600"
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
                    <p className="text-lg font-medium">Chưa có bài viết nào</p>
                    <p className="text-sm mt-1">
                      {activeTab === 'friends' && "Bạn bè của bạn chưa đăng bài viết nào"}
                      {activeTab === 'mine' && "Bạn chưa đăng bài viết nào"}
                      {activeTab === 'public' && "Hãy là người đầu tiên đăng bài viết"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading more indicator */}
              {isLoadingMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-8"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải thêm...</p>
                  </div>
                </motion.div>
              )}

              {/* End of posts indicator */}
              {!hasMore && posts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-500"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-px w-12 bg-gray-300 dark:bg-gray-600" />
                    <p className="text-sm">Đã hết bài viết</p>
                    <div className="h-px w-12 bg-gray-300 dark:bg-gray-600" />
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Suggestions */}
      <div className="hidden lg:block w-80 p-4">
        <Suggestion />
      </div>
    </div>
  );
};