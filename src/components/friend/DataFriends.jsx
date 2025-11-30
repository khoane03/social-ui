import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Loader2 } from "lucide-react";
import friendService from "../../service/friendService";
import { useAuth } from "../../context/AuthContext";
import { useAlerts } from "../../context/AlertContext";
import { Link } from "react-router";
import { ConfirmModal } from "../common/ConfirmModal";

export const DataFriends = ({ type, title }) => {
  const [friends, setFriends] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [confirmData, setConfirmData] = useState(null);

  const { user } = useAuth();
  const { addAlert } = useAlerts();

  // Messages cho từng hành động
  const confirmMessages = {
    unfriend: {
      title: "Hủy kết bạn",
      message: "Bạn có chắc chắn muốn hủy kết bạn với người này?"
    },
    accept: {
      title: "Chấp nhận lời mời",
      message: "Bạn có muốn chấp nhận lời mời kết bạn từ người này?"
    },
    reject: {
      title: "Từ chối lời mời",
      message: "Bạn có chắc chắn muốn từ chối lời mời kết bạn?"
    },
    add: {
      title: "Gửi lời mời kết bạn",
      message: "Bạn có muốn gửi lời mời kết bạn cho người này?"
    },
    cancel: {
      title: "Hủy lời mời",
      message: "Bạn có muốn hủy lời mời kết bạn đã gửi?"
    },
    block: {
      title: "Chặn người dùng",
      message: "Bạn có chắc chắn muốn chặn người này? Họ sẽ không thể liên hệ với bạn."
    },
    unblock: {
      title: "Hủy chặn",
      message: "Bạn có muốn hủy chặn người dùng này?"
    }
  };

  const fetchData = useCallback(async (page = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const serviceMap = {
        friends: () => friendService.getFriendsList(page, 10, user.id),
        invites: () => friendService.getFriendRequests(page, 10, user.id),
        suggest: () => friendService.getSuggestedFriends(page, 10),
        blocked: () => friendService.getFriendBlockList(page, 10, user.id),
      };

      const response = await serviceMap[type]?.();

      if (response) {
        setFriends((prev) => isLoadMore ? [...prev, ...response.data] : response.data);
        setPageIndex(response.pageIndex);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Lỗi hệ thống!",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [type, user?.id, addAlert]);

  useEffect(() => {
    if (user?.id) fetchData();
  }, [fetchData, user?.id]);

  const handleLoadMore = () => {
    if (pageIndex < totalPages && !loadingMore) {
      fetchData(pageIndex + 1, true);
    }
  };

  const requestConfirm = (friend, action) => {
    setConfirmData({ friend, action });
  };

  const handleConfirm = async () => {
    const { friend, action } = confirmData;
    const friendId = friend.friendId || friend.id;

    setActionLoading((prev) => ({ ...prev, [friendId]: true }));
    setConfirmData(null);

    const actions = {
      unfriend: async () => {
        await friendService.unFriend(friend.id);
        setFriends((prev) => prev.filter((f) => f.id !== friend.id));
        return "Đã hủy kết bạn";
      },
      accept: async () => {
        await friendService.acceptFriendRequest(friend.id);
        setFriends((prev) => prev.filter((f) => f.id !== friend.id));
        return "Đã chấp nhận";
      },
      reject: async () => {
        await friendService.unFriend(friend.id);
        setFriends((prev) => prev.filter((f) => f.id !== friend.id));
        return "Đã từ chối";
      },
      add: async () => {
        await friendService.sendFriendRequest(friendId);
        setFriends((prev) =>
          prev.map((f) =>
            (f.friendId || f.id) === friendId ? { ...f, pending: true } : f
          )
        );
        return "Đã gửi lời mời";
      },
      cancel: async () => {
        await friendService.sendFriendRequest(friendId);
        setFriends((prev) =>
          prev.map((f) =>
            (f.friendId || f.id) === friendId ? { ...f, pending: false } : f
          )
        );
        return "Đã hủy yêu cầu";
      },
      block: async () => {
        await friendService.blockFriend(friendId);
        setFriends((prev) => prev.filter((f) => (f.friendId || f.id) !== friendId));
        return "Đã chặn người dùng";
      },
      unblock: async () => {
        await friendService.unBlockFriend(friend.id);
        setFriends((prev) => prev.filter((f) => f.id !== friend.id));
        return "Đã hủy chặn";
      },
    };

    try {
      const message = await actions[action]?.();
      if (message) addAlert({ type: "success", message });
    } catch (err) {
      addAlert({
        type: "error",
        message: err?.response?.data?.message || "Lỗi hệ thống!",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [friendId]: false }));
    }
  };

  const Btn = ({ friend, action, className, children }) => {
    const friendId = friend.friendId || friend.id;
    const isLoading = !!actionLoading[friendId];

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isLoading}
        onClick={() => requestConfirm(friend, action)}
        className={`${className} flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity`}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
      </motion.button>
    );
  };

  const actionButtons = {
    friends: (friend) => (
      <div className="flex gap-2">
        <Btn friend={friend} action="unfriend" className="px-3 py-1.5 bg-red-500 text-white rounded-lg">
          Hủy kết bạn
        </Btn>
        <Btn friend={friend} action="block" className="px-3 py-1.5 bg-gray-700 text-white rounded-lg">
          Chặn
        </Btn>
      </div>
    ),
    invites: (friend) => (
      <div className="flex gap-2">
        <Btn friend={friend} action="accept" className="px-3 py-1.5 bg-blue-500 text-white rounded-lg">
          Chấp nhận
        </Btn>
        <Btn friend={friend} action="reject" className="px-3 py-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg">
          Từ chối
        </Btn>
        <Btn friend={friend} action="block" className="px-3 py-1.5 bg-gray-700 text-white rounded-lg">
          Chặn
        </Btn>
      </div>
    ),
    suggest: (friend) => (
      <div className="flex gap-2">
        <Btn
          friend={friend}
          action={friend.pending ? "cancel" : "add"}
          className={`px-3 py-1.5 text-white rounded-lg ${
            friend.pending ? "bg-yellow-500" : "bg-green-500"
          }`}
        >
          {friend.pending ? "Hủy yêu cầu" : "Kết bạn"}
        </Btn>
        <Btn friend={friend} action="block" className="px-3 py-1.5 bg-gray-700 text-white rounded-lg">
          Chặn
        </Btn>
      </div>
    ),
    blocked: (friend) => (
      <Btn friend={friend} action="unblock" className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg">
        Hủy chặn
      </Btn>
    ),
  };

  return (
    <>
      <ConfirmModal
        isOpen={!!confirmData}
        onClose={() => setConfirmData(null)}
        onConfirm={handleConfirm}
        title={confirmData ? confirmMessages[confirmData.action]?.title : "Xác nhận"}
        message={confirmData ? confirmMessages[confirmData.action]?.message : "Bạn có chắc chắn?"}
      />

      <div className="flex flex-col h-full space-y-4">
        <motion.h3
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold"
        >
          {title}
        </motion.h3>

        {loading ? (
          <div className="flex justify-center items-center flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-auto">
              <AnimatePresence mode="popLayout">
                {friends.map((f) => {
                  const friendId = f.friendId || f.id;

                  return (
                    <motion.div
                      key={friendId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={f.avatarUrl || "/default.png"}
                          alt={f.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <Link
                          to={`/profile/${friendId}`}
                          className="text-sm font-semibold hover:text-pink-500 transition-colors"
                        >
                          {f.fullName}
                        </Link>
                        {f.verified && <BadgeCheck className="text-green-500 w-4 h-4" />}
                      </div>

                      {actionButtons[type]?.(f)}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {pageIndex < totalPages && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="text-sm text-blue-500 hover:underline flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
                    </>
                  ) : (
                    `Xem thêm (${pageIndex}/${totalPages})`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};