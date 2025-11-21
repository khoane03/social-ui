import { CircleArrowLeft, Send, Image, X, Info, MoreVertical, Trash2, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import chatService from "../../service/chatService";
import { formatTime } from "../../service/ultilsService";
import conversationService from "../../service/conversationService";
import { motion, AnimatePresence } from "framer-motion";
import { useAlerts } from "../../context/AlertContext";
import { ConversationInfoModal } from "./ConversationInfoModal";

export const Conversation = () => {
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState({});
  const [messageText, setMessageText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [menuMessageId, setMenuMessageId] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const { addAlert } = useAlerts();
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const conversationId = useParams().id;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuMessageId(null);
      }
    };

    if (menuMessageId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuMessageId]);


  useEffect(() => {
    (async () => {
      try {
        const { data } = await chatService.getMessages(conversationId);
        const cvs = await conversationService.getConversations(conversationId);
        setMessages(data);
        console.log("data messages:", data);
        setConversation(cvs.data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [conversationId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setSelectedImages((p) => [...p, ...urls]);
  };

  const removeImage = (i) => {
    setSelectedImages((p) => p.filter((_, index) => index !== i));
  };

  const handleSend = () => {
    if (!messageText.trim() && selectedImages.length === 0) return;
    setMessageText("");
    setSelectedImages([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMenu = (id) => {
    setMenuMessageId((prev) => (prev === id ? null : id));
  };

  const recallMessage = async (id) => {
    try {
      await chatService.deleteMessage({
        messageId: id,
        conversationId,
        type: "REVOKED",
      });

      setMenuMessageId(null);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id
            ? {
              ...msg,
              message: "Tin nhắn đã được thu hồi",
              fileUrls: [],
            }
            : msg
        )
      );

      addAlert({ type: "success", message: "Thu hồi tin nhắn thành công." });
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

  const deleteMessage = async (id) => {
    try {
      await chatService.deleteMessage({
        messageId: id,
        conversationId,
        type: "DELETED",
      });

      setMenuMessageId(null);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id
            ? {
              ...msg,
              message: "Tin nhắn đã được xóa",
              fileUrls: [],
            }
            : msg
        )
      );

      addAlert({ type: "success", message: "Thu hồi tin nhắn thành công." });
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

  return (
    <div className="w-screen h-screen md:p-4 bg-gray-50 dark:bg-zinc-950 ">
      {isInfoModalOpen && (
        <ConversationInfoModal
          isOpen={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
          conversation={conversation}
        />
      )}
      <div className="dark:bg-zinc-900 bg-white h-full w-full md:rounded-2xl shadow-xl flex flex-col overflow-hidden">

        {/* Header */}
        <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 p-4 md:rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3 flex-1 w-full">
            <Link
              to={"/message"}
              className="block md:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <CircleArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
            </Link>

            <div className="relative shrink-0">
              <img
                src={conversation?.avatarUrl || "/default.png"}
                alt={conversation?.name}
                className="md:w-10 md:h-10 w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-zinc-700"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900" />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-gray-900 dark:text-white font-semibold md:text-base text-xs truncate">
                {conversation?.name || "Cuộc trò chuyện"}
              </span>
              <span className="text-gray-500 dark:text-gray-400 md:text-xs text-[10px]">
                Đang hoạt động
              </span>
            </div>

            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors shrink-0"
            >
              <Info size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 md:p-5 p-4 overflow-y-auto bg-gray-50 dark:bg-zinc-800">
          <div className="max-w-4xl mx-auto space-y-5">
            {messages.map((msg, i) => {
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  {!msg.isMe && (
                    <div className="w-8 h-8 shrink-0">
                      <img
                        src={msg?.sender?.avatarUrl}
                        alt={msg?.sender?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={`flex items-center gap-2 max-w-[75%] sm:max-w-md ${msg.isMe ? 'flex-row-reverse' : 'flex-row'} group`}>
                    {/* Message Bubble */}
                    <div className="group relative">
                      <div
                        className={`px-3 py-2 rounded-2xl transition-all ${msg.isMe
                          ? "bg-blue-500 text-white rounded-br-md"
                          : "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-bl-md"
                          }`}
                      >
                        {/* Text Message */}
                        {msg.message && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {msg.message}
                          </p>
                        )}

                        {/* Images */}
                        {msg.fileUrls?.length > 0 && (
                          <div className={`${msg.message ? 'mt-2' : ''}`}>
                            {msg.fileUrls.length === 1 ? (
                              <img
                                src={msg.fileUrls[0]}
                                alt="Attachment"
                                className="max-w-[240px] sm:max-w-xs rounded-lg cursor-pointer hover:opacity-95 transition"
                                onClick={() => window.open(msg.fileUrls[0], "_blank")}
                              />
                            ) : (
                              <div className={`grid gap-1 ${msg.fileUrls.length === 2 ? 'grid-cols-2' :
                                msg.fileUrls.length === 3 ? 'grid-cols-2' :
                                  'grid-cols-2'
                                }`} style={{ maxWidth: '240px' }}>
                                {msg.fileUrls.map((url, idx) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    alt={`Attachment ${idx + 1}`}
                                    className={`w-full object-cover rounded-lg cursor-pointer hover:opacity-95 transition ${msg.fileUrls.length === 3 && idx === 0 ? 'col-span-2 h-32' : 'h-24'
                                      }`}
                                    onClick={() => window.open(url, "_blank")}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Timestamp */}
                        <span className={`text-[10px] mt-1 block ${msg.isMe ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                          {formatTime(msg?.createdDate)}
                        </span>
                      </div>
                    </div>

                    {/* More Options Button */}
                    <div className="relative" ref={menuRef}>
                      <button
                        onClick={() => toggleMenu(msg.id)}
                        className="p-1.5 rounded-full z-40 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                      >
                        <MoreVertical size={16} className="text-gray-600 dark:text-white" />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {menuMessageId === msg.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className={`absolute ${msg.isMe ? 'right-0' : 'left-0'} top-8 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-lg rounded-xl overflow-hidden z-10 min-w-[140px]`}
                          >
                            {msg.isMe && (
                              <button
                                onClick={() => recallMessage(msg.id)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 text-sm transition-colors"
                              >
                                <RotateCcw size={16} />
                                <span>Thu hồi</span>
                              </button>
                            )}
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm transition-colors"
                            >
                              <Trash2 size={16} />
                              <span>Xóa</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Footer */}
        <footer className="bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 p-4 md:rounded-b-2xl shrink-0">
          <div className="max-w-4xl mx-auto">
            {/* Image Previews */}
            <AnimatePresence>
              {selectedImages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 flex flex-wrap gap-2 overflow-hidden"
                >
                  {selectedImages.map((img, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group"
                    >
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200 dark:border-zinc-700"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="flex items-end gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 sm:p-3 rounded-full bg-gray-100 dark:bg-zinc-800 text-blue-500 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all hover:scale-105 shrink-0"
              >
                <Image size={20} />
              </button>

              <div className="flex-1 bg-gray-100 dark:bg-zinc-800 rounded-3xl px-4 py-2 flex items-center min-w-0">
                <textarea
                  ref={inputRef}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  rows={1}
                  className="w-full bg-transparent text-gray-900 dark:text-white focus:outline-none resize-none max-h-32 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                  style={{ minHeight: "24px" }}
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!messageText.trim() && selectedImages.length === 0}
                className={`p-2.5 sm:p-3 rounded-full transition-all hover:scale-105 shrink-0 ${messageText.trim() || selectedImages.length > 0
                  ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30"
                  : "bg-gray-200 dark:bg-zinc-800 text-gray-400 cursor-not-allowed"
                  }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};