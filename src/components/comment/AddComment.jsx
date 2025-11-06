import { BadgeCheck, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const AddComment = (onClose) => {
  const { user } = useAuth();

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    // Handle comment submission logic here
  };

  return (
    <>
      <div className="flex items-center justify-between mt-4 ">
        <div className="flex items-center w-full">
          <img
            src={user?.avatarUrl || "default.png"}
            alt="User Avatar"
            className="w-10 h-10 rounded-full border "
          />
          <div className="flex flex-col mx-4">
            <span className="flex items-center font-semibold text-lg">
              {user?.fullName}
              {user?.isVerified && <BadgeCheck className="ml-2 text-green-500" />}
            </span>
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-grow  border-none border-gray-300 rounded-lg focus:outline-none "
            />
          </div>
        </div>
        <button onClick={handleCommentSubmit} className="px-4 py-2 hover:text-gray-400 transition-colors duration-200 flex items-center hover:scale-105 ease-in-out">
          <Send />
        </button>
      </div>
    </>
  );
};
