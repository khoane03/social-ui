import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-100/25">
      <div className="relative">
        {/* Vòng tròn ngoài */}
        <motion.div
          className="w-24 h-24 border-4 border-blue-200 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Vòng tròn giữa */}
        <motion.div
          className="absolute top-0 left-0 w-24 h-24 border-4 border-blue-400 rounded-full border-t-transparent"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Chấm giữa */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      
      {/* Text loading */}
      <motion.p
        className="mt-8 text-slate-600 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        Đang tải...
      </motion.p>
    </div>
  );
};

export default Loading;
