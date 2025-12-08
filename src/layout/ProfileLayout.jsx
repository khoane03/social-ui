import { Outlet, useParams } from "react-router";
import { Header } from "../components/profile/Header";
import { Menu } from "../components/profile/Menu";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import friendService from "../service/friendService";

export const ProfileLayout = () => {
  const { user } = useAuth();
  const { id: userId } = useParams();
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      if (user.id !== userId) {
        try {
          const { data } = await friendService.checkFriendStatus(userId);
          if (data === 'BLOCKED') {
            setIsBlocked(true);
          } else {
            setIsBlocked(false);
          }
        } catch (error) {
          console.error("Error checking friend status:", error);
        }
      }
    })();
  }, [user, userId]);

  return (
    <div className="md:mt-4 md:mx-auto md:w-[80%] min-h-screen">
      {isBlocked ? (
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-4 text-center px-4 max-w-md">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Người dùng đã bị chặn
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Bạn không thể xem thông tin của người dùng này vì họ đã bị chặn hoặc đã chặn bạn.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Header />
          <Menu />
          <Outlet />
        </>
      )}
    </div>
  );
};