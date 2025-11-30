import { X, Search, Users, User, Check, Plus, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import friendService from "../../service/friendService";
import { useAuth } from "../../context/AuthContext";
import userService from "../../service/userService";

export const CreateConversationModal = ({ isOpen, onClose, onCreateConversation, loading }) => {
  const [conversationType, setConversationType] = useState("private");
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState(null);
  const [groupImagePreview, setGroupImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showSelectedSidebar, setShowSelectedSidebar] = useState(false);
  
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Fetch friends list
  const fetchFriends = async (id) => {
    try {
      setIsLoading(true);
      const { data } = await friendService.getFriendsList(1, 50, id);
      console.log("Fetched friends:", data);
      setFriends(data || []);
    } catch (error) {
      console.error("Error fetching friends:", error);
      setFriends([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load friends on modal open
  useEffect(() => {
    if (isOpen && user?.id) {
      fetchFriends(user.id);
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isOpen, user]);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const { data } = await userService.searchUser(searchQuery.trim());
        console.log("Search results:", data);
        
        // Filter out current user and map to consistent format
        const filteredResults = (data || [])
          .filter(result => result.id !== user?.id)
          .map(result => ({
            id: result.id,
            friendId: result.id,
            fullName: result.fullName,
            avatarUrl: result.avatarUrl,
            verified: result.isVerified || false,
            isOnline: result.isOnline || false
          }));
        
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 1500);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, user?.id]);

  const handleClose = () => {
    setConversationType("private");
    setGroupName("");
    setGroupImage(null);
    setGroupImagePreview(null);
    setSearchQuery("");
    setSelectedUsers([]);
    setSearchResults([]);
    setShowSelectedSidebar(false);
    onClose();
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setGroupImage(null);
    setGroupImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleUserSelection = (userData) => {
    const user = {
      id: userData.friendId || userData.id,
      name: userData.fullName,
      avatarUrl: userData.avatarUrl,
      isOnline: userData.isOnline || false,
      isVerified: userData.verified || false
    };

    if (conversationType === "private") {
      setSelectedUsers([user]);
    } else {
      setSelectedUsers(prev => {
        const isSelected = prev.some(u => u.id === user.id);
        if (isSelected) {
          return prev.filter(u => u.id !== user.id);
        }
        return [...prev, user];
      });
    }
  };

  const isUserSelected = (userId) => {
    return selectedUsers.some(u => u.id === userId);
  };

  // Display list: search results if searching, otherwise friends
  const displayList = searchQuery.trim() ? searchResults : friends;

  const canCreate = conversationType === "private"
    ? selectedUsers.length === 1
    : selectedUsers.length >= 2 && groupName.trim();

  const handleCreate = () => {
    if (!canCreate) return;

    const conversationData = {
      type: conversationType,
      users: selectedUsers,
      groupName: conversationType === "group" ? groupName : null,
      groupImage: conversationType === "group" ? groupImage : null
    };

    onCreateConversation(conversationData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 w-full max-w-2xl h-[95vh] max-h-[90vh] rounded-xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  Tin nhắn mới
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {conversationType === "private" ? "Trò chuyện riêng tư" : "Tạo nhóm chat"}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors shrink-0 ml-2"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Type Selector */}
            <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-2 border-b border-gray-200 dark:border-zinc-800 shrink-0">
              <div className="flex gap-2 bg-gray-100 dark:bg-zinc-800/50 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setConversationType("private");
                    setSelectedUsers([]);
                    setGroupName("");
                    setGroupImage(null);
                    setGroupImagePreview(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all font-medium ${
                    conversationType === "private"
                      ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="text-xs sm:text-sm">Cá nhân</span>
                </button>
                <button
                  onClick={() => {
                    setConversationType("group");
                    setSelectedUsers([]);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all font-medium ${
                    conversationType === "group"
                      ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="text-xs sm:text-sm">Nhóm</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex relative">
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Group Settings */}
                <AnimatePresence mode="wait">
                  {conversationType === "group" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="shrink-0">
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageSelect}
                          />
                          {groupImagePreview ? (
                            <div className="relative group">
                              <img
                                src={groupImagePreview}
                                alt="Group preview"
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover border-2 border-gray-200 dark:border-zinc-700"
                              />
                              <button
                                onClick={removeImage}
                                className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-1 sm:p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                              >
                                <X size={10} className="sm:w-3 sm:h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gray-200 dark:bg-zinc-800 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
                            >
                              <Plus size={18} className="sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-500 mb-0.5 sm:mb-1" />
                              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-500">Ảnh</span>
                            </button>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                            Tên nhóm <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Nhập tên nhóm..."
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-zinc-700 rounded-lg sm:rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Search */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 shrink-0">
                  <div className="relative">
                    <Search size={16} className="sm:w-[18px] sm:h-[18px] absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm người dùng..."
                      className="w-full pl-9 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-zinc-700 rounded-lg sm:rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {isSearching && (
                      <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                        <Loader2 size={16} className="animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                  {searchQuery && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {isSearching ? "Đang tìm kiếm..." : `${displayList.length} kết quả`}
                    </p>
                  )}
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-3 sm:pb-4">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Loader2 className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3 sm:mt-4">Đang tải...</p>
                    </div>
                  ) : displayList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-2 sm:mb-3">
                        <Users size={24} className="sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                      <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">
                        {searchQuery ? "Không tìm thấy kết quả" : "Chưa có bạn bè"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 text-center px-4">
                        {searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Hãy kết bạn để bắt đầu trò chuyện"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <AnimatePresence mode="popLayout">
                        {displayList.map((person, index) => {
                          const userId = person.friendId || person.id;
                          const isSelected = isUserSelected(userId);
                          
                          return (
                            <motion.button
                              key={userId}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.2, delay: index * 0.02 }}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => toggleUserSelection(person)}
                              className={`w-full flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all ${
                                isSelected
                                  ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                  : "hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                              }`}
                            >
                              <div className="relative shrink-0">
                                <img
                                  src={person.avatarUrl || "/default.png"}
                                  alt={person.fullName}
                                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ${
                                    isSelected ? 'ring-2 ring-blue-500' : ''
                                  }`}
                                />
                                {person.isOnline && (
                                  <span className="absolute w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full bottom-0 right-0"></span>
                                )}
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className={`text-sm sm:text-base font-medium truncate ${
                                  isSelected
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-900 dark:text-white"
                                }`}>
                                  {person.fullName}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {person.isOnline ? "Đang hoạt động" : "Không hoạt động"}
                                </p>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                                isSelected
                                  ? "bg-blue-500 border-blue-500"
                                  : "border-gray-300 dark:border-zinc-600"
                              }`}>
                                {isSelected && <Check size={14} className="text-white" />}
                              </div>
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Users Mobile */}
              <AnimatePresence>
                {selectedUsers.length > 0 && showSelectedSidebar && (
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="lg:hidden absolute inset-0 bg-white dark:bg-zinc-900 z-10"
                  >
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          Đã chọn ({selectedUsers.length})
                        </h3>
                        <button
                          onClick={() => setShowSelectedSidebar(false)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          <X size={20} className="text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {selectedUsers.map(user => (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl"
                          >
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-12 h-12 rounded-full shrink-0 object-cover"
                            />
                            <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
                              {user.name}
                            </span>
                            <button
                              onClick={() => toggleUserSelection({ id: user.id, friendId: user.id })}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
                            >
                              <X size={16} className="text-gray-500" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {conversationType === "private" ? (
                      selectedUsers.length > 0 ? "Sẵn sàng tạo cuộc trò chuyện" : "Chọn 1 người để tiếp tục"
                    ) : (
                      selectedUsers.length >= 2 && groupName.trim()
                        ? "Sẵn sàng tạo nhóm"
                        : `Cần ${Math.max(0, 2 - selectedUsers.length)} thành viên${!groupName.trim() ? ' và tên nhóm' : ''}`
                    )}
                  </p>
                  {selectedUsers.length > 0 && (
                    <button
                      onClick={() => setShowSelectedSidebar(true)}
                      className="lg:hidden px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      Xem ({selectedUsers.length})
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!canCreate || loading}
                    className={`flex-1 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      canCreate && !loading
                        ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30"
                        : "bg-gray-200 dark:bg-zinc-800 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {loading ? "Đang tạo..." : (conversationType === "private" ? "Bắt đầu chat" : "Tạo nhóm")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};