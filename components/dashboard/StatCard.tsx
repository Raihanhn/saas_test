"use client";

import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  negative?: boolean;
}

export default function StatCard({ title, value, change, negative }: StatCardProps) {

  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
      transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
      className={`
       
        rounded-xl p-4 shadow-md
        cursor-pointer ${theme === "dark" ? "bg-gray-800" : " bg-linear-to-b from-emerald-600 via-emerald-700 to-emerald-800"}
      `}
    >
      <p className="text-sm text-white font-medium">{title}</p>
      <div className="flex justify-between items-end mt-2">
        <h2 className="text-2xl font-bold text-white">{value}</h2>
        <span
          className={`
            text-sm font-medium
            ${negative ? "text-red-400" : "text-emerald-300"}
          `}
        >
          {change}
        </span>
      </div>
    </motion.div>
  );
}
