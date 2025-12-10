import { BadgeCheck, Users, Plus, Dot, Ellipsis, Trash2, Delete } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { useWebsocket } from "../../context/WsContext";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAlerts } from "../../context/AlertContext";
import { formatTime } from "../../service/ultilsService";
import { CreateConversationModal } from "./CreateConversationModal";
import conversationService from "../../service/conversationService";
import { ConfirmModal } from "../common/ConfirmModal";

export const Menu = () => {
  const { chatConnected, subscribeChat } = useWebsocket();
  const [myConversations, setMyConversations] = useState([]);
  const [showCreateConversation, setShowCreateConversation] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState({}); // Track online status by accountId
  const { addAlert } = useAlerts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentId = useParams().id;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest("[data-menu-button]")) return;
      if (e.target.closest("[data-menu-dropdown]")) return;
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!chatConnected || !user?.id) return;

    const conversationTopic = `/user/${user.id}/queue/conversations`;

    const unsubscribe = subscribeChat(conversationTopic, (data) => {
      try {
        switch (data?.type) {
          case "init_conversations":
            console.log("Initializing conversations", data);
            setMyConversations(data?.conversations || []);
            break;

          case "new_conversation":
            setMyConversations((prev) => {
              const exists = prev.find(c => c.id === data.conversation.id);
              if (exists) {
                return [
                  data.conversation,
                  ...prev.filter(c => c.id !== data.conversation.id)
                ];
              }
              return [data.conversation, ...prev];
            });
            break;

          case "update_conversation":
            setMyConversations((prev) => {
              if (!data?.conversation) return prev;

              const updated = data.conversation;
              const filtered = prev.filter(c => c.id !== updated.id);

              return [updated, ...filtered];
            });
            break;

          case "delete_conversation":
            setMyConversations((prev) =>
              prev.filter((conv) => conv.id !== data.conversationId)
            );
            if (currentId === data.conversationId) navigate('/message');
            break;

          case "update_online_status":
            console.log("Online status update received", data);
            const { accountId, isOnline, lastSeen, conversations: affectedConvs } = data;

            // Update online status map
            setOnlineStatus(prev => ({
              ...prev,
              [accountId]: {
                isOnline,
                lastSeen: lastSeen ? new Date(lastSeen[0], lastSeen[1] - 1, lastSeen[2], lastSeen[3], lastSeen[4], lastSeen[5]) : null
              }
            }));

            // Update conversations if provided
            if (affectedConvs && Array.isArray(affectedConvs)) {
              setMyConversations(prev =>
                prev.map(conv => {
                  const affectedConv = affectedConvs.find(c => c.id === conv.id);
                  if (affectedConv && conv.type === "PRIVATE") {
                    return {
                      ...conv,
                      isOnline,
                      lastSeen: lastSeen ? new Date(lastSeen) : null
                    };
                  }
                  return conv;
                })
              );
            }
            break;

          default:
            console.warn("Unknown conversation message type:", data?.type);
        }
      } catch (error) {
        addAlert({
          type: "error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Lỗi khi cập nhật danh sách cuộc trò chuyện.",
        });
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [chatConnected, subscribeChat, user?.id, currentId, navigate, addAlert]);

  const handleConfirm = async () => {
    if (!pendingDelete) return;

    const { id, deleteForMe } = pendingDelete;

    setIsDeleting(true);
    try {
      if (deleteForMe) {
        await conversationService.deleteConversation({
          conversationId: id,
          type: "ONE"
        });
        addAlert({ type: "success", message: "Bạn đã rời nhóm." });
      } else {
        await conversationService.deleteConversation({
          conversationId: id,
          type: "ALL"
        });
        addAlert({ type: "success", message: "Nhóm đã giải tán." });
      }

      setMyConversations(prev => prev.filter(c => c.id !== id));
      if (currentId === id) navigate('/message');
      setOpenMenuId(null);
    } catch (error) {
      addAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi hệ thống, vui lòng thử lại!"
      });
    }

    setIsDeleting(false);
    setPendingDelete(null);
    setIsModalOpen(false);
  };

  const openDeleteConfirm = (e, id, deleteForMe) => {
    e.preventDefault();
    e.stopPropagation();
    setPendingDelete({ id, deleteForMe });
    setIsModalOpen(true);
  };

  const handleCreateConversation = async (conversationData) => {
    const formData = new FormData();
    setIsLoading(true);

    try {
      let response;

      switch (conversationData.type) {
        case "private":
          const existingPrivate = myConversations.find(conv =>
            conv.type === "PRIVATE" &&
            conv.members?.some(member => member.id === conversationData?.users[0]?.id)
          );

          if (existingPrivate) {
            addAlert({
              type: "info",
              message: "Cuộc trò chuyện đã tồn tại!"
            });
            navigate(`/message/${existingPrivate.id}`);
            setShowCreateConversation(false);
            setIsLoading(false);
            return;
          }

          formData.append("type", "PRIVATE");
          formData.append("memberIds", conversationData?.users[0]?.id);

          response = await conversationService.createConversation(formData);

          if (response?.data?.id) {
            navigate(`/message/${response.data.id}`);
            addAlert({
              type: "success",
              message: "Cuộc trò chuyện đã được tạo thành công!"
            });
          }
          break;

        case "group":
          formData.append("type", "GROUP");
          formData.append("groupName", conversationData?.groupName);
          formData.append("memberIds", conversationData?.users.map(u => u.id).join(","));

          if (conversationData?.groupImage) {
            formData.append("avatar", conversationData?.groupImage);
          }

          response = await conversationService.createConversation(formData);

          if (response?.data?.id) {
            navigate(`/message/${response.data.id}`);
            addAlert({
              type: "success",
              message: "Nhóm trò chuyện đã được tạo thành công!"
            });
          }
          break;

        default:
          addAlert({
            type: "error",
            message: "Loại cuộc trò chuyện không hợp lệ."
          });
          break;
      }
    } catch (error) {
      console.error("Create conversation error:", error);

      if (error?.response?.status === 409) {
        const existingId = error?.response?.data?.conversationId;
        if (existingId) {
          navigate(`/message/${existingId}`);
          addAlert({
            type: "info",
            message: "Cuộc trò chuyện đã tồn tại!"
          });
        } else {
          addAlert({
            type: "error",
            message: "Cuộc trò chuyện đã tồn tại nhưng không thể truy cập."
          });
        }
      } else {
        addAlert({
          type: "error",
          message: error?.response?.data?.message || error?.message || "Lỗi hệ thống!"
        });
      }
    } finally {
      setIsLoading(false);
      setShowCreateConversation(false);
    }
  };

  const checkIsDisabled = (conversation) => {
    if (conversation.type !== "GROUP") return false;
    return conversation.type === "GROUP" && !(conversation?.group?.admin?.id === user?.id);
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "";

    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now - lastSeenDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;

    return lastSeenDate.toLocaleDateString('vi-VN');
  };

  return (
    <div className="animate-slide-left-to-right flex flex-col h-screen w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => !isDeleting && setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="Xác nhận hành động"
        message="Bạn có chắc chắn muốn thực hiện hành động này không? Hành động này không thể hoàn tác."
        loading={isDeleting}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Tin nhắn
        </h1>

        <button
          onClick={() => setShowCreateConversation(true)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          title="Tạo cuộc trò chuyện mới"
        >
          <Plus size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {myConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <Users size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Chưa có cuộc trò chuyện nào
            </p>
            <button
              onClick={() => setShowCreateConversation(true)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Tạo cuộc trò chuyện
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {myConversations.map((conv) => {
              const isPrivate = conv.type === "PRIVATE";
              const showOnlineIndicator = isPrivate && conv.isOnline;
              const showLastSeen = isPrivate && !conv.isOnline && conv.lastSeen;

              return (
                <Link
                  key={conv.id}
                  to={`/message/${conv.id}`}
                  className={`flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors relative group ${currentId === conv.id ? 'bg-gray-50 dark:bg-zinc-800/50' : ''
                    }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={conv?.avatarUrl || "/default.png"}
                      alt={conv?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {isPrivate && (
                      <span
                        className={`absolute border-2 border-white dark:border-zinc-900 rounded-full bottom-0 right-0 flex items-center justify-center ${showOnlineIndicator
                            ? 'w-3.5 h-3.5 bg-green-500'
                            : 'w-auto h-auto bg-gray-400 dark:bg-gray-600 px-1.5 py-0.5'
                          }`}
                        title={showOnlineIndicator ? "Đang hoạt động" : `Hoạt động ${formatLastSeen(conv.lastSeen)}`}
                      >
                        {!showOnlineIndicator && (
                          <span className="text-[8px] text-white font-medium whitespace-nowrap">
                            {formatLastSeen(conv.lastSeen)}
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Content */}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-semibold text-gray-800 dark:text-white truncate text-sm">
                        {conv?.name || "Cuộc trò chuyện"}
                      </span>
                      {conv?.isVerified && (
                        <BadgeCheck className="text-blue-500 w-4 h-4 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
                        {conv?.lastMessage || "Bắt đầu cuộc trò chuyện"}
                      </p>
                      {conv?.lastMessageDate && (
                        <>
                          <Dot size={16} className="text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {formatTime(conv?.lastMessageDate)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Menu Button */}
                  <button
                    data-menu-button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === conv.id ? null : conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all"
                  >
                    <Ellipsis size={16} className="text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === conv.id && (
                    <div
                      data-menu-dropdown
                      className="absolute right-12 top-10 bg-white dark:bg-zinc-800 shadow-lg rounded-xl border border-gray-200 dark:border-zinc-700 w-44 z-50 overflow-hidden"
                    >
                      <button
                        onClick={(e) => {
                          openDeleteConfirm(e, conv.id, true);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors"
                      >
                        <Delete size={16} />
                        <span>Xóa cho tôi</span>
                      </button>
                      <button
                        disabled={checkIsDisabled(conv)}
                        onClick={(e) => {
                          openDeleteConfirm(e, conv.id, false);
                          setOpenMenuId(null);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors ${checkIsDisabled(conv) ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                      >
                        <Trash2 size={16} />
                        <span>Xóa tất cả</span>
                      </button>
                    </div>
                  )}

                  {/* Unread Badge */}
                  {conv?.unreadCount > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 font-semibold">
                      {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Conversation Modal */}
      {showCreateConversation && (
        <CreateConversationModal
          isOpen={showCreateConversation}
          onClose={() => setShowCreateConversation(false)}
          onCreateConversation={handleCreateConversation}
          loading={isLoading}
        />
      )}
    </div>
  );
};