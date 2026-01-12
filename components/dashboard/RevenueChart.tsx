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
  view,
  onChangeView,
}: {
  data: any[];
  type?: "revenue" | "expense";
  view: "monthly" | "yearly";
  onChangeView: (v: "monthly" | "yearly") => void;
}) {
  const { theme } = useTheme();
  const chart = chartTheme[theme][type];

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      className="h-full w-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${chart.title}`}>
          {type === "revenue" ? "Revenue Overview" : "Expense Overview"}
        </h3>

        <div className="flex gap-2">
          <button
            onClick={() => onChangeView("monthly")}
            className={`px-3 py-1 text-sm rounded-md transition
              ${
                view === "monthly"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
              }`}
          >
            Monthly
          </button>

          <button
            onClick={() => onChangeView("yearly")}
            className={`px-3 py-1 text-sm rounded-md transition
              ${
                view === "yearly"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
              }`}
          >
            Yearly
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />

          <XAxis
            dataKey={view === "monthly" ? "month" : "year"}
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
            formatter={(value) => {
              if (typeof value !== "number") return "$0";
              return `$${value.toLocaleString()}`;
            }}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke={chart.line}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
