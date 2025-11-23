import { BadgeCheck, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const AddComment = ({ postId }) => {
  const { user } = useAuth();

  console.log("Post ID for adding comment:", postId);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    // Handle comment submission logic here
  };

  return (
    <div className="flex items-center justify-between mt-4 w-full">
      <div className="flex items-center w-full">
        <img
          src={user?.avatarUrl || "default.png"}
          alt="User Avatar"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-purple-300 object-cover"
        />
        <div className="flex flex-col mx-3 sm:mx-4 w-full">
          <span className="flex items-center font-semibold text-xs sm:text-sm">
            {user?.fullName}
            {user?.isVerified && (
              <BadgeCheck className="ml-1 sm:ml-2 text-green-500 w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </span>
          <input
            type="text"
            placeholder="Add a comment..."
            className="w-full mt-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-lg outline-none"
          />
        </div>
      </div>
      <button
        onClick={handleCommentSubmit}
        className="ml-2 p-2 sm:p-3 text-gray-600 hover:text-gray-800 dark:hover:text-white transition-colors duration-200 flex items-center justify-center hover:scale-105 ease-in-out"
      >
        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};
