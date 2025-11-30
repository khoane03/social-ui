import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlerts } from "../../context/AlertContext";
import { Upload, X, Check, AlertCircle, FileImage, Eye, Trash2, Edit, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import userService from "../../service/userService";
import { ConfirmModal } from "../../components/common/ConfirmModal";

export const IdentitySection = () => {
    const { addAlert } = useAlerts();
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [identity, setIdentity] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        citizenId: "",
        dateOfIssue: "",
        frontImage: null,
        backImage: null,
    });
    const [previews, setPreviews] = useState({
        frontImage: null,
        backImage: null,
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingIdentity, setLoadingIdentity] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadIdentity();
    }, []);

    const loadIdentity = async () => {
        try {
            setLoadingIdentity(true);
            const { data } = await userService.getIdentityById();
            setIdentity(data);
        } catch (error) {
            if(error.response?.status !== 500){
                addAlert({
                    type: "error",
                    message: error?.response?.data?.message || error?.message || "Lỗi hệ thống!"
                });
            }
        } finally {
            setLoadingIdentity(false);
        }
    };

    const handleInputChange = useCallback((field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: "" }));
    }, []);

    const handleFileChange = useCallback((field) => (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, [field]: file }));
            setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    }, []);

    const handleRemoveImage = useCallback((field) => {
        setFormData(prev => ({ ...prev, [field]: null }));
        setPreviews(prev => ({ ...prev, [field]: null }));
    }, []);

    const validate = () => {
        const errs = {};

        if (!formData.citizenId.trim()) {
            errs.citizenId = "Số căn cước công dân không được để trống!";
        } else if (!/^[0-9]*$/.test(formData.citizenId)) {
            errs.citizenId = "Phải là số!";
        } else if (formData.citizenId.length < 10 || formData.citizenId.length > 12) {
            errs.citizenId = "Số căn cước phải từ 10-12 số!";
        }

        if (!formData.dateOfIssue) {
            errs.dateOfIssue = "Ngày cấp không được để trống!";
        } else if (new Date(formData.dateOfIssue) >= new Date()) {
            errs.dateOfIssue = "Ngày cấp phải trước ngày hiện tại!";
        }

        if (!isEditMode) {
            if (!formData.frontImage) errs.frontImage = "Vui lòng tải ảnh mặt trước!";
            if (!formData.backImage) errs.backImage = "Vui lòng tải ảnh mặt sau!";
        } else {
            if (!formData.frontImage && !previews.frontImage) {
                errs.frontImage = "Vui lòng tải ảnh mặt trước!";
            }
            if (!formData.backImage && !previews.backImage) {
                errs.backImage = "Vui lòng tải ảnh mặt sau!";
            }
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            setIsLoading(true);
            const payload = new FormData();
            if (isEditMode) {
                payload.append("id", formData.id);
            }
            payload.append("citizenId", formData.citizenId);
            payload.append("dateOfIssue", formData.dateOfIssue);

            if (formData.frontImage) {
                payload.append("frontImage", formData.frontImage);
            }
            if (formData.backImage) {
                payload.append("backImage", formData.backImage);
            }

            if (isEditMode) {
                await userService.updateUserIdentity(payload);
                addAlert({ type: "success", message: "Cập nhật yêu cầu xác minh thành công!" });
            } else {
                await userService.createUserIdentity(payload);
                addAlert({ type: "success", message: "Yêu cầu xác minh đã được gửi thành công!" });
            }

            await loadIdentity();
            resetForm();
            setShowForm(false);
        } catch (error) {
            addAlert({
                type: "error",
                message: error?.response?.data?.message || error?.message || "Lỗi hệ thống!"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            await userService.deleteUserIdentity(identity.id);
            addAlert({ type: "success", message: "Đã xóa yêu cầu xác minh!" });
            setIdentity(null);
            setShowDetail(false);
            setIsModalOpen(false);
        } catch (error) {
            addAlert({
                type: "error",
                message: error?.response?.data?.message || error?.message || "Lỗi hệ thống!"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartEdit = () => {
        setIsEditMode(true);
        setFormData({
            id: identity.id,
            citizenId: identity.citizenId,
            dateOfIssue: identity.dateOfIssue,
            frontImage: null,
            backImage: null,
        });
        setPreviews({
            frontImage: identity.frontImageUrl,
            backImage: identity.backImageUrl,
        });
        setShowForm(true);
        setShowDetail(false);
    };

    const resetForm = () => {
        setFormData({ citizenId: "", dateOfIssue: "", frontImage: null, backImage: null });
        setPreviews({ frontImage: null, backImage: null });
        setErrors({});
        setIsEditMode(false);
    };

    const handleCancelForm = () => {
        resetForm();
        setShowForm(false);
    };

    const getStatusConfig = (status) => {
        const configs = {
            PENDING: {
                icon: Clock,
                color: "text-yellow-500",
                bg: "bg-yellow-500/10",
                label: "Đang chờ xét duyệt"
            },
            APPROVED: {
                icon: CheckCircle,
                color: "text-green-500",
                bg: "bg-green-500/10",
                label: "Đã được xác minh"
            },
            REJECTED: {
                icon: XCircle,
                color: "text-red-500",
                bg: "bg-red-500/10",
                label: "Bị từ chối"
            },
            UPDATED: {
                icon: CheckCircle,
                color: "text-blue-500",
                bg: "bg-blue-500/10",
                label: "Đã cập nhật"
            }
        };
        return configs[status] || configs.PENDING;
    };

    const ImageUploadBox = ({ label, field, error }) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>

            {!previews[field] ? (
                <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Nhấn để tải ảnh</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG (MAX. 10MB)</p>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange(field)}
                        className="hidden"
                    />
                </label>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                >
                    <img
                        src={previews[field]}
                        alt={label}
                        className="w-full h-40 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveImage(field)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            <X size={20} />
                        </motion.button>
                        <motion.label
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                            <FileImage size={20} />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange(field)}
                                className="hidden"
                            />
                        </motion.label>
                    </div>
                    {formData[field] && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 p-1.5 bg-green-500 rounded-full"
                        >
                            <Check size={16} className="text-white" />
                        </motion.div>
                    )}
                </motion.div>
            )}

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 text-red-500 text-xs mt-1"
                >
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </motion.div>
            )}
        </div>
    );

    if (loadingIdentity) {
        return (
            <div className="flex justify-center items-center p-8">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    const statusConfig = identity ? getStatusConfig(identity.status) : null;
    const StatusIcon = statusConfig?.icon;

    return (
        <>
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa yêu cầu xác minh này không? Hành động này không thể hoàn tác."
            />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800/50 dark:to-zinc-900/50 rounded-2xl p-4 space-y-4 dark:border-gray-700 shadow-sm"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <FileImage className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                Xác minh danh tính
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Xác thực tài khoản để được tích xanh
                            </p>
                        </div>
                    </div>
                    {identity && StatusIcon && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bg}`}>
                            <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                            <span className={`text-xs font-medium ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                    )}
                </div>

                {/* Hiển thị lý do từ chối */}
                {identity && identity.status === "REJECTED" && identity.reason && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                                    Lý do từ chối
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-300">
                                    {identity.reason}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Nút hành động */}
                {!showForm && !showDetail && (
                    <>
                        {!identity && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowForm(true)}
                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                            >
                                Bắt đầu xác minh
                            </motion.button>
                        )}

                        {identity && identity.status !== "APPROVED" && (
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowDetail(true)}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    <Eye size={18} />
                                    Xem thông tin
                                </motion.button>
                                {identity.status === "REJECTED" && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleStartEdit}
                                        className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <Edit size={18} />
                                        Cập nhật
                                    </motion.button>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Chi tiết Identity */}
                <AnimatePresence>
                    {showDetail && identity && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden space-y-4 pt-2"
                        >
                            <div className="space-y-3">
                                <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Số CCCD</p>
                                    <p className="font-semibold text-gray-800 dark:text-white">{identity.citizenId}</p>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ngày cấp</p>
                                    <p className="font-semibold text-gray-800 dark:text-white">
                                        {new Date(identity.dateOfIssue).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>

                                {/* Hiển thị lý do từ chối trong chi tiết */}
                                {identity.status === "REJECTED" && identity.reason && (
                                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lý do từ chối</p>
                                        <p className="font-medium text-red-600 dark:text-red-400 text-sm">
                                            {identity.reason}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Ảnh mặt trước
                                    </label>
                                    <img
                                        src={identity.frontImageUrl}
                                        alt="Mặt trước"
                                        className="w-full h-40 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => window.open(identity.frontImageUrl, '_blank')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Ảnh mặt sau
                                    </label>
                                    <img
                                        src={identity.backImageUrl}
                                        alt="Mặt sau"
                                        className="w-full h-40 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => window.open(identity.backImageUrl, '_blank')}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowDetail(false)}
                                    className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                >
                                    Đóng
                                </motion.button>
                                {/* {identity.status === "PENDING" && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setIsModalOpen(true)}
                                        disabled={isLoading}
                                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        Xóa yêu cầu
                                    </motion.button>
                                )} */}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form xác minh */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden space-y-4 pt-2"
                        >
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Số căn cước công dân
                                </label>
                                <input
                                    type="text"
                                    value={formData.citizenId}
                                    onChange={handleInputChange("citizenId")}
                                    className="w-full px-4 py-3 border rounded-xl dark:bg-zinc-900 dark:border-gray-600 dark:text-white outline-none transition-all"
                                    placeholder="Nhập 10-12 số CCCD"
                                />
                                {errors.citizenId && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-1 text-red-500 text-xs"
                                    >
                                        <AlertCircle size={14} />
                                        <span>{errors.citizenId}</span>
                                    </motion.div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Ngày cấp
                                </label>
                                <input
                                    type="date"
                                    value={formData.dateOfIssue}
                                    onChange={handleInputChange("dateOfIssue")}
                                    className="w-full px-4 py-3 border rounded-xl dark:bg-zinc-900 dark:border-gray-600 dark:text-white outline-none transition-all"
                                />
                                {errors.dateOfIssue && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-1 text-red-500 text-xs"
                                    >
                                        <AlertCircle size={14} />
                                        <span>{errors.dateOfIssue}</span>
                                    </motion.div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ImageUploadBox
                                    label="Ảnh mặt trước"
                                    field="frontImage"
                                    error={errors.frontImage}
                                />
                                <ImageUploadBox
                                    label="Ảnh mặt sau"
                                    field="backImage"
                                    error={errors.backImage}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleCancelForm}
                                    className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                >
                                    Hủy
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                            />
                                            Đang gửi...
                                        </span>
                                    ) : (
                                        isEditMode ? "Cập nhật" : "Gửi xác minh"
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
};