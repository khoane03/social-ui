import { Trash2, FileEdit, Users, Lock, Globe2, Image as ImageIcon, Globe, Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import postService from "../../service/postService";
import { formatTime } from "../../service/ultilsService";
import { ShowPost } from "../../components/post/ShowPost";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import Pagination from "../../components/common/Pagination";

export const PostManagerPage = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isShowDetail, setIsShowDetail] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    privacy: "ALL",
    author: "",
  });

  const fetchPosts = async (page) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const res = await postService.getByAdmin(page, 10);
      setTotalPages(res.totalPages || 1);
      setAllPosts(res.data);
      setFilteredPosts(res.data);

    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Quản lý bài viết - Dashboard Admin";
    fetchPosts(currentPage);
  }, [currentPage]);

  // Apply filters
  useEffect(() => {
    let filtered = [...allPosts];

    // Filter by privacy
    if (filters.privacy !== "ALL") {
      filtered = filtered.filter(
        (post) => (post.privacy || "").toUpperCase() === filters.privacy
      );
    }

    // Filter by author name
    if (filters.author.trim()) {
      const searchTerm = filters.author.toLowerCase();
      filtered = filtered.filter((post) =>
        post.author?.fullName?.toLowerCase().includes(searchTerm)
      );
    }
    setFilteredPosts(filtered);
  }, [filters, allPosts]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      privacy: "ALL",
      author: "",
    });
  };

  const hasActiveFilters =
    filters.privacy !== "ALL" ||
    filters.author ||
    filters.dateFrom ||
    filters.dateTo;

  const handlePostDetails = (post) => {
    setSelectedPost(post);
    setIsShowDetail(true);
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;

    setIsDeleting(true);
    try {
      await postService.deletePost(selectedPost.id);
      setAllPosts((prevPosts) => prevPosts.filter((post) => post.id !== selectedPost.id));
      setIsConfirmOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteConfirm = (post) => {
    setSelectedPost(post);
    setIsConfirmOpen(true);
  };

  const renderPrivacy = (privacy) => {
    const normalized = (privacy || "").toUpperCase();
    switch (normalized) {
      case "PRIVATE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300">
            <Lock size={12} />
            Riêng tư
          </span>
        );
      case "FRIENDS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <Users size={12} />
            Bạn bè
          </span>
        );
      case "PUBLIC":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <Globe size={12} />
            Công khai
          </span>
        );
    }
  };

  const renderThumbnail = (post) => {
    const hasImages = post.urls && post.urls.length > 0;

    if (hasImages) {
      return (
        <div className="relative w-12 h-12">
          <img
            src={post.urls[0]}
            alt="thumbnail"
            className="w-full h-full object-cover rounded-lg shadow"
          />
          {post.urls.length > 1 && (
            <span className="absolute bottom-0 right-0 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded-full">
              +{post.urls.length - 1}
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600">
        <ImageIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </div>
    );
  };

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsConfirmOpen(false);
            setSelectedPost(null);
          }
        }}
        onConfirm={handleDeletePost}
        title="Xác nhận xoá bài viết"
        message={`Bạn có chắc chắn muốn xoá bài viết của ${selectedPost?.author?.fullName || 'người dùng này'} không? Hành động này không thể hoàn tác.`}
        confirmText="Xoá"
        confirmStyle="danger"
        loading={isDeleting}
      />

      <div className="w-full bg-white dark:bg-[#1f2937] rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Quản lý bài viết
        </h2>

        {/* Filters Section */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bộ lọc
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                <X size={14} />
                Xóa bộ lọc
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Privacy Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Hiển thị
              </label>
              <select
                value={filters.privacy}
                onChange={(e) => handleFilterChange("privacy", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="ALL">Tất cả</option>
                <option value="PUBLIC">Công khai</option>
                <option value="FRIENDS">Bạn bè</option>
                <option value="PRIVATE">Riêng tư</option>
              </select>
            </div>

            {/* Author Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Tác giả
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={filters.author}
                  onChange={(e) => handleFilterChange("author", e.target.value)}
                  placeholder="Tìm theo tên..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Filter Results Info */}
          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            Hiển thị <span className="font-semibold text-indigo-600 dark:text-indigo-400">{filteredPosts.length}</span> / {allPosts.length} bài viết
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                <th className="px-4 py-2">Ảnh</th>
                <th className="px-4 py-2">Nội dung</th>
                <th className="px-4 py-2">Tác giả</th>
                <th className="px-4 py-2">Hiển thị</th>
                <th className="px-4 py-2">Ngày đăng</th>
                <th className="px-4 py-2 text-center">Hành động</th>
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
              ) : filteredPosts.length === 0 ?
                (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-6 text-gray-500 dark:text-gray-400"
                    >
                      {hasActiveFilters ? "Không tìm thấy bài viết phù hợp với bộ lọc." : "Không có bài viết phù hợp."}
                    </td>
                  </tr>
                ) :
                (
                  filteredPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-4 py-3">
                        {renderThumbnail(post)}
                      </td>

                      <td className="px-4 py-3 text-gray-900 dark:text-white max-w-xs">
                        <p className="line-clamp-2 break-words">
                          {post.content || "(Không có nội dung)"}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {post.author?.fullName || "N/A"}
                      </td>

                      <td className="px-4 py-3">
                        {renderPrivacy(post.privacy)}
                      </td>

                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {formatTime(post.createAt)}
                      </td>

                      <td className="px-4 py-3 flex justify-center gap-3">
                        <button
                          title="Xem chi tiết"
                          onClick={() => handlePostDetails(post)}
                          disabled={isDeleting}
                          className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FileEdit
                            size={16}
                            className="text-blue-600 dark:text-blue-300"
                          />
                        </button>
                        <button
                          title="Xoá"
                          onClick={() => openDeleteConfirm(post)}
                          disabled={isDeleting}
                          className="p-2 rounded-full bg-red-100 dark:bg-red-900 hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))
                )
              }
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* ShowPost modal / chi tiết */}
      {isShowDetail && selectedPost && (
        <ShowPost
          post={selectedPost}
          onClose={() => {
            setIsShowDetail(false);
            setSelectedPost(null);
          }}
        />
      )}
    </>
  );
};