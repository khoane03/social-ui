import { X, Users, Plus, BadgeCheck, Edit2, Check, Camera, LogOut, ShieldPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlerts } from "../../context/AlertContext";
import { useAuth } from "../../context/AuthContext";
import conversationService from "../../service/conversationService";
import { s } from "motion/react-m";


export const ConversationInfoModal = ({ isOpen, onClose, conversation }) => {
    const { user } = useAuth();
    const { addAlert } = useAlerts();
    const [members, setMembers] = useState([]);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newGroupName, setNewGroupName] = useState(conversation?.name || "");
    const [groupImage, setGroupImage] = useState(conversation?.avatarUrl || "");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log("Conversation data in modal:", conversation);
        if (conversation?.participants) {
            setMembers(conversation.participants);
        }
        setNewGroupName(conversation?.name || "");
        setGroupImage(conversation?.avatarUrl || "");
    }, [conversation]);

    const handleAddMember = async () => {
        addAlert({ type: "info", message: "Chức năng thêm thành viên chưa triển khai." });
    };

    const handleToggleAdmin = async (memberId) => {
        try {
            setLoading(true);
            // await conversationService.toggleAdmin(conversation.id, memberId);
            addAlert({ type: "success", message: "Cập nhật quyền admin thành công!" });
            setMembers((prev) =>
                prev.map((m) =>
                    m.id === memberId ? { ...m, isAdmin: !m.isAdmin } : m
                )
            );
        } catch (error) {
            addAlert({
                type: "error",
                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Lỗi hệ thống, vui lòng thử lại!",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGroupInfo = async () => {
        try {
            const formData = new FormData();
            formData.set("groupName", newGroupName);
            if (groupImage instanceof File) formData.set("avatar", groupImage);
            // await conversationService.updateGroup(conversation.id, formData);
            addAlert({ type: "success", message: "Cập nhật nhóm thành công!" });
            setIsEditingName(false);
        } catch (error) {
            addAlert({
                type: "error",
                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Lỗi hệ thống, vui lòng thử lại!",
            });
        } finally {
            setLoading(false);  
        }
    };

    const handleLeaveGroup = async () => {
        try {
            setLoading(true);
            await conversationService.leaveAndKickGroup({ conversationId: conversation.id, userIds: [user.id], type: "LEAVE" });
            addAlert({ type: "success", message: "Đã rời khỏi nhóm thành công!" });
            onClose();
            // Có thể thêm callback để refresh danh sách conversation
        } catch (error) {
             addAlert({
                type: "error",
                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Lỗi hệ thống, vui lòng thử lại!",
            });
        }finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
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
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Thông tin nhóm
                            </h2>
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
                            {/* Group Avatar */}
                            <div className="flex justify-center mb-6">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="relative group"
                                >
                                    <img
                                        src={groupImage instanceof File ? URL.createObjectURL(groupImage) : (groupImage || "/api/placeholder/120/120")}
                                        alt="Avatar"
                                        className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 dark:border-zinc-700 shadow-lg"
                                    />
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
                                </motion.div>
                            </div>

                            {/* Group Name */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tên nhóm
                                </label>
                                <AnimatePresence mode="wait">
                                    {isEditingName ? (
                                        <motion.div
                                            key="editing"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex gap-2"
                                        >
                                            <input
                                                value={newGroupName}
                                                onChange={(e) => setNewGroupName(e.target.value)}
                                                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                autoFocus
                                            />

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleSaveGroupInfo}
                                                className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors shadow-md"
                                            >
                                                <Check size={18} />
                                            </motion.button>


                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="display"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-lg group"
                                        >
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {conversation?.name || "Tên nhóm"}
                                            </span>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setIsEditingName(true)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700"
                                            >
                                                <Edit2 size={16} className="text-gray-500 dark:text-gray-300" />
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Members Section */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Users size={18} />
                                        Thành viên ({members.length})
                                    </h3>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleAddMember}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    >
                                        <Plus size={16} />
                                        Thêm
                                    </motion.button>
                                </div>

                                <ul className="space-y-2">
                                    {members.map((m, index) => (
                                        <motion.li
                                            key={m.id}
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
                                                    {m.id === conversation?.group?.admin?.id && (
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
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {m.fullName}
                                                    </p>
                                                    {conversation?.group?.admin?.id === m.id && (
                                                        <p className="text-xs text-blue-500 dark:text-blue-400">
                                                            Quản trị viên
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {user.id === conversation?.group?.admin?.id && (
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        title="Đặt làm quản trị viên"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleToggleAdmin(m.id)}
                                                        className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors opacity-0 group-hover:opacity-100 
                                                                bg-green-500 text-white hover:bg-green-600"
                                                    >
                                                        <ShieldPlus size={14} />

                                                    </motion.button>

                                                    <motion.button
                                                        title="Xóa khỏi nhóm"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleToggleAdmin(m.id)}
                                                        className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors opacity-0 group-hover:opacity-100 
                                                         bg-red-500 text-white hover:bg-red-600"
                                                    >
                                                        <X size={14} />
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
                                    onClick={handleLeaveGroup}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium rounded-xl transition-colors"
                                >
                                    <LogOut size={18} />
                                    Rời khỏi nhóm
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};