import { CircleX } from "lucide-react";
import { Post } from "./Post";
import { ListComment } from "../comment/ListComment";

export const ShowPost = ({ onClose, post }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed top-0 left-0 w-full h-screen bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="dark:bg-zinc-800 bg-white rounded-lg p-6 w-full max-h-[90vh] md:max-w-2xl mx-4 dark:text-white overflow-y-auto scroll-smooth shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Đóng"
          >
            <CircleX className="w-6 h-6" />
          </button>
          <span className="dark:text-white text-gray-900 font-bold text-lg truncate mx-4">
            {post.author.fullName}
          </span>
          <div className="w-8"></div> {/* Spacer for center alignment */}
        </div>
        <Post post={post} isInModal={true}/>
        <ListComment postId={post.id} />
      </div>
    </div>
  );
};