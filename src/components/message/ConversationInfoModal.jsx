import { X, Users, Plus, BadgeCheck, Edit2, Check, Camera, LogOut, ShieldPlus, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlerts } from "../../context/AlertContext";
import { useAuth } from "../../context/AuthContext";
import conversationService from "../../service/conversationService";
import friendService from "../../service/friendService";
import userService from "../../service/userService";
import { ConfirmModal } from "../common/ConfirmModal";
import { useNavigate, useParams } from "react-router";

export const ConversationInfoModal = ({ isOpen, onClose, conversation }) => {
    const [members, setMembers] = useState([]);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newGroupName, setNewGroupName] = useState(conversation?.name || "");
    const [groupImage, setGroupImage] = useState(conversation?.avatarUrl || "");
    const [confirmData, setConfirmData] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Add member states
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const { user } = useAuth();
    const { addAlert } = useAlerts();
    const currentId = useParams().id;
    const navigate = useNavigate();

    useEffect(() => {
        if (conversation?.participants) {
            setMembers(conversation.participants);
        }
        setNewGroupName(conversation?.name || "");
        setGroupImage(conversation?.avatarUrl || "/default.png");
    }, [conversation]);

    useEffect(() => {
        (async () => {
            try {
                const response = await conversationService.getConversations(conversation.id);
                setMembers(response.data.participants || []);
            } catch (error) {
                addAlert({ type: "error", message: "Không thể tải danh sách thành viên." });
            }
        })();
    }, [conversation?.id, addAlert]);

    // Load friends list when opening add member modal
    useEffect(() => {
        if (showAddMemberModal) {
            loadFriendsList();
        }
    }, [showAddMemberModal]);

    // Search users
    useEffect(() => {
        const searchUsers = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const { data } = await userService.searchUser(searchQuery.trim());
                // Filter out users already in the group
                const filtered = data.filter(u => !members.some(m => m.id === u.id));
                setSearchResults(filtered);
            } catch (error) {
                console.error("Search error:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const debounceTimer = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, members]);

    const loadFriendsList = async () => {
        try {
            const { data } = await friendService.getFriendsList(1, 50, user.id);
            // Filter out users already in the group
            const filtered = data.filter(f => !members.some(m => m.id === f.id));
            setFriendsList(filtered);
        } catch (error) {
            addAlert({ type: "error", message: "Không thể tải danh sách bạn bè." });
        }
    };

    const toggleSelectUser = (user) => {
        setSelectedUsers(prev => {
            const exists = prev.find(u => u.id === user.id);
            if (exists) {
                return prev.filter(u => u.id !== user.id);
            }
            return [...prev, user];
        });
    };

    const handleAddMembers = async () => {
        if (selectedUsers.length === 0) {
            addAlert({ type: "warning", message: "Vui lòng chọn ít nhất một người." });
            return;
        }

        setIsProcessing(true);
        try {
            // const formData = new FormData();
            // formData.append("conversationId", conversation.id);
            // formData.append("userIds", selectedUsers.map(u => u.id).join(","));
            console.log("Adding members:", selectedUsers);
            await conversationService.addMembersToGroup({
                conversationId: conversation.id,
                userIds: selectedUsers.map(u => u.id)
            });

            addAlert({ type: "success", message: "Đã thêm thành viên vào nhóm." });
            setMembers(prev => [...prev, ...selectedUsers]);
            setShowAddMemberModal(false);
            setSelectedUsers([]);
            setSearchQuery("");
            setSearchResults([]);
        } catch (error) {
            addAlert({
                type: "error",
                message: error?.response?.data?.message || "Không thể thêm thành viên."
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const openConfirm = (action, payload) => {
        setConfirmData({ action, payload });
        setIsConfirmOpen(true);
    };

    const handleConfirm = async () => {
        if (!confirmData) return;
        setIsProcessing(true);

        try {
            const formData = new FormData();
            if (conversation?.id) formData.set("conversationId", conversation.id);

            switch (confirmData.action) {
                case "SAVE_GROUP":
                    let hasChanges = false;
                    if (groupImage instanceof File) {
                        hasChanges = true;
                        formData.append("avatarGroup", groupImage);
                    }
                    if (conversation?.name !== newGroupName) {
                        hasChanges = true;
                        formData.set("groupName", newGroupName);
                    }
                    if (hasChanges) {
                        await conversationService.updateConversation(formData);
                        addAlert({ type: "success", message: "Cập nhật thông tin nhóm thành công." });
                        conversation.name = newGroupName;
                        conversation.avatarUrl = groupImage instanceof File ? URL.createObjectURL(groupImage) : groupImage;
                        setIsEditingName(false);
                    }
                    break;

                case "MAKE_ADMIN":
                    formData.set("adminId", confirmData?.payload?.id);
                    await conversationService.updateConversation(formData);
                    addAlert({ type: "success", message: `Đã đặt ${confirmData?.payload?.fullName} làm quản trị viên.` });
                    conversation.group.admin = { id: confirmData.payload.id };
                    break;

                case "REMOVE_MEMBER":
                    await conversationService.leaveAndKickGroup({
                        conversationId: conversation.id,
                        userIds: [confirmData.payload.id],
                        type: "KICK"
                    });
                    addAlert({ type: "success", message: `Đã xóa ${confirmData?.payload?.fullName} khỏi nhóm.` });
                    setMembers(prev => prev.filter(m => m.id !== confirmData.payload.id));
                    break;

                case "LEAVE_GROUP":
                    await conversationService.leaveAndKickGroup({
                        conversationId: conversation.id,
                        userIds: [user.id],
                        type: "LEAVE"
                    });
                    addAlert({ type: "success", message: `Bạn đã rời nhóm.` });
                    setMembers(prev => prev.filter(m => m.id !== user.id));
                    if (currentId === conversation.id) navigate('/message');
                    break;

                case "DELETE_GROUP":
                    await conversationService.deleteConversation({
                        conversationId: conversation.id,
                        type: "ALL"
                    });
                    addAlert({ type: "success", message: "Nhóm đã được giải tán." });
                    if (currentId === conversation.id) navigate('/message');
                    break;

                default:
                    addAlert({ type: "error", message: "Hành động không hợp lệ!" });
                    break;
            }
        } catch (error) {
            addAlert({
                type: "error",
                message: error?.response?.data?.message || error?.message || "Lỗi, vui lòng thử lại!"
            });
        }

        setIsProcessing(false);
        setIsConfirmOpen(false);
        setConfirmData(null);
    };

    const isAdmin = conversation?.group?.admin?.id === user.id;

    const renderButtonWithSpinner = (children, isDisabled, extraClasses = "") => (
        <span className={`flex items-center justify-center gap-2 ${extraClasses}`}>
            {isProcessing ? (
                <svg className="w-4 h-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3h-4z"></path>
                </svg>
            ) : children}
        </span>
    );

    const displayUsers = searchQuery.trim() ? searchResults : friendsList;

    return (
        <>
            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => !isProcessing && setIsConfirmOpen(false)}
                onConfirm={handleConfirm}
                loading={isProcessing}
                title="Xác nhận thao tác"
                message="Bạn có chắc muốn thực hiện hành động này?"
            />

            {/* Add Member Modal */}
            <AnimatePresence>
                {showAddMemberModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                        onClick={() => !isProcessing && setShowAddMemberModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Thêm thành viên</h3>
                                <button
                                    onClick={() => !isProcessing && setShowAddMemberModal(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                                >
                                    <X size={20} className="text-gray-600 dark:text-gray-300" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Tìm kiếm người dùng..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                    {isSearching && (
                                        <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                                    )}
                                </div>
                            </div>

                            {/* User List */}
                            <div className="overflow-y-auto max-h-[400px] px-6 py-4">
                                {displayUsers.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        {searchQuery.trim() ? "Không tìm thấy người dùng" : "Không có bạn bè"}
                                    </div>
                                ) : (
                                    <ul className="space-y-2">
                                        {displayUsers.map((person) => {
                                            const isSelected = selectedUsers.some(u => u.id === person.id);
                                            return (
                                                <motion.li
                                                    key={person.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => toggleSelectUser(person)}
                                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${isSelected
                                                            ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500"
                                                            : "hover:bg-gray-50 dark:hover:bg-zinc-800 border-2 border-transparent"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={person.avatarUrl || "/default.png"}
                                                            alt={person.fullName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                                                {person.fullName}
                                                                {person.isVerified && (
                                                                    <BadgeCheck size={14} className="text-blue-500" />
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected
                                                            ? "bg-blue-500 border-blue-500"
                                                            : "border-gray-300 dark:border-zinc-600"
                                                        }`}>
                                                        {isSelected && <Check size={14} className="text-white" />}
                                                    </div>
                                                </motion.li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-800">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddMembers}
                                    disabled={selectedUsers.length === 0 || isProcessing}
                                    className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${selectedUsers.length === 0 || isProcessing
                                            ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                                            : "bg-blue-500 hover:bg-blue-600 text-white"
                                        }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Đang thêm...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={18} />
                                            Thêm {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""}
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl"
                        >
                            {/* Header */}
                            <div className="relative px-6 py-5 border-b border-gray-200 dark:border-zinc-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Thông tin nhóm</h2>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <X size={20} className="text-gray-600 dark:text-gray-300" />
                                </motion.button>
                            </div>

                            {/* Content */}
                            <div className="overflow-y-auto max-h-[calc(85vh-80px)] px-6 py-5">

                                {/* Avatar + Name */}
                                <div className="flex flex-col items-center mb-6 gap-4">
                                    <motion.div whileHover={{ scale: 1.05 }} className="relative group">
                                        <img
                                            src={groupImage instanceof File ? URL.createObjectURL(groupImage) : (groupImage || "/default.png")}
                                            alt="Avatar"
                                            className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 dark:border-zinc-700 shadow-lg"
                                        />
                                        {isAdmin && isEditingName && (
                                            <>
                                                <label
                                                    htmlFor="groupImageInput"
                                                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                >
                                                    <Camera size={24} className="text-white" />
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setGroupImage(e.target.files[0])}
                                                    className="hidden"
                                                    id="groupImageInput"
                                                />
                                            </>
                                        )}
                                    </motion.div>

                                    <div className="w-full flex gap-2 items-center">
                                        {isAdmin ? (
                                            isEditingName ? (
                                                <>
                                                    <input
                                                        value={newGroupName}
                                                        onChange={(e) => setNewGroupName(e.target.value)}
                                                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                        autoFocus
                                                    />
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => openConfirm("SAVE_GROUP")}
                                                        disabled={isProcessing}
                                                        className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-md
                                                            ${isProcessing ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                                                    >
                                                        {renderButtonWithSpinner(<Check size={18} />, isProcessing)}
                                                    </motion.button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="flex-1 font-semibold text-gray-900 dark:text-white">
                                                        {conversation?.name || "Tên nhóm"}
                                                    </span>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setIsEditingName(true)}
                                                        className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700"
                                                    >
                                                        <Edit2 size={16} className="text-gray-500 dark:text-gray-300" />
                                                    </motion.button>
                                                </>
                                            )
                                        ) : (
                                            <span className="flex-1 font-semibold text-gray-900 dark:text-white">
                                                {conversation?.name || "Tên nhóm"}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Members Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <Users size={18} />
                                            Thành viên ({members.length})
                                        </h3>
                                        {isAdmin && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setShowAddMemberModal(true)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <Plus size={16} />
                                                Thêm
                                            </motion.button>
                                        )}
                                    </div>

                                    <ul className="space-y-2">
                                        {members.map((m, index) => (
                                            <motion.li
                                                key={m.id ?? index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <img
                                                            src={m.avatarUrl || "/default.png"}
                                                            alt={m.fullName}
                                                            className="w-11 h-11 rounded-full object-cover border-2 border-gray-200 dark:border-zinc-700"
                                                        />
                                                        {conversation?.group?.admin?.id === m.id && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1"
                                                            >
                                                                <BadgeCheck size={12} className="text-white" />
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{m.fullName}</p>
                                                        {conversation?.group?.admin?.id === m.id && (
                                                            <p className="text-xs text-blue-500 dark:text-blue-400">Quản trị viên</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {isAdmin && m.id !== user.id && (
                                                    <div className="flex gap-2">
                                                        <motion.button
                                                            title="Đặt làm quản trị viên"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => openConfirm("MAKE_ADMIN", m)}
                                                            disabled={isProcessing}
                                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors opacity-0 group-hover:opacity-100
                                                                ${isProcessing ? "bg-green-300 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"}`}
                                                        >
                                                            {renderButtonWithSpinner(<ShieldPlus size={14} />, isProcessing)}
                                                        </motion.button>

                                                        <motion.button
                                                            title="Xóa khỏi nhóm"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => openConfirm("REMOVE_MEMBER", m)}
                                                            disabled={isProcessing}
                                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors opacity-0 group-hover:opacity-100
                                                                ${isProcessing ? "bg-red-300 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600"}`}
                                                        >
                                                            {renderButtonWithSpinner(<X size={14} />, isProcessing)}
                                                        </motion.button>
                                                    </div>
                                                )}
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Leave Group Button */}
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-800">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => openConfirm("LEAVE_GROUP")}
                                        disabled={isProcessing}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-xl transition-colors mb-2
                                            ${isProcessing ? "bg-red-300 cursor-not-allowed text-white" : "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"}`}
                                    >
                                        {renderButtonWithSpinner(<><LogOut size={18} />Rời khỏi nhóm</>, isProcessing)}
                                    </motion.button>

                                    {isAdmin && <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => openConfirm("DELETE_GROUP")}
                                        disabled={isProcessing}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-xl transition-colors
                                            ${isProcessing ? "bg-red-300 cursor-not-allowed text-white" : "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"}`}
                                    >
                                        {renderButtonWithSpinner(<><LogOut size={18} />Giải tán nhóm</>, isProcessing)}
                                    </motion.button>}
                                </div>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};