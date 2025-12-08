import { CircleX } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import postService from "../../service/postService";
import { ListComment } from "../../components/comment/ListComment";
import { Post } from "../../components/post/Post";

// Animation variants
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

const headerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      delay: 0.1,
      duration: 0.3
    }
  }
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      delay: 0.2,
      duration: 0.3
    }
  }
};

export const PostPage = () => {
  const [post, setPost] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const response = await postService.getByPostId(id);
        setPost(response.data);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    })();
  }, [id]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      navigate(-1);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed top-0 left-0 w-full h-screen bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="dark:bg-zinc-800 bg-white rounded-lg p-6 w-full max-h-[90vh] md:max-w-2xl mx-4 dark:text-white overflow-y-auto scroll-smooth shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-between mb-4"
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Đóng"
            >
              <CircleX className="w-6 h-6" />
            </motion.button>
            <span className="dark:text-white text-gray-900 font-bold text-lg truncate mx-4">
              {post?.author?.fullName}
            </span>
            <div className="w-8"></div>
          </motion.div>

          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            <Post post={post} />
            <ListComment postId={id} />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};