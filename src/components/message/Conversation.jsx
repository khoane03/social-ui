import { CircleArrowLeft, Send, TrashIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useParams } from "react-router";
import chatService from "../../service/chatService";

export const Conversation = () => {
  const [messages, setMessages] = useState([]);
  const [senders, setSenders] = useState({});
  const { user } = useAuth();
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const conversationId = useParams().id;

  useEffect(() => {
    (async () => {
      try {
        const response = await chatService.getMessages(conversationId);
        const msgs = response.data || [];

        const senderMap = {};
        msgs.forEach(msg => {
          if (!msg.isMe && msg.sender) {
            senderMap[msg.sender.id] = msg.sender;
          }
        });
        setSenders(senderMap);
        setMessages(msgs);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    })();
  }, [conversationId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="w-screen h-screen md:p-4">
      <div className="dark:bg-zinc-800 bg-[#F1F4F7] h-full w-full rounded-2xl shadow-lg flex flex-col justify-between">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
          <Link to={'/message'} className="block md:hidden">
            <CircleArrowLeft className="dark:text-white text-white-theme hover:text-red-400 transition-transform duration-150 cursor-pointer hover:scale-105" />
          </Link>
          <div className="flex flex-row items-center">
            <img
              src={messages[0]?.sender?.avatarUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfjNpt7mV0bJ6BxvMN4D09lhUaiUcW8i5UwA&s"}
              alt=""
              className="w-10 h-10 rounded-full"
            />
            <span className="text-white-theme dark:text-b-wt p-2">
              {messages[0]?.sender?.fullName || "Tester"}
            </span>
          </div>
          <TrashIcon
            size={20}
            className="dark:text-white text-white-theme hover:text-red-400 transition-transform duration-150 cursor-pointer hover:scale-105"
          />
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          {messages.map((msg) => {
            const senderInfo = msg.isMe ? user : senders[msg.sender?.id];
            return (
              <div
                key={msg.id}
                className={`flex w-full my-2 ${msg.isMe ? "justify-end" : "justify-start"}`}
              >
                {!msg.isMe && senderInfo && (
                  <img
                    src={senderInfo.avatarUrl}
                    alt={senderInfo.fullName}
                    className="w-8 h-8 rounded-full mr-2 self-end"
                  />
                )}
                <div className={`px-4 py-2 rounded-lg max-w-xs break-words ${
                  msg.isMe
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-bl-none"
                }`}>
                  <p className="text-sm">{msg.message}</p>

                  {msg.fileUrls && msg.fileUrls.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.fileUrls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`file-${index}`}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  <span className="text-xs text-gray-400 mt-1 block">
                    {new Date(msg.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </main>

        <footer className="flex items-center gap-2 px-6 py-2 rounded-b-2xl border-gray-200 dark:border-zinc-700 border-t">
          <input
            ref={inputRef}
            placeholder="Nhập tin nhắn..."
            type="text"
            className="text-white-theme dark:text-b-wt w-full focus:outline-none px-4 py-2"
          />
          <Send className="dark:text-white text-white-theme hover:text-red-400 transition-transform duration-150 cursor-pointer hover:scale-105" />
        </footer>
      </div>
    </div>
  );
};
