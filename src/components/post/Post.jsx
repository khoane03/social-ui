import { BadgeCheck, MoreHorizontal, Dot, Users, Globe, Lock, Edit3, Trash2 } from "lucide-react";
import { Actions } from "../action/Actions";
import { Images } from "./Images";
import { useState, useRef, useEffect } from "react";
import { ShowPost } from "./ShowPost";
import { EditPost } from "./EditPost";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { formatTime } from "../../service/ultilsService";
import { ConfirmModal } from "../common/ConfirmModal";
import postService from "../../service/postService";

export const Post = ({ post, onUpdate, isInModal = false }) => {
  const [isShowPost, setIsShowPost] = useState(false);
  const [isEditPost, setIsEditPost] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { user } = useAuth();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!post || post.length === 0) {
    return <div className="text-center text-zinc-400 pt-4">Không có bài viết nào.</div>;
  }

  const getPrivacyIcon = (privacy) => {
    const baseClass = "w-3 h-3 md:w-3 md:h-3";
    switch (privacy?.toUpperCase()) {
      case "FRIENDS":
        return <Users className={`${baseClass} text-blue-500`} />;
      case "PUBLIC":
        return <Globe className={`${baseClass} text-green-500`} />;
      case "PRIVATE":
        return <Lock className={`${baseClass} text-red-500`} />;
      default:
        return <Globe className={`${baseClass} text-green-500`} />;
    }
  };

  const isOwner = user?.id === post?.author?.id;

  const handleEditSuccess = () => {
    onUpdate?.();
  };

  const handleDelete = async () => {
    try {
      await postService.deletePost(post?.id);
      setShowMenu(false);
      setIsConfirmOpen(false);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác."
        confirmText="Xóa"
      />
      {isEditPost && (
        <EditPost
          post={post}
          onClose={() => setIsEditPost(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {!isInModal && isShowPost && (
        <ShowPost post={post} onClose={() => setIsShowPost(false)} />
      )}

      <div className="relative border-b dark:border-zinc-700 dark:text-white border-b-wt py-4 px-4 md:px-6">
        <div className="mb-6 flex items-start">
          <img
            src={post?.author?.avatarUrl || "default.png"}
            alt="avatar"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full ring-2 ring-purple-200 object-cover"
            loading="lazy"
          />
          <div className="flex flex-col ml-2 flex-1">
            <div className="flex items-center flex-wrap">
              <span className="font-semibold text-xs md:text-base flex items-center">
                <Link to={`/profile/${post?.author?.id}`} className="hover:underline">
                  {post?.author?.fullName}
                </Link>
                {post?.author?.isVerified && <BadgeCheck className="ml-1 w-4 h-4 text-blue-500" />}
              </span>
              <span className="text-zinc-400 text-xs md:text-sm flex items-center">
                <Dot className="w-4 h-4" />
                {formatTime(post?.updateAt)}
                <span className="ml-1 flex items-center">{getPrivacyIcon(post?.privacy)}</span>
              </span>
            </div>
            <p
              onClick={() => {
                if (!isInModal) setIsShowPost(true);   // TRONG modal thì không mở nữa
              }}
              className="text-sm md:text-base mt-1 cursor-pointer whitespace-pre-line"
              tabIndex={0}
              role="button"
              aria-label="Show post details"
            >
              {post?.content}
            </p>
          </div>

          {isOwner && (
            <motion.div
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              onClick={() => setShowMenu((prev) => !prev)}
              className="ml-2 text-zinc-400 cursor-pointer w-4 h-4 md:w-5 md:h-5"
            >
              <MoreHorizontal />
            </motion.div>
          )}
        </div>

        <Images imgs={post?.urls} />
        <Actions post={post} />

        <AnimatePresence>
          {showMenu && isOwner && (
            <div
              ref={menuRef}
              className="absolute right-0 top-12 w-48 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 dark:bg-slate-800 border dark:border-slate-700/50 bg-white border-slate-200 z-10"
            >
              <button
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-all duration-150 dark:text-slate-200 dark:hover:bg-slate-700/70 dark:hover:text-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => {
                  setShowMenu(false);
                  setIsEditPost(true);
                }}
              >
                <Edit3 size={16} className="opacity-70" />
                <span className="font-medium">Cập nhật</span>
              </button>

              <div className="h-px mx-2 dark:bg-slate-700 bg-slate-200" />

              <button
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-all duration-150 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setIsConfirmOpen(true)}
              >
                <Trash2 size={16} className="opacity-70" />
                <span className="font-medium">Xóa</span>
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};