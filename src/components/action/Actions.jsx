import { MessageCircle, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { AddComment } from "../comment/AddComment";
import { useAlerts } from "../../context/AlertContext";
import actionService from "../../service/actionService";
import { LoveListModal } from "./LoveListModal";

export const Actions = (post) => {
  const [reactions, setReactions] = useState(post?.post?.totalLove || 0);
  const [comments, setComments] = useState(post?.post?.totalComment || 0);
  const [isHidden, setIsHidden] = useState(true);
  const [isLoveModalOpen, setIsLoveModalOpen] = useState(false);
  const [loveData, setLoveData] = useState(null);
  const [isLoved, setIsLoved] = useState(false);
  const [isLoadingLove, setIsLoadingLove] = useState(false);
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const { addAlert } = useAlerts();

  useEffect(() => {
    if (post?.post) {
      (async () => {
        try {
          const { data } = await actionService.checkReaction(post.post.id);
          setIsLoved(data);
        } catch (error) {
          addAlert({
            type: "error",
            message: "Đã có lỗi xảy ra khi kiểm tra trạng thái yêu thích.",
          });
        }
      })();
    }
  }, [post]);

  const handleHeartClick = async () => {
    if (isLoadingLove) return;

    const previousLoved = isLoved;
    const previousReactions = reactions;

    try {
      if (isLoved) {
        setReactions((prev) => prev - 1);
        setIsLoved(false);
      } else {
        setReactions((prev) => prev + 1);
        setIsLoved(true);
      }

      setIsLoadingLove(true);
      await actionService.likePost(post?.post?.id);
    } catch (error) {
      // Rollback on error
      setIsLoved(previousLoved);
      setReactions(previousReactions);

      addAlert({
        type: "error",
        message: "Đã có lỗi xảy ra khi thích bài viết.",
      });
    } finally {
      setIsLoadingLove(false);
    }
  };

  const handleViewLoveDetail = async () => {
    if (isLoadingModal) return; // Prevent multiple clicks

    try {
      setIsLoadingModal(true);
      const res = await actionService.getReactionByPost(post?.post?.id);
      console.log("Love data received:", res.data);
      setLoveData(res.data);
      setIsLoveModalOpen(true);
    } catch (error) {
      addAlert({
        type: "error",
        message: "Đã có lỗi xảy ra khi lấy thông tin yêu thích.",
      });
    } finally {
      setIsLoadingModal(false);
    }
  };

  return (
    <>
      <LoveListModal
        isOpen={isLoveModalOpen}
        onClose={() => setIsLoveModalOpen(false)}
        loveData={loveData}
      />

      <div className="flex gap-4 pt-2">
        <div className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:scale-101 transition-transform duration-300 ease-in-out">
          <Heart
            onClick={handleHeartClick}
            className={`w-5 h-5 cursor-pointer transition-all duration-200 ${isLoved
                ? "fill-pink-600 text-pink-600"
                : "text-pink-600"
              } ${isLoadingLove ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
          />
          <span
            onClick={handleViewLoveDetail}
            className={`ml-1 cursor-pointer hover:underline ${isLoadingModal ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {reactions}
          </span>
        </div>
        <button
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:scale-101 transition-transform duration-300 ease-in-out"
          onClick={() => setIsHidden((prev) => !prev)}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="ml-1">{comments}</span>
        </button>
      </div>
      {!isHidden && (
        <div
          className={`transition-all duration-300 ease-in-out transform ${isHidden
              ? "opacity-0 translate-y-2 scale-95 blur-sm pointer-events-none"
              : "opacity-100 translate-y-0 scale-100 blur-0"
            }`}
        >
          <AddComment postId={post.post.id} onClose={() => setIsHidden(true)} cmtSuccess={() => setComments((prev) => prev + 1)} />
        </div>
      )}
    </>
  );
};