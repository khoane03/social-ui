import { useEffect, useState } from "react";
import { Menu } from "../../components/friend/Menu";
import { DataFriends } from "../../components/friend/DataFriends";
import { useNavigate, useParams } from "react-router";
import AllFriend from "../../components/friend/AllFriend";
import SuggetFriends from "../../components/friend/SuggetFriends";

export const FriendPage = () => {

  const navigate = useNavigate();
  const params = useParams();
  const [tab, setTab] = useState(params.tab || "all");
  console.log(params.tab);

  useEffect(() => {
    navigate(`/friend/${tab}`, { replace: true });
  }, [tab]);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto text-gray-900 dark:text-gray-100 min-h-screen dark:bg-gray-950">
      {/* Tab menu */}
      <Menu currentTab={(tab) => setTab(tab)} />

      {/* data friends */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 min-h-[300px] transition-all duration-300">
        {tab === "all" && <AllFriend />}
        {tab === "request" && <DataFriends title={"Lời mời kết bạn"} type={tab} />}
        {tab === "suggest" && <SuggetFriends />}
        {tab === "blocked" && <DataFriends title={"Bạn bè bị chặn"} type={tab} />}
      </div>
    </div>
  );
};
