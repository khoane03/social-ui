import { BadgeCheck, Dot, TrashIcon } from "lucide-react";
import { Link } from "react-router";
import { useWebsocket } from "../../context/WsContext";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { pre } from "motion/react-m";

export const Menu = () => {
  const { chatConnected, subscribeChat } = useWebsocket();
  const { user } = useAuth();
  const [myConversations, setMyConversations] = useState([]);

  useEffect(() => {
    if (!chatConnected || !user?.id) return;

    const conversationTopic = `/user/${user.id}/queue/conversations`;

    const unsubscribe = subscribeChat(conversationTopic, (r) => {
      let payload = r;
      try {
        if (r?.body) payload = JSON.parse(r.body);
        console.log("Received conversation update:", payload);
        setMyConversations((prev) => [...prev, ...payload?.conversations]);
      } catch (e) {
        console.warn("Failed to parse conversation body:", e);
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [chatConnected, subscribeChat, user?.id]);

  const handleDeleteConversation = (conversationId) => {
    try {
      
    } catch (error) {
      
    }
  };

  return (
    <div className="animate-slide-left-to-right px-2 py-1 min-w-80 border-r border-b-wt dark:border-zinc-800 h-screen rounded-2xl bg-[#F1F4F7] dark:bg-black">
      <h1 className="text-2xl font-bold text-white-theme dark:text-b-wt text-center pb-3">
        Tin nhắn
      </h1>
      <div className="flex flex-col gap-y-4 px-1">
        {myConversations.map((conv, index) => (
          <Link key={index} to={`/message/${conv?.id}`} className="flex items-center justify-between p-2 rounded-2xl transition-transform duration-200 cursor-pointer w-full dark:hover:bg-zinc-800 hover:bg-zinc-200">
            <div className="flex items-start gap-2">
              <div className="relative w-10 h-10">
                <img
                  src={conv?.avatarUrl || "/default.png"}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
                <span className="absolute w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full bottom-0 right-0"></span>
              </div>

              <div className="flex items-center">
                <span className="text-white-theme dark:text-b-wt font-semibold">
                  {conv?.name || "Cuộc trò chuyện"}
                </span>
                {conv?.isVerified && (
                  <BadgeCheck className="ml-1 text-green-500 w-3 h-3 md:w-4 md:h-4" />
                )}
              </div>
            </div>
            <TrashIcon
              size={20}
              className="ml-2 text-gray-400 hover:text-red-500 cursor-pointer transition-transform hover:scale-110"
            />
          </Link>
        ))}
      </div>
    </div>
  );
};
