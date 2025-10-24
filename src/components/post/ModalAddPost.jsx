import { useState } from "react";
import { CircleX, BadgeCheck, ChevronRight, ImagePlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// 📌 Main component
export const ModalAddPost = ({ onClose }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...imageFiles]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    console.log("Posting:", content, images);
    setContent("");
    setImages([]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="w-full max-w-xl max-h-[90vh] bg-zinc-900 text-white rounded-2xl p-4 mx-2 overflow-hidden">
        {/* Header */}
        <Header onClose={onClose} />

        {/* User & Text */}
        <div className="flex gap-3 mt-4">
          <img
            loading="lazy"
            src={user?.avatarUrl || "default.png"}
            className="w-10 h-10 rounded-full object-cover"
            alt="avatar"
          />
          <div className="flex-1">
            <div className="flex items-center gap-1 text-sm font-medium text-white">
              {user?.fullName}
              {user?.isVerified && (
                <BadgeCheck className="ml-1 text-green-500 w-3 h-3 md:w-4 md:h-4" />

              )}
              <span className="text-zinc-500">
                <ChevronRight />
              </span>
              <span className="text-zinc-400">Thêm bài viết</span>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Có gì mới không?"
              rows={4}
              className="w-full bg-transparent resize-none text-sm mt-2 placeholder-zinc-500 focus:outline-none"
            />

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="overflow-x-scroll flex scrollbar-hide scroll-smooth gap-x-2 ">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative min-w-fit rounded-2xl shrink-0 snap-center"
                  >
                    <img
                      src={img}
                      alt="preview"
                      className="w-48 h-36 object-cover rounded-2xl"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-black/60 rounded-full p-1"
                    >
                      <CircleX className="text-red-500 w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add image button */}
        <div className="flex items-center justify-center mt-3">
          <label
            htmlFor="img"
            className="flex p-2 rounded-2xl bg-white items-center cursor-pointer text-black hover:bg-zinc-300 transition-colors text-sm font-medium"
          >
            <ImagePlus size={16} />
            <span className="ml-1 text-xs">Chọn ảnh</span>
          </label>
          <input
            accept="image/*"
            multiple
            type="file"
            id="img"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Submit */}
        <SubmitPost func={handlePost} desc={content} />
      </div>
    </div>
  );
};

// 📌 Header component
const Header = ({ onClose }) => (
  <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
    <button
      onClick={onClose}
      className="text-sm text-zinc-300 font-medium hover:text-white transition-colors duration-200"
    >
      <CircleX size={20} />
    </button>
    <h2 className="text-lg font-semibold">Bài viết mới</h2>
    <div />
  </div>
);

// 📌 Hiển thị từng ảnh
const ImageShow = ({ img, onRemove }) => (
  <div className=" w-48 h-36 rounded-lg">
    <img
      src={img}
      className="w-full h-full object-cover rounded-lg"
      alt="preview"
    />
    <button
      type="button"
      onClick={onRemove}
      className="  bg-black/60 rounded-full p-1 hover:bg-black/80"
    >
      <CircleX className="text-red-500 w-5 h-5" />
    </button>
  </div>
);

// 📌 Nút đăng bài
const SubmitPost = ({ func, desc }) => (
  <div className="flex justify-center items-center mt-4 border-t border-zinc-700 pt-3">
    <button
      disabled={!desc.trim()}
      onClick={func}
      className={`px-4 py-1.5 rounded-2xl text-sm font-medium transition
        ${desc.trim()
          ? "bg-white text-black hover:bg-zinc-300"
          : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
        }`}
    >
      Đăng
    </button>
  </div>
);
