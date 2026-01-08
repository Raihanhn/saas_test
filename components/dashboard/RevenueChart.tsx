"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTheme } from "@/context/ThemeContext";

const chartTheme = {
  light: {
    revenue: {
      title: "text-black",
      line: "#065F46",
      axis: "#000000",
      grid: "#D1FAE5",
      tooltipBg: "#ECFDF5",
      tooltipText: "#064E3B",
    },
    expense: {
      title: "text-black",
      line: "#7DBF1F",
      axis: "#000000",
      grid: "#D1FAE5",
      tooltipBg: "#ECFDF5",
      tooltipText: "#064E3B",
    },
  },
  dark: {
    revenue: {
      title: "text-white",
      line: "#AFE033",
      axis: "#E5E7EB",
      grid: "#6B7280",
      tooltipBg: "#0B1F14",
      tooltipText: "#ECFDF5",
    },
    expense: {
      title: "text-white",
      line: "#CFF38A",
      axis: "#E5E7EB",
      grid: "#6B7280",
      tooltipBg: "#0B1F14",
      tooltipText: "#ECFDF5",
    },
  },
};

export default function RevenueChart({
  data,
  type = "revenue",
}: {
  data: { day: string; value: number }[];
  type?: "revenue" | "expense";
}) {
  const { theme } = useTheme();
  const chart = chartTheme[theme][type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full w-full"
    >
      <h3 className={`font-semibold mb-4 ${chart.title}`}>
        {type === "revenue" ? "Revenue Overview" : "Expense Overview"}
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />

          <XAxis
            dataKey="day"
            tick={{ fill: chart.axis, fontSize: 12 }}
            axisLine={{ stroke: chart.axis }}
            tickLine={{ stroke: chart.axis }}
          />

          <YAxis
            tick={{ fill: chart.axis, fontSize: 12 }}
            axisLine={{ stroke: chart.axis }}
            tickLine={{ stroke: chart.axis }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: chart.tooltipBg,
              borderRadius: 8,
              border: "none",
              color: chart.tooltipText,
            }}
            labelStyle={{ color: chart.tooltipText }}
            formatter={(v: any) => `$${v.toLocaleString()}`}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke={chart.line}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
