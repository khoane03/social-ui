import { BadgeCheck, MapPin, SwitchCamera, UserRoundCog } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { UpdateProfile } from "./UpdateProfile";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

export const Header = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [updateProfile, setUpdateProfile] = useState(false);

  useEffect(() => {

  }, [id]);

  return (
    <>
      {updateProfile && (
        <UpdateProfile onClose={() => setUpdateProfile(false)} />
      )}
      <header className={`relative rounded-2xl bg-[url(${user?.coverUrl})] bg-cover bg-center p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 dark:text-white text-bg-white-theme`}>
        <label htmlFor="update">
          <SwitchCamera className="absolute bottom-2 right-2 transition-transform duration-300 hover:scale-105 w-7 h-7 md:w-9 md:h-9 bg-gray-800 rounded-full p-1 text-white z-60" />
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          name=""
          id="update"
          hidden
        />
        <div className="absolute rounded-2xl inset-0 bg-black/60 z-0" />
        <div className="relative rounded-2xl z-10 flex flex-col md:flex-row items-center gap-4 w-full">
          <div className="relative">
            <img
              className="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover border-4 border-gray-700 shadow-md"
              src={user?.avatarUrl || "default.png"}
              alt="Profile"
            />
            <label htmlFor="update">
              <SwitchCamera className="absolute bottom-2 right-2 transition-transform duration-300 hover:scale-105 w-7 h-7 md:w-9 md:h-9 bg-gray-800 rounded-full p-1 text-white" />
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              name=""
              id="update"
              hidden
            />
          </div>
          <div className="w-full md:w-auto">
            <div className="flex justify-center md:justify-start items-center mb-2">
              <h1 className="text-lg md:text-3xl font-bold ml-0 md:ml-2 text-white drop-shadow-md">
                {user?.fullName}
                {user?.bio && (
                  <span className="text-sm md:text-base ml-2 text-gray-300">({user?.bio})</span>
                )}
              </h1>
              {user?.isVerified && (
                <BadgeCheck className="ml-1 text-green-500 w-3 h-3 md:w-4 md:h-4" />

              )}
              <button
                onClick={() => setUpdateProfile(!updateProfile)}
                className="flex items-center border px-2 py-1 ml-3 border-zinc-600 text-white rounded-xl bg-gray-900 hover:bg-gray-700 transition-all"
              >
                <UserRoundCog className="w-4 h-4 md:w-5 md:h-5 inline" />
                <span className="hidden md:inline ml-1">Chỉnh sửa</span>
              </button>
            </div>
            <div className="flex flex-col text-xs md:text-sm text-zinc-300 ml-0 md:ml-2">
              <Stats />
              <div className="flex items-center mt-1 justify-center md:justify-start">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-white" />
                <span className="ml-2">{user?.address}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

const Stats = () => (
  <div className="flex items-center justify-center md:justify-start">
    <Stat label="Bài viết" value="100+" />
    <Stat label="Bạn bè" value="100+" className="ml-4" />
  </div>
);

const Stat = ({ label, value, className = "" }) => (
  <div className={className}>
    <span className="font-semibold text-white">{value}</span>
    <span className="ml-2">{label}</span>
  </div>
);

