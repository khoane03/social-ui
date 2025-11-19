import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NewPost } from "../../components/post/NewPost";
import { Post } from "../../components/post/Post";
import { Suggestion } from "../../components/suggestion/Suggestion";
import { useAuth } from "../../context/AuthContext";
import { useAlerts } from "../../context/AlertContext";
import postService from "../../service/postService";

export const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();
  const { addAlert } = useAlerts();
  
  useEffect(() => {
    document.title = 'Trang cá nhân';
    if (user && user.id) {
      (async () => {
        try {
          const response = await postService.getPostusers(user.id);
          setPosts(response.data);
        } catch (error) {
          console.error("Lỗi tải bài viết:", error);
          addAlert(
            {
              type: "error",
              message: error.response?.data?.message || "Đã có lỗi xảy ra khi tải bài viết.",
            }
          );
        }
      })();
    }
  }, [user]);

  return (
    <div className="flex scroll-smooth">
      <div className="flex-1 px-6 py-4 max-w-2xl mx-auto">
        <div className="border min-h-screen border-b-wt dark:border-zinc-700 rounded-t-4xl">
          {/* new post */}
          <NewPost />
          {/* list post */}
          <AnimatePresence mode="popLayout">
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <motion.div
                  key={post.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  layout
                >
                  <Post post={post} />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400"
              >
                <p>Chưa có bài viết nào</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Suggestions */}
      <div className="hidden lg:block w-80 p-4">
        <Suggestion />
      </div>
    </div>
  );
};
