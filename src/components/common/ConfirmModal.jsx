import React, { useState, useEffect } from 'react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Xác nhận", cancelText = "Hủy" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 shadow-lg shadow-blue-500/30 dark:shadow-blue-900/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};