import { BadgeCheck, SearchIcon, Trash2, X, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import userService from "../../service/userService";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

const ListItem = ({ user, onRemove, isRecent = false, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.2, delay: index * 0.05 }}
  >
    <Link 
      to={`/profile/${user.id}`}
      className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors group"
    >
      <motion.img 
        src={user.avatarUrl || "/default.png"} 
        alt={user.fullName} 
        className="w-10 h-10 rounded-full object-cover"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      <div className="flex items-center justify-between w-full min-w-0">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium truncate">{user.fullName}</span>
            {user.isVerified && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <BadgeCheck className="text-blue-500 w-4 h-4 shrink-0" />
              </motion.div>
            )}
          </div>
          {user.username && (
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              @{user.username}
            </span>
          )}
        </div>
        {isRecent && onRemove && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(user.id);
            }}
            className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all shrink-0"
          >
            <X size={16} />
          </motion.button>
        )}
      </div>
    </Link>
  </motion.div>
);

export const Search = () => {
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  
  const [value, setValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading recent searches:", e);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearches = (searches) => {
    localStorage.setItem("recentSearches", JSON.stringify(searches));
  };

  // Search API call with debounce
  useEffect(() => {
    if (!value.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { data } = await userService.searchUser(value.trim());
        setSearchResults(data || []);
        setHasSearched(true);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 1500);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value]);

  // Add to recent searches
  const addToRecent = (user) => {
    const newRecent = [
      user,
      ...recentSearches.filter((item) => item.id !== user.id),
    ].slice(0, 10);
    
    setRecentSearches(newRecent);
    saveRecentSearches(newRecent);
  };

  // Remove from recent searches
  const removeFromRecent = (userId) => {
    const newRecent = recentSearches.filter((item) => item.id !== userId);
    setRecentSearches(newRecent);
    saveRecentSearches(newRecent);
  };

  // Clear all recent searches
  const clearAll = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.div 
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute top-0 left-[80px] h-full w-80 bg-[#F1F4F7] dark:bg-zinc-900 z-20 rounded-r-2xl mr-6"
    >
      <div className="flex flex-col h-full w-80 left-[80px] text-white-theme dark:text-b-wt border-r py-2 rounded-r-2xl border-b-wt dark:border-zinc-800 shadow-2xl">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-center mb-4"
        >
          Tìm kiếm
        </motion.h1>

        {/* Search Input */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-4 mb-4"
        >
          <div className="flex dark:bg-zinc-800 bg-white items-center gap-2 border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
            <label htmlFor="search" className="ml-3 text-gray-400">
              <SearchIcon size={20} />
            </label>
            <input
              ref={inputRef}
              id="search"
              placeholder="Tìm kiếm người dùng..."
              className="p-2.5 w-full text-gray-900 dark:text-white bg-transparent focus:outline-none text-sm"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loader"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mr-3"
                >
                  <Loader2 size={20} className="animate-spin text-blue-500" />
                </motion.div>
              ) : (
                value && (
                  <motion.button
                    key="clear"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setValue("")}
                    className="mr-3 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </motion.button>
                )
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Results/Recent Searches */}
        <div className="flex-1 overflow-y-auto border-t border-gray-200 dark:border-zinc-800">
          <AnimatePresence mode="wait">
            {value.trim() ? (
              // Search Results
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4"
              >
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-center mb-3"
                >
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Kết quả tìm kiếm
                  </span>
                  {searchResults.length > 0 && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs text-gray-500 dark:text-gray-400"
                    >
                      {searchResults.length} kết quả
                    </motion.span>
                  )}
                </motion.div>

                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-8"
                    >
                      <Loader2 size={32} className="animate-spin text-blue-500 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Đang tìm kiếm...
                      </p>
                    </motion.div>
                  ) : hasSearched && searchResults.length === 0 ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center justify-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <SearchIcon size={48} className="text-gray-300 dark:text-zinc-600 mb-2" />
                      </motion.div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Không tìm thấy kết quả cho "{value}"
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="list"
                      className="flex flex-col gap-1"
                    >
                      <AnimatePresence>
                        {searchResults.map((user, index) => (
                          <div key={user.id} onClick={() => addToRecent(user)}>
                            <ListItem user={user} index={index} />
                          </div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              // Recent Searches
              <motion.div 
                key="recent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4"
              >
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-center mb-3"
                >
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Tìm kiếm gần đây
                  </span>
                  {recentSearches.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={clearAll}
                      className="p-1 hover:text-red-500 transition-colors"
                      title="Xóa tất cả"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  )}
                </motion.div>

                <AnimatePresence mode="wait">
                  {recentSearches.length === 0 ? (
                    <motion.div 
                      key="empty-recent"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center justify-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <SearchIcon size={48} className="text-gray-300 dark:text-zinc-600 mb-2" />
                      </motion.div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Chưa có lịch sử tìm kiếm
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="recent-list"
                      className="flex flex-col gap-1"
                    >
                      <AnimatePresence>
                        {recentSearches.map((user, index) => (
                          <ListItem
                            key={user.id}
                            user={user}
                            index={index}
                            isRecent
                            onRemove={removeFromRecent}
                          />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};