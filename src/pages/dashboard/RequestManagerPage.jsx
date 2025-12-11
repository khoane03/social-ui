import { CheckCircle, XCircle, Eye, Search, RefreshCw, FileText, Calendar, Hash, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useAlerts } from "../../context/AlertContext";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import userService from "../../service/userService";
import { VerificationDetailModal } from "./VerificationDetailModal";
import { RejectReasonModal } from "./RejectReasonModal";
import { formatTime } from "../../service/ultilsService";


export const RequestManagerPage = () => {
    const [requests, setRequests] = useState([]);
    const [filters, setFilters] = useState({ status: "all", search: "" });
    const [isLoading, setIsLoading] = useState(false);
    const { addAlert } = useAlerts();
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const response = await userService.getIdentity();
            console.log("Danh sách yêu cầu xác minh:", response.data);

            // Sắp xếp: PENDING trước, sau đó theo thời gian tạo mới nhất
            const sortedRequests = (response.data || []).sort((a, b) => {
                if (a.status === "PENDING" && b.status !== "PENDING") return -1;
                if (a.status !== "PENDING" && b.status === "PENDING") return 1;
                return new Date(b.userProfile.createAt) - new Date(a.userProfile.createAt);
            });

            setRequests(sortedRequests);
        } catch (error) {
            console.error("Error fetching requests:", error);
            addAlert({
                type: "error",
                message: "Không thể tải danh sách yêu cầu",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Quản lý yêu cầu xác minh";
        fetchRequests();
    }, []);

    const getStatusBadge = (status) => {
        const statusMap = {
            PENDING: {
                label: "Chờ duyệt",
                className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
                icon: <Clock size={14} />,
            },
            APPROVED: {
                label: "Đã duyệt",
                className: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
                icon: <CheckCircle size={14} />,
            },
            REJECTED: {
                label: "Đã từ chối",
                className: "bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400",
                icon: <XCircle size={14} />,
            },
        };
        return statusMap[status] || statusMap.PENDING;
    };

    // Filter requests
    const filteredRequests = requests.filter((request) => {
        const matchStatus =
            filters.status === "all" || request.status?.toLowerCase() === filters.status.toLowerCase();

        const matchSearch =
            !filters.search ||
            request.userProfile?.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
            request.userProfile?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
            request.citizenId?.toLowerCase().includes(filters.search.toLowerCase());

        return matchStatus && matchSearch;
    });

    const openApproveModal = (request) => {
        setSelectedRequest(request);
        setIsApproveModalOpen(true);
    };

    const openRejectModal = (request) => {
        setSelectedRequest(request);
        setIsRejectModalOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        try {
            await userService.updateUserIdentityByAdmin({
                id: selectedRequest.id,
                status: "APPROVED",
            });
            addAlert({
                type: "success",
                message: "Đã duyệt yêu cầu xác minh thành công",
            });
            setIsApproveModalOpen(false);
            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            addAlert({
                type: "error",
                message: error.response?.data?.message || "Không thể duyệt yêu cầu",
            });
        }
    };

    const handleReject = async (reason) => {
        if (!selectedRequest) return;

        try {
            await userService.updateUserIdentityByAdmin({
                id: selectedRequest.id,
                status: "REJECTED",
                reason: reason,
            });
            addAlert({
                type: "success",
                message: "Đã từ chối yêu cầu xác minh",
            });
            setIsRejectModalOpen(false);
            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            addAlert({
                type: "error",
                message: error.response?.data?.message || "Không thể từ chối yêu cầu",
            });
            throw error; // Re-throw để modal xử lý loading state
        }
    };

    const handleViewDetail = (request) => {
        setSelectedRequest(request);
        setIsDetailModalOpen(true);
    };

    return (
        <>
            {/* Approve Modal */}
            <ConfirmModal
                isOpen={isApproveModalOpen}
                onClose={() => {
                    setIsApproveModalOpen(false);
                    setSelectedRequest(null);
                }}
                onConfirm={handleApprove}
                title="Xác nhận duyệt yêu cầu"
                message={`Bạn có chắc chắn muốn duyệt yêu cầu xác minh của "${selectedRequest?.userProfile?.fullName}"?\n\nTài khoản sẽ được đánh dấu là đã xác minh.`}
                confirmText="Duyệt"
                confirmColor="green"
            />

            {/* Reject Modal */}
            <RejectReasonModal
                isOpen={isRejectModalOpen}
                onClose={() => {
                    setIsRejectModalOpen(false);
                    setSelectedRequest(null);
                }}
                onConfirm={handleReject}
                userName={selectedRequest?.userProfile?.fullName}
            />

            {/* Detail Modal */}
            <VerificationDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedRequest(null);
                }}
                requestData={selectedRequest}
            />

            <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            Quản lý yêu cầu xác minh
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Tổng số: {requests.length} yêu cầu
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchRequests}
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
                            placeholder="Tìm kiếm theo tên, email, CCCD..."
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
                        <option value="pending">Chờ duyệt</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="rejected">Đã từ chối</option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr className="text-gray-700 dark:text-gray-300">
                                <th className="px-4 py-3 font-semibold">Người dùng</th>
                                <th className="px-4 py-3 font-semibold">CCCD</th>
                                <th className="px-4 py-3 font-semibold">Ngày cấp</th>
                                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                                <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                                <th className="px-4 py-3 font-semibold text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12">
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
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center gap-2"
                                        >
                                            <FileText size={48} className="text-gray-300 dark:text-gray-600" />
                                            <p className="font-medium">Không tìm thấy yêu cầu nào</p>
                                        </motion.div>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredRequests.map((request, index) => {
                                        const statusBadge = getStatusBadge(request.status);

                                        return (
                                            <motion.tr
                                                key={request.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{
                                                    delay: index * 0.03,
                                                    duration: 0.2,
                                                    ease: "easeOut",
                                                }}
                                                layout
                                                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                            >
                                                {/* User Info */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={request.userProfile?.avatarUrl || "https://via.placeholder.com/40"}
                                                            alt={request.userProfile?.fullName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {request.userProfile?.fullName || "N/A"}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {request.userProfile?.id.substring(0, 4)}...
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Citizen ID */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Hash size={14} className="text-gray-400" />
                                                        <span className="font-mono text-gray-900 dark:text-white">
                                                            {request.citizenId}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Date of Issue */}
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                    {formatTime(request.dateOfIssue)}
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
                                                        {statusBadge.icon}
                                                        {statusBadge.label}
                                                    </span>
                                                </td>

                                                {/* Created At */}
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                    {formatTime(request.userProfile?.createAt)}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center gap-2">
                                                        {request.status === "PENDING" && (
                                                            <>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => openApproveModal(request)}
                                                                    title="Duyệt"
                                                                    className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                                                                >
                                                                    <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                                                                </motion.button>

                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => openRejectModal(request)}
                                                                    title="Từ chối"
                                                                    className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                                                                >
                                                                    <XCircle size={16} className="text-red-500 dark:text-red-400" />
                                                                </motion.button>
                                                            </>
                                                        )}

                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleViewDetail(request)}
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