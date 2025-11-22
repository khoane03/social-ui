import { BadgeCheck, Users, Plus, Dot, Ellipsis, Trash2, Delete } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { useWebsocket } from "../../context/WsContext";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAlerts } from "../../context/AlertContext";
import { formatTime } from "../../service/ultilsService";
import { CreateConversationModal } from "./CreateConversationModal";
import conversationService from "../../service/conversationService";

export const Menu = () => {
  const { chatConnected, subscribeChat } = useWebsocket();
  const { user } = useAuth();
  const [myConversations, setMyConversations] = useState([]);
  const [showCreateConversation, setShowCreateConversation] = useState(false);
  const { addAlert } = useAlerts();
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();
  const currentId = useParams().id;

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Nếu click vào button toggle menu, giữ nguyên
      if (e.target.closest("[data-menu-button]")) return;
      // Nếu click vào menu, giữ nguyên
      if (e.target.closest("[data-menu-dropdown]")) return;
      // Nếu không, đóng menu
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
            setMyConversations(data?.conversations);
            break;

          case "new_conversation":
            setMyConversations((prev) => [
              data.conversation,
              ...prev
            ]);
            break;

          case "update_conversation":
            setMyConversations((prev) => {
              if (!data?.conversation) return prev;

              const updated = data.conversation;

              // Xóa bản cũ nếu tồn tại
              const filtered = prev.filter(c => c.id !== updated.id);

              // Đưa lên đầu danh sách
              return [updated, ...filtered];
            });
            break;


          case "delete_conversation":
            setMyConversations((prev) =>
              prev.filter((conv) => conv.id !== data.conversationId)
            );
            if (currentId === data.conversationId) navigate('/message');
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
  }, [chatConnected, subscribeChat, user?.id]);

  const handleDeleteConversation = async (e, conversationId, deleteForMe) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Deleting conversation ${conversationId}, deleteForMe: ${deleteForMe}`);
    try {
      if (deleteForMe) {
        await conversationService.deleteConversation(
          {
            conversationId,
            type: "ONE"
          }
        );
        addAlert({ type: "success", message: "Đã xóa cuộc trò chuyện cho bạn." });
      } else {
        await conversationService.deleteConversation(
          {
            conversationId,
            type: "ALL"
          }
        );
        addAlert({ type: "success", message: "Đã xóa cuộc trò chuyện cho tất cả mọi người." });
      }
      setMyConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
      if (currentId === conversationId) navigate('/message');
      setOpenMenuId(null);
    } catch (error) {
      addAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Lỗi hệ thống, vui lòng thử lại!",
      });
    }
  };

  const handleCreateConversation = async (conversationData) => {
    const formData = new FormData();
    switch (conversationData.type) {
      case "private":
        try {
          formData.append("type", "PRIVATE");
          formData.append("memberIds", conversationData?.users[0]?.id);

          await conversationService.createConversation(formData);
          addAlert({ type: "success", message: "Cuộc trò chuyện đã được tạo thành công!" });
        } catch (error) {
          console.error("Error creating private conversation:", error);
          addAlert({ type: "error", message: error?.response?.data?.message || "Lỗi hệ thống!" });
        }
        break;

      case "group":
        try {
          console.log("Creating group conversation with data:", conversationData);
          formData.append("type", "GROUP");
          formData.append("groupName", conversationData?.groupName);
          formData.set("memberIds", conversationData?.users.map(u => {
            console.log("Adding member ID to formData:", u.id);
            return u.id;
          }).join(","));
          formData.append("avatar", conversationData?.groupImage);

          await conversationService.createConversation(formData);
          addAlert({ type: "success", message: "Nhóm trò chuyện đã được tạo thành công!" });
        } catch (error) {
          console.error("Error creating group conversation:", error);
          addAlert({ type: "error", message: error?.response?.data?.message || "Lỗi hệ thống!" });
        }
        break;

      default:
        addAlert({ type: "error", message: "Loại cuộc trò chuyện không hợp lệ." });
        break;
    }

  };

  const checkIsDisabled = (conversation) => {
    if (conversation.type !== "GROUP") return false;
    return conversation.type === "GROUP" && !(conversation?.group?.admin?.id === user?.id);
  }

  return (
    <div className="animate-slide-left-to-right flex flex-col h-screen w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Tin nhắn
        </h1>

        <button
          onClick={() => setShowCreateConversation(true)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          title="Tạo nhóm mới"
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
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {myConversations.map((conv) => (
              <Link
                key={conv.id}
                to={`/message/${conv.id}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors relative group"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={conv?.avatarUrl || "/default.png"}
                    alt={conv?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conv?.isOnline && (
                    <span className="absolute w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full bottom-0 right-0"></span>
                  )}
                </div>

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

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
                      {conv?.lastMessage || "Bắt đầu cuộc trò chuyện"}
                      <Dot size={30} className="inline-block w-2 h-2 mx-1 text-gray-400 flex-shrink-0" />
                      {formatTime(conv?.lastMessageDate)}
                    </p>
                  </div>

                </div>

                {/* Delete Button */}
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
                    className="absolute right-0 top-10 bg-white dark:bg-zinc-800 shadow-lg rounded-xl border border-gray-200 dark:border-zinc-700 w-44 z-50 animate-fade-in"
                  >
                    <button
                      onClick={(e) => handleDeleteConversation(e, conv.id, true)}
                      className="w-full text-left px-4 py-2 text-sm rounded-t-xl hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    >
                      <Delete size={16} />
                      <span>Xóa cho tôi</span>
                    </button>
                    <button
                      disabled={checkIsDisabled(conv)}
                      onClick={(e) => handleDeleteConversation(e, conv.id, false)}
                      className={`w-full text-left px-4 py-2 text-sm rounded-b-xl hover:bg-red-100 text-red-700 flex items-center gap-2 ${checkIsDisabled(conv) ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Trash2 size={16} />
                      <span>Xóa tất cả</span>
                    </button>
                  </div>
                )}

                {/* Unread Badge */}
                {conv?.unreadCount > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Conversation Modal */}
      {showCreateConversation && (
        <CreateConversationModal
          isOpen={showCreateConversation}
          onClose={() => setShowCreateConversation(false)}
          onCreateConversation={handleCreateConversation}
        />
      )}
    </div>
  );
};