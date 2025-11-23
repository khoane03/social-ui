import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const ImageModal = ({ imageUrl, isOpen, onClose }) => {
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
              
              {/* Image */}
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                src={imageUrl}
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
