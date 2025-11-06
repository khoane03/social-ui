import { CircleX, List } from "lucide-react";
import { Post } from "./Post";
import { ListComment } from "../comment/ListComment";

export const ShowPost = ({ onClose, post }) => {

  return (
    <div className="fixed top-0 left-0 w-full h-screen bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className=" dark:bg-zinc-800 bg-white rounded-lg p-6 w-full max-h-[70%] md:max-w-2xl mx-4 dark:text-white overflow-y-scroll scroll-smooth">
        <div className="flex items-center justify-between mb-4">
          <CircleX onClick={onClose} />
          <span className="dark:text-white text-white-theme font-bold text-lg">
            {post.author.fullName}
          </span>
          <div></div>
        </div>
        <Post post={post} />
        <ListComment />
      </div>
    </div>
  );
};
