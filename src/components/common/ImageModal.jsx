import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Có thể truyền:
// - images + currentIndex  => xem nhiều ảnh
// - hoặc imageUrl           => xem 1 ảnh đơn
export const ImageModal = ({
  images = [],
  currentIndex = 0,
  imageUrl,
  isOpen,
  onClose,
}) => {
  const hasList = images && images.length > 0;
  const [index, setIndex] = useState(currentIndex);

  useEffect(() => {
    if (isOpen && hasList) setIndex(currentIndex);
  }, [isOpen, currentIndex, hasList]);

  // Không có gì để hiển thị
  if (!isOpen || (!hasList && !imageUrl)) return null;

  const prev = () => {
    if (!hasList) return;
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const next = () => {
    if (!hasList) return;
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  const src = hasList ? images[index] : imageUrl;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 cursor-pointer"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative max-w-5xl max-h-[90vh] pointer-events-auto">
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
              >
                <X className="w-6 h-6 text-gray-800" />
              </motion.button>

              {/* Nút prev/next chỉ hiện nếu có nhiều ảnh */}
              {hasList && images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="fixed left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition z-[60]"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={next}
                    className="fixed right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition z-[60]"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image */}
              <motion.img
                key={src}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                src={src}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};