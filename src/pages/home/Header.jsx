import { motion } from "framer-motion";
import { Globe, Users, User } from "lucide-react";

export const Header = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "public", label: "Công khai", icon: Globe },
    { id: "friends", label: "Bạn bè", icon: Users },
    { id: "mine", label: "Của tôi", icon: User },
  ];

  return (
    <header className="bg-white dark:bg-zinc-900 ">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-center items-center h-12 space-x-1 sm:space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabChange(tab.id)}
                className={`relative px-3 sm:px-4 py-1 sm:py-2 rounded-md font-medium flex items-center gap-1 sm:gap-2 transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                <span className="hidden sm:inline relative z-10 text-sm">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
