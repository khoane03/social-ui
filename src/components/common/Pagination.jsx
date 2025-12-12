import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    const getPages = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border transition-all duration-300 ${currentPage === 1
                        ? "opacity-40 cursor-not-allowed border-gray-200 bg-gray-50"
                        : "border-blue-100 bg-white hover:bg-blue-50 hover:border-blue-200 text-gray-600 hover:text-blue-600"
                    }`}
            >
                <ChevronLeft className="w-4 h-4" />
            </motion.button>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentPage}
                    className="flex gap-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    {getPages().map((page) => (
                        <motion.button
                            key={page}
                            onClick={() => onPageChange(page)}
                            whileHover={{ scale: 1.08, y: -1 }}
                            whileTap={{ scale: 0.96 }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${currentPage === page
                                    ? "bg-blue-500 text-white shadow-sm"
                                    : "border border-gray-200 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 hover:border-blue-200"
                                }`}
                        >
                            {page}
                        </motion.button>
                    ))}
                </motion.div>
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border transition-all duration-300 ${currentPage === totalPages
                        ? "opacity-40 cursor-not-allowed border-gray-200 bg-gray-50"
                        : "border-blue-100 bg-white hover:bg-blue-50 hover:border-blue-200 text-gray-600 hover:text-blue-600"
                    }`}
            >
                <ChevronRight className="w-4 h-4" />
            </motion.button>
        </div>
    );
}