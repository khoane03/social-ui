import { useState } from "react";
import { ModalAddPost } from "./ModalAddPost";
import { useAuth } from "../../context/AuthContext";

export const NewPost = () => {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  return (
    <>
      {showModal && <ModalAddPost onClose={() => setShowModal(false)} />}
      <div className="flex justify-between rounded-t-4xl items-center border-b border-b-wt dark:border-zinc-700 py-4 px-6 ">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || "default.png"}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full ring-2 ring-pink-500"
          />
          <span
            onClick={() => setShowModal(!showModal)}
            className="text-zinc-500 text-xs md:text-base"
          >
            Bạn đang nghĩ gì?
          </span>
        </div>

        <button
          onClick={() => setShowModal(!showModal)}
          className="dark:border-zinc-700 border-b-wt border font-bold text-xs p-2 md:text-base text-white-theme dark:text-white md:px-4 md:py-2 rounded-xl transition-colors duration-200"
        >
          Đăng
        </button>
      </div>
    </>
  );
};
