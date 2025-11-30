import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useState, useEffect } from "react";
import accountService from "../../service/accountService";

const COLORS = ["#00C49F", "#FB2C37"];

const postData = [
  { month: "Th1", baiViet: 30 },
  { month: "Th2", baiViet: 45 },
  { month: "Th3", baiViet: 60 },
  { month: "Th4", baiViet: 50 },
  { month: "Th5", baiViet: 70 },
  { month: "Th6", baiViet: 40 },
  { month: "Th7", baiViet: 40 },
  { month: "Th8", baiViet: 80 },
  { month: "Th9", baiViet: 100 },
  { month: "Th10", baiViet: 40 },
  { month: "Th11", baiViet: 40 },
  { month: "Th12", baiViet: 40 },
];

// Custom Tooltip với animation
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg p-3"
      >
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          {payload[0].payload.month}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Bài viết: <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {payload[0].value}
          </span>
        </p>
      </motion.div>
    );
  }
  return null;
};

// Custom Pie Tooltip
const CustomPieTooltip = ({ active, payload, totalUsers }) => {
  if (active && payload && payload.length) {
    const percentage = totalUsers > 0 
      ? ((payload[0].value / totalUsers) * 100).toFixed(1)
      : 0;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: payload[0].payload.fill }}
          />
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {payload[0].name}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Số lượng: <span className="font-bold text-gray-900 dark:text-white">
              {payload[0].value}
            </span>
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Tỷ lệ: <span className="font-bold" style={{ color: payload[0].payload.fill }}>
              {percentage}%
            </span>
          </p>
        </div>
      </motion.div>
    );
  }
  return null;
};

export const DashboardCharts = () => {
  const [userData, setUserData] = useState([
    { name: "Đang hoạt động", value: 0 },
    { name: "Bị khóa", value: 0 },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [pieAnimationComplete, setPieAnimationComplete] = useState(false);
  const [barAnimationComplete, setBarAnimationComplete] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const totalUsers = userData.reduce((sum, item) => sum + item.value, 0);
  const totalPosts = postData.reduce((sum, item) => sum + item.baiViet, 0);

  // Fetch statistical data
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoading(true);
        const { data } = await accountService.statisticalAccounts();
        console.log("User statistics:", data);
        
        setUserData([
          { name: "Đang hoạt động", value: data.active || 0 },
          { name: "Bị khóa", value: data.inactive || 0 },
        ]);
      } catch (error) {
        console.error("Error fetching user statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* Pie Chart - User Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 transition-colors duration-300 border border-gray-100 dark:border-zinc-800"
      >
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-gray-700/50 to-transparent animate-shimmer rounded-2xl" 
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
            }}
          />
        )}

        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-xl font-semibold text-gray-800 dark:text-white">
            Trạng thái người dùng
          </h3>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold"
          >
            {!isLoading && (
              <CountUp
                start={0}
                end={totalUsers}
                duration={2}
                separator=","
                onEnd={() => setPieAnimationComplete(true)}
              />
            )}
          </motion.div>
        </div>

        <ResponsiveContainer width="100%" height={250} className="sm:h-[280px]">
          <PieChart>
            <Pie
              data={userData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              isAnimationActive={!isLoading}
              animationBegin={0}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {userData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={activeIndex === index ? 3 : 0}
                  style={{
                    filter: activeIndex === index ? 'brightness(1.2)' : 'brightness(1)',
                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip totalUsers={totalUsers} />} />
            
            {/* Center Label */}
            {!isLoading && totalUsers > 0 && (
              <>
                <text
                  x="50%"
                  y="43%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-gray-400 dark:fill-gray-500 text-xs"
                >
                  Tổng số
                </text>
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-gray-900 dark:fill-white font-bold text-2xl"
                >
                  {totalUsers}
                </text>
              </>
            )}
          </PieChart>
        </ResponsiveContainer>

        {/* Custom Legend */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-2">
          {userData.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 + index * 0.1 }}
              className="flex items-center gap-2 cursor-pointer"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: COLORS[index],
                  transform: activeIndex === index ? 'scale(1.3)' : 'scale(1)'
                }}
              />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                {item.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: pieAnimationComplete ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-5"
        >
          {userData.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 + index * 0.1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800/50 dark:to-zinc-800/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 dark:border-zinc-700 cursor-pointer transition-all duration-300"
              style={{
                boxShadow: activeIndex === index ? `0 4px 20px ${COLORS[index]}40` : 'none'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {totalUsers > 0 ? ((item.value / totalUsers) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">
                {item.name}
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {!isLoading && (
                  <CountUp
                    start={0}
                    end={item.value}
                    duration={2}
                    delay={1.5}
                  />
                )}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bar Chart - Posts per Month */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 transition-colors duration-300 border border-gray-100 dark:border-zinc-800"
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-xl font-semibold text-gray-800 dark:text-white">
            Bài viết hàng tháng
          </h3>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold"
          >
            <CountUp
              start={0}
              end={totalPosts}
              duration={2}
              separator=","
              onEnd={() => setBarAnimationComplete(true)}
            />
          </motion.div>
        </div>

        <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
          <BarChart 
            data={postData} 
            isAnimationActive={true}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              className="dark:stroke-zinc-800"
            />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 10, fill: "#6b7280" }}
              className="sm:text-xs dark:fill-gray-400"
              stroke="#9ca3af"
            />
            <YAxis 
              tick={{ fontSize: 10, fill: "#6b7280" }}
              className="sm:text-xs dark:fill-gray-400"
              stroke="#9ca3af"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
            <Legend 
              formatter={() => "Bài viết"}
              wrapperStyle={{ paddingTop: "10px" }}
              iconType="circle"
            />
            <Bar 
              dataKey="baiViet" 
              fill="#6366f1" 
              radius={[8, 8, 0, 0]}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Monthly Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: barAnimationComplete ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-3 gap-2 sm:gap-3 mt-3 sm:mt-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800/50 dark:to-zinc-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-100 dark:border-zinc-700 cursor-pointer transition-all"
          >
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">
              Trung bình
            </p>
            <p className="text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-400">
              <CountUp
                start={0}
                end={Math.round(totalPosts / postData.length)}
                duration={2}
                delay={1.5}
              />
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9 }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800/50 dark:to-zinc-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-100 dark:border-zinc-700 cursor-pointer transition-all"
          >
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">
              Cao nhất
            </p>
            <p className="text-sm sm:text-base font-bold text-green-600 dark:text-green-400">
              <CountUp
                start={0}
                end={Math.max(...postData.map(d => d.baiViet))}
                duration={2}
                delay={1.5}
              />
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0 }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800/50 dark:to-zinc-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-100 dark:border-zinc-700 cursor-pointer transition-all"
          >
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">
              Thấp nhất
            </p>
            <p className="text-sm sm:text-base font-bold text-red-600 dark:text-red-400">
              <CountUp
                start={0}
                end={Math.min(...postData.map(d => d.baiViet))}
                duration={2}
                delay={1.5}
              />
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};