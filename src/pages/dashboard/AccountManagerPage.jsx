import { Ban, BadgeCheck, Eye, Search, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import accountService from "../../service/accountService";
import { useAlerts } from "../../context/AlertContext";
import { useAuth } from "../../context/AuthContext";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { UserDetailModal } from "./UserDetailModal";

export const AccountManagerPage = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ status: "all", role: "all", search: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { addAlert } = useAlerts();
  const { account } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const { data } = await accountService.getAllAccounts();

      // Sắp xếp: Admin trước, User sau, theo email A-Z
      const sortedUsers = (data || []).sort((a, b) => {
        const aIsAdmin = a.roles?.some(role => role.role === "ROLE_ADMIN");
        const bIsAdmin = b.roles?.some(role => role.role === "ROLE_ADMIN");

        if (aIsAdmin && !bIsAdmin) return -1;
        if (!aIsAdmin && bIsAdmin) return 1;

        return (a.email || "").localeCompare(b.email || "");
      });

      setUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      addAlert({
        type: "error",
        message: "Không thể tải danh sách tài khoản",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Quản lý tài khoản";
    fetchAccounts();
  }, []);

  // Get role name from ROLE_USER format
  const getRoleName = (roles) => {
    if (!roles || roles.length === 0) return "User";

    return roles.map((roleObj) => {
      const roleName = roleObj.role || "";
      return roleName.replace("ROLE_", "").charAt(0).toUpperCase() +
        roleName.replace("ROLE_", "").slice(1).toLowerCase();
    }).join(", ");
  };

  // Get role badge color
  const getRoleBadgeClass = (roles) => {
    if (!roles || roles.length === 0) return "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400";

    const role = roles[0]?.role || "";

    if (role === "ROLE_ADMIN") {
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
    }

    return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400";
  };

  // Check if user is current logged in user
  const isCurrentUser = (userId) => {
    return account?.id === userId;
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchStatus =
      filters.status === "all" || user.status?.toLowerCase() === filters.status;

    const matchRole =
      filters.role === "all" ||
      user.roles?.some((roleObj) => roleObj.role?.toLowerCase().includes(filters.role.toLowerCase()));

    const matchSearch =
      !filters.search ||
      user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.id?.toLowerCase().includes(filters.search.toLowerCase());

    return matchStatus && matchRole && matchSearch;
  });

  const openToggleStatusModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;

    try {
      await accountService.updateAccountStatus(selectedUser.id);
      const newStatus = selectedUser.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      addAlert({
        type: "success",
        message: `${newStatus === "ACTIVE" ? "Mở khóa" : "Khóa"} tài khoản thành công`,
      });
      setIsModalOpen(false);
      setSelectedUser(null);
      fetchAccounts();
    } catch (error) {
      addAlert({
        type: "error",
        message: error.response?.data?.message || "Không thể cập nhật trạng thái",
      });
    }
  };

  const handleViewDetail = (user) => {
    console.log("Viewing details for user:", user);
    setSelectedUserId(user.id);
    setIsDetailModalOpen(true);
  };

  const getModalContent = () => {
    if (!selectedUser) return { title: "", message: "" };

    const isActive = selectedUser.status === "ACTIVE";
    return {
      title: isActive ? "Xác nhận khóa tài khoản" : "Xác nhận mở khóa tài khoản",
      message: isActive
        ? `Bạn có chắc chắn muốn khóa tài khoản "${selectedUser.email}"?\n\nNgười dùng sẽ không thể đăng nhập sau khi bị khóa.`
        : `Bạn có chắc chắn muốn mở khóa tài khoản "${selectedUser.email}"?\n\nNgười dùng sẽ có thể đăng nhập trở lại.`,
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleToggleStatus}
        title={getModalContent().title}
        message={getModalContent().message}
      />
      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
      />

      <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Quản lý tài khoản
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAccounts}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Làm mới
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[250px] relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo email hoặc ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>

          <select
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Bị khóa</option>
          </select>

          <select
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            value={filters.role}
            onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="text-gray-700 dark:text-gray-300">
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Vai trò</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">2FA</th>
                <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                <th className="px-4 py-3 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
                    </motion.div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-12 text-gray-500 dark:text-gray-400"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <Ban size={48} className="text-gray-300 dark:text-gray-600" />
                      <p className="font-medium">Không tìm thấy tài khoản nào</p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map((user, index) => {
                    const isCurrent = isCurrentUser(user.id);

                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{
                          delay: index * 0.03,
                          duration: 0.2,
                          ease: "easeOut"
                        }}
                        layout
                        className={`border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${isCurrent ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""
                          }`}
                      >
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">
                          {user.id?.substring(0, 8)}...
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 dark:text-white">
                              {user.email}
                            </span>
                            {isCurrent && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                Bạn
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.roles)}`}>
                            {getRoleName(user.roles)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {user.status === "ACTIVE" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium">
                              <BadgeCheck size={14} /> Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 text-xs font-medium">
                              <Ban size={14} /> Bị khóa
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {user.twoFactorAuth ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-bold">
                              ✓
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 text-sm">
                              ✗
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {formatDate(user.createAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            {!isCurrent && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openToggleStatusModal(user)}
                                title={user.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                className={`p-2 rounded-lg transition ${user.status === "ACTIVE"
                                    ? "bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                                    : "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50"
                                  }`}
                              >
                                <Ban
                                  size={16}
                                  className={
                                    user.status === "ACTIVE"
                                      ? "text-yellow-600 dark:text-yellow-400"
                                      : "text-green-600 dark:text-green-400"
                                  }
                                />
                              </motion.button>
                            )}

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleViewDetail(user)}
                              title="Xem chi tiết"
                              className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                            >
                              <Eye size={16} className="text-blue-500 dark:text-blue-400" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};