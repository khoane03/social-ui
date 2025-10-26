import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { UpdateProfile } from "./UpdateProfile";
import {
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Cake,
  User ,
  PencilLine,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Info = () => {
  const { user, account } = useAuth();
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);

  const infoItems = [
    { icon: Phone, label: user?.phoneNumber, color: "from-emerald-400 to-teal-500" },
    { icon: Mail, label: account?.email, color: "from-blue-400 to-indigo-500" },
    { icon: MapPin, label: user?.address, color: "from-rose-400 to-pink-500" },
    {
      icon: CalendarDays,
      label: new Date(user?.dayOfBirth).toLocaleDateString("vi-VN"),
      color: "from-amber-400 to-orange-500"
    },
    { icon: Cake, label: `${user?.age} tuổi`, color: "from-purple-400 to-violet-500" },
    { 
      icon: User, 
      label: user?.gender === "FEMALE" ? "Nữ": user?.gender === "MALE" ? "Nam" : "Khác",
      color: "from-cyan-400 to-blue-500"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <div className="min-h-screen p-4 transition-colors">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg rounded-2xl p-6 space-y-5 border border-gray-100 dark:border-gray-700"
      >
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
        >
          Thông tin cá nhân
        </motion.h2>

        <motion.div className="space-y-3" variants={containerVariants}>
          {infoItems.map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                x: 4,
                transition: { duration: 0.2 }
              }}
              className="group relative flex items-center gap-4 bg-white dark:bg-gray-800 px-4 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              {/* Gradient background on hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300`}
              />
              
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className={`relative z-10 p-2 rounded-lg bg-gradient-to-br ${item.color} shadow-sm`}
              >
                <item.icon size={18} className="text-white" />
              </motion.div>
              
              <span className="relative z-10 text-sm font-medium text-gray-700 dark:text-gray-200">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          onClick={() => setShowUpdateProfile(true)}
          className="relative w-full sm:w-auto mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"
          />
          <motion.div
            whileHover={{ rotate: 15 }}
            transition={{ duration: 0.3 }}
          >
            <PencilLine size={18} />
          </motion.div>
          <span className="relative z-10">Chỉnh sửa thông tin</span>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showUpdateProfile && (
          <UpdateProfile onClose={() => setShowUpdateProfile(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};
