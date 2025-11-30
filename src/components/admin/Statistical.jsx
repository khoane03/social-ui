import { Newspaper, Users2, UserX } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import CountUp from "react-countup";
import { useEffect, useState, useMemo } from "react";
import accountService from "../../service/accountService";
import postService from "../../service/postService";

export const Statistical = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalPosts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  const fetchStatisticalData = async () => {
    try {
      setIsLoading(true);
      
      // Parallel API calls để tăng tốc
      const [accountData, postData] = await Promise.all([
        accountService.statisticalAccounts(),
        postService.countAll()
      ]);
      
      setStats({
        total: accountData.data?.total || 0,
        active: accountData.data?.active || 0,
        inactive: accountData.data?.inactive || 0,
        totalPosts: postData.data?.totalPosts || 0,
      });
    } catch (error) {
      console.error("Error fetching statistical data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Dashboard - Thống Kê";
    fetchStatisticalData();
  }, []);

  const cards = useMemo(() => [
    {
      title: "Tổng người dùng",
      value: stats.total,
      icon: <Users2 className="w-6 h-6" />,
      color: "blue",
      bgLight: "bg-blue-50",
      bgDark: "dark:bg-blue-900/30",
      iconBg: "bg-blue-500",
      textColor: "text-blue-500",
      hoverShadow: "hover:shadow-blue-500/20",
      subtitle: "Người dùng hoạt động",
      subValue: stats.active,
    },
    {
      title: "Tổng bài viết",
      value: stats.totalPosts,
      icon: <Newspaper className="w-6 h-6" />,
      color: "green",
      bgLight: "bg-green-50",
      bgDark: "dark:bg-green-900/30",
      iconBg: "bg-green-500",
      textColor: "text-green-500",
      hoverShadow: "hover:shadow-green-500/20",
    },
    {
      title: "Người dùng bị khóa",
      value: stats.inactive,
      icon: <UserX className="w-6 h-6" />,
      color: "red",
      bgLight: "bg-red-50",
      bgDark: "dark:bg-red-900/30",
      iconBg: "bg-red-500",
      textColor: "text-red-500",
      hoverShadow: "hover:shadow-red-500/20",
      percentage: stats.total > 0 ? ((stats.inactive / stats.total) * 100).toFixed(1) : 0,
    },
  ], [stats]);

  const containerVariants = {
    hidden: { 
      opacity: 0 
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: prefersReducedMotion ? 0 : 30,
      scale: prefersReducedMotion ? 1 : 0.95,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        mass: 0.8,
      },
    },
  };

  const iconVariants = {
    initial: { 
      scale: 1,
      rotate: 0 
    },
    hover: { 
      scale: 1.1,
      rotate: prefersReducedMotion ? 0 : [0, -8, 8, -5, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  const shimmerVariants = {
    animate: {
      backgroundPosition: ["200% 0", "-200% 0"],
      transition: {
        duration: 2,
        ease: "linear",
        repeat: Infinity,
      },
    },
  };

  const decorativeVariants = {
    animate: {
      scale: [1, 1.15, 1],
      opacity: [0.08, 0.12, 0.08],
      transition: {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };

  const pulseVariants = {
    animate: {
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 2.5,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 select-none"
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          variants={cardVariants}
          whileHover={{ 
            scale: prefersReducedMotion ? 1 : 1.02,
            y: prefersReducedMotion ? 0 : -4,
            transition: { 
              duration: 0.2,
              ease: "easeOut" 
            }
          }}
          whileTap={{ 
            scale: prefersReducedMotion ? 1 : 0.98,
            transition: { 
              duration: 0.1 
            }
          }}
          className={`
            relative overflow-hidden
            flex flex-col p-4 sm:p-5 rounded-2xl sm:rounded-3xl 
            shadow-md transition-shadow duration-300 cursor-pointer
            ${card.bgLight} ${card.bgDark} ${card.hoverShadow}
            border border-gray-100 dark:border-gray-700/50
            will-change-transform
          `}
        >
          {/* Loading Skeleton */}
          {isLoading && (
            <motion.div 
              variants={shimmerVariants}
              animate="animate"
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-gray-700/50 to-transparent"
              style={{
                backgroundSize: '200% 100%',
              }}
            />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 pointer-events-none" />

          {/* Content */}
          <div className="relative flex items-start w-full z-10">
            {/* Icon */}
            <motion.div
              variants={iconVariants}
              initial="initial"
              whileHover="hover"
              className={`
                p-3 sm:p-3.5 rounded-xl sm:rounded-2xl 
                ${card.iconBg} 
                shadow-lg mr-3 sm:mr-4
                flex items-center justify-center
                will-change-transform
              `}
            >
              <div className="text-white">
                {card.icon}
              </div>
            </motion.div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <motion.h4 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: prefersReducedMotion ? 0 : 0.15 + index * 0.08,
                  duration: 0.3,
                  ease: "easeOut"
                }}
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-1 font-medium"
              >
                {card.title}
              </motion.h4>
              
              <motion.p 
                initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: prefersReducedMotion ? 0 : 0.25 + index * 0.08,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
              >
                {!isLoading && (
                  <CountUp
                    start={0}
                    end={card.value}
                    duration={prefersReducedMotion ? 0 : 2}
                    delay={prefersReducedMotion ? 0 : 0.4 + index * 0.15}
                    separator=","
                    useEasing={!prefersReducedMotion}
                    easingFn={(t, b, c, d) => {
                      // easeOutCubic - smoother than expo
                      const tc = (t /= d) - 1;
                      return c * (tc * tc * tc + 1) + b;
                    }}
                  />
                )}
              </motion.p>

              {/* Subtitle for active users */}
              {card.subtitle && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: prefersReducedMotion ? 0 : 0.6 + index * 0.08,
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                  className="mt-2 flex items-center gap-2"
                >
                  <motion.div 
                    className={`w-2 h-2 rounded-full ${card.iconBg}`}
                    variants={pulseVariants}
                    animate={prefersReducedMotion ? {} : "animate"}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {card.subtitle}: <span className={`font-semibold ${card.textColor}`}>
                      {!isLoading && (
                        <CountUp
                          start={0}
                          end={card.subValue || 0}
                          duration={prefersReducedMotion ? 0 : 2}
                          delay={prefersReducedMotion ? 0 : 0.7 + index * 0.15}
                          separator=","
                          useEasing={!prefersReducedMotion}
                        />
                      )}
                    </span>
                  </span>
                </motion.div>
              )}

              {/* Percentage badge for locked accounts */}
              {card.percentage !== undefined && (
                <motion.div
                  initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: prefersReducedMotion ? 0 : 0.6 + index * 0.08,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                >
                  <motion.span
                    variants={pulseVariants}
                    animate={prefersReducedMotion ? {} : "animate"}
                    className={`text-xs font-semibold ${card.textColor}`}
                  >
                    {card.percentage}%
                  </motion.span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    của tổng số
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Decorative elements */}
          <motion.div
            className={`absolute -right-8 -bottom-8 w-32 h-32 ${card.iconBg} rounded-full opacity-10 blur-2xl pointer-events-none`}
            variants={decorativeVariants}
            animate={prefersReducedMotion ? {} : "animate"}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};