import { MessageCircleHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const IntroLoading = () => {
  const text = "Social Media";
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;
   
    const typeWriter = () => {      
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
        setTimeout(typeWriter, 150);
      }
    };
    typeWriter();
  }, []);

  return (
    <motion.div 
      className="fixed inset-0 dark:bg-gray-900 bg-[#F1F4F7] flex flex-col items-center justify-center gap-4 z-50 select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <MessageCircleHeart className="text-pink-500 w-12 h-12" />
      </motion.div>

      <motion.span 
        className="dark:text-b-wt text-white-theme text-4xl font-bold font-lobster tracking-wide"
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {displayText}
      </motion.span>
    </motion.div>
  );
};

export default IntroLoading;