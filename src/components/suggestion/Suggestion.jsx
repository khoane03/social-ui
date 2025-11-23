import { BadgeCheck, LogOut, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router";
import { ConfirmModal } from "../common/ConfirmModal";
import { useState } from "react";

export const Suggestion = () => {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const suggestions = [
    { username: "Lan cục cức", avatar: '"https://i.imgur.com/7VbD1Qm.png"' },
    { username: "Tester", avatar: '"https://i.imgur.com/7VbD1Qm.png"' },
    { username: "Dev", avatar: '"https://i.imgur.com/7VbD1Qm.png"' },
    {
      username: "Project Manager",
      avatar: '"https://i.imgur.com/7VbD1Qm.png"',
    },
    { username: "Leader", avatar: '"https://i.imgur.com/7VbD1Qm.png"' },
  ];
  return (
    <>
      {<ConfirmModal
        isOpen={isModalOpen}
        onClose={() =>setIsModalOpen(false)}
        onConfirm={logout}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất không?"
        confirmText="Đăng xuất"
      />}
      <div className="flex items-center justify-between mb-6 dark:text-white text-white-theme select-none">
        <div className="flex items-center gap-2">
          <img
            src={user?.avatarUrl}
            className="w-10 h-10 rounded-full ring-2 ring-pink-500"
          />
          <Link to={`/profile/${user?.id}`} className="text-xl font-semibold ">{user?.fullName}</Link>
          {user?.isVerified && (
            <BadgeCheck className="ml-1 text-green-500 w-3 h-3 md:w-4 md:h-4" />

          )}
        </div>
        <button onClick={() => setIsModalOpen(true)} className="hover:scale-105 hover:text-red-400 text-sm">
          <LogOut />
        </button>
      </div>
      <div className="mb-4 flex justify-between items-center dark:text-white select-none">
        <p className="text-sm text-zinc-400">Đề xuất cho bạn</p>
        <button className="text-sm">Xem tất cả</button>
      </div>
      <div className="flex flex-col gap-3 dark:text-white select-none">
        {suggestions.map((s, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img
                src="https://i.imgur.com/7VbD1Qm.png"
                className="w-10 h-10 rounded-full ring-2 ring-pink-500"
              />
              <p className="text-sm font-semibold dark:text-white text-white-theme">{s.username}</p>
            </div>
            <button className="text-sm hover:scale-105 hover:text-red-400">
              <UserPlus />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};
