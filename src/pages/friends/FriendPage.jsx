import { useState } from "react";
import { Menu } from "../../components/friend/Menu";
import { DataFriends } from "../../components/friend/DataFriends";

export const FriendPage = () => {
  const [tab, setTab] = useState('friends');

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto text-gray-900 dark:text-gray-100 min-h-screen dark:bg-gray-950">
      {/* Tab menu */}
      <Menu currentTab={(tab) => setTab(tab)} />

      {/* data friends */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 min-h-[300px] transition-all duration-300">
        {tab === "friends" && <DataFriends title={"Tất cả bạn bè"} type={tab} />}
        {tab === "invites" && <DataFriends title={"Lời mời kết bạn"} type={tab} />}
        {tab === "suggest" && <DataFriends title={"Gợi ý kết bạn"} type={tab} />}
        {tab === "blocked" && <DataFriends title={"Bạn bè bị chặn"} type={tab} />}
      </div>
    </div>
  );
};
