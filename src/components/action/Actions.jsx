import { MessageCircle, Heart } from "lucide-react";
import { useState } from "react";
import { AddComment } from "../comment/AddComment";
import { useAuth } from "../../context/AuthContext";
export const Actions = () => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState(0);
  const [comments, setComments] = useState(100);
  const [isHidden, setIsHidden] = useState(true);

  const handleHeartClick = () => {
    setReactions((prev) => prev + 1);
  };
  const handleCommentClick = () => {};

  return (
    <>
      <div className="flex gap-4 pt-2">
        <button
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:scale-101 transition-transform duration-300 ease-in-out"
          onClick={handleHeartClick}
        >
          <Heart className="w-5 h-5 text-pink-600" />
          <span className="ml-1">{reactions}</span>
        </button>
        <button
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:scale-101 transition-transform duration-300 ease-in-out"
          onClick={() => setIsHidden((prev) => !prev)}
        >
          <MessageCircle className="w-5 h-5 " />
          <span className="ml-1">{comments}</span>
        </button>
      </div>
      {!isHidden && (
        <div
          className={`transition-all duration-300 ease-in-out transform ${
            isHidden
              ? "opacity-0 translate-y-2 scale-95 blur-sm pointer-events-none"
              : "opacity-100 translate-y-0 scale-100 blur-0"
          }`}
        >
          <AddComment />
        </div>
      )}
    </>
  );
};
