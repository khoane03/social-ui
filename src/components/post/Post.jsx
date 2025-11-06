import { BadgeCheck, MoreHorizontal, Dot } from "lucide-react";
import { Actions } from "../action/Actions";
import { Images } from "./Images";
import { useState } from "react";
import { ShowPost } from "./ShowPost";
import { Link } from "react-router";
export const Post = ({ post }) => {
  const [isShowPost, setIsShowPost] = useState(false);

  if (!post || post.length === 0) {
    return <div className="text-center text-zinc-400 pt-4">Không có bài viết nào.</div>;
  }

  function formatTime(date) {
    if (!date) return "";

    const updatedDate = new Date(date);
    const now = new Date();
    const diffMs = now - updatedDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {

      return `${diffMins} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffHours < 48) {
      return "Hôm qua";
    } else {
      return updatedDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }


  return (
    <>
      {isShowPost && <ShowPost post={post} onClose={() => setIsShowPost(false)} />}
      <div className="border-b dark:border-zinc-700 dark:text-white border-b-wt py-4 px-4 md:px-6">
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
              </span>
            </div>
            <p
              onClick={() => setIsShowPost(true)}
              className="text-sm md:text-base mt-1 cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label="Show post details"
            >
              {post?.content}
            </p>
          </div>
          <MoreHorizontal className="ml-2 text-zinc-400 cursor-pointer w-4 h-4 md:w-5 md:h-5" />
        </div>
        <Images imgs={post?.urls} />
        <Actions />
      </div>
    </>
  );
};

