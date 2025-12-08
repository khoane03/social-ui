import { Trash2, FileEdit, Users, Lock, Globe2, Image as ImageIcon, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import postService from "../../service/postService";
import { formatTime } from "../../service/ultilsService";
import { ShowPost } from "../../components/post/ShowPost";

export const PostManagerPage = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [isShowDetail, setIsShowDetail] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null); // NEW

  useEffect(() => {
    document.title = "Quản lý bài viết - Dashboard Admin";
    (async () => {
      try {
        const res = await postService.getByAdmin(1, 100);
        console.log(res);
        setAllPosts(res.data);
      } catch (error) {}
    })();
  }, []);

  const handlePostDetails = (post) => {
    setSelectedPost(post);      // lưu post đang chọn
    setIsShowDetail(true);      // mở popup/chi tiết
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
      <div className="w-full bg-white dark:bg-[#1f2937] rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Quản lý bài viết
        </h2>

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
              {allPosts.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    Không có bài viết phù hợp.
                  </td>
                </tr>
              ) : (
                allPosts.map((post) => (
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
                        className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 hover:scale-105 transition"
                      >
                        <FileEdit
                          size={16}
                          className="text-blue-600 dark:text-blue-300"
                        />
                      </button>
                      <button
                        title="Xoá"
                        className="p-2 rounded-full bg-red-100 dark:bg-red-900 hover:scale-105 transition"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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