import { BadgeCheck, LogOut, UserPlus, Loader2, UserMinus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router";
import { ConfirmModal } from "../common/ConfirmModal";
import { useEffect, useState } from "react";
import { useAlerts } from "../../context/AlertContext";
import friendService from "../../service/friendService";
import { motion, AnimatePresence } from "framer-motion";
import authService from "../../service/authService";
import { getRefreshToken } from "../../service/storeService";

export const Suggestion = () => {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addAlert } = useAlerts();
  const [suggestions, setSuggestions] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);

  const fetchSuggestions = async (page = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const res = await friendService.getSuggestedFriends(page, 5);
      if (isLoadMore) setSuggestions(prev => [...prev, ...res.data]);
      else setSuggestions(res.data);

      setPageIndex(res.pageIndex);
      setTotalPages(res.totalPages);
    } catch (error) {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Lỗi hệ thống!"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleRequest = async (friendId) => {
    try {
      console.log("Sending request to:", friendId);
      await friendService.sendFriendRequest(friendId);
      setSentRequests(prev =>
        prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
      );
    } catch (error) {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Lỗi hệ thống!"
      });
    }
  };

  const handleLoadMore = () => {
    if (pageIndex < totalPages && !loadingMore) {
      fetchSuggestions(pageIndex + 1, true);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout(getRefreshToken());
      logout();
      setIsModalOpen(false);
    } catch (error) {

    }

  };

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất không?"
        confirmText="Đăng xuất"
      />

      <div className="flex items-center justify-between mb-6 dark:text-white text-white-theme select-none">
        <div className="flex items-center gap-2">
          <img
            src={user?.avatarUrl}
            className="w-10 h-10 rounded-full ring-2 ring-pink-500"
            alt={user?.fullName}
          />
          <Link to={`/profile/${user?.id}`} className="text-xl font-semibold">
            {user?.fullName}
          </Link>
          {user?.isVerified && (
            <BadgeCheck className="ml-1 text-green-500 w-3 h-3 md:w-4 md:h-4" />
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="hover:scale-105 hover:text-red-400 text-sm transition-all"
        >
          <LogOut />
        </button>
      </div>

      <div className="mb-4 flex justify-between items-center dark:text-white select-none">
        <p className="text-sm text-zinc-400">Đề xuất cho bạn</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 dark:text-white select-none">
            <AnimatePresence>
              {suggestions.map((s, i) => (
                <motion.div
                  key={`${s.friendId}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={s.avatarUrl || '/default.png'}
                      className="w-10 h-10 rounded-full ring-2 ring-pink-500"
                      alt={s.fullName}
                    />
                    <Link
                      to={`/profile/${s.friendId}`}
                      className="text-sm font-semibold dark:text-white text-white-theme hover:text-pink-500 transition-colors"
                    >
                      {s.fullName}
                    </Link>
                    {s.isVerified && (
                      <BadgeCheck className="ml-1 text-green-500 w-3 h-3 md:w-4 md:h-4" />
                    )}
                  </div>
                  <button
                    onClick={() => handleRequest(s.friendId)}
                    className="text-sm hover:scale-105 hover:text-pink-500 transition-all flex items-center gap-1"
                  >
                    {sentRequests.includes(s.friendId) ? <UserMinus /> : <UserPlus />}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {pageIndex < totalPages && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex justify-center"
            >
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-4 py-2 text-sm font-medium text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  `Xem thêm (${pageIndex}/${totalPages})`
                )}
              </button>
            </motion.div>
          )}
        </>
      )}
    </>
  );
};
