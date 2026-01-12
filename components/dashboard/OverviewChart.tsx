"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Label,
} from "recharts";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface OverviewChartProps {
  clientsCount: number;
  projectsCount: number;
  totalRevenue: number;
  invoiceCount: number;
  type?: "revenue" | "expense";
}

/* =======================
   THEME: mode + role
======================= */
const pieTheme = {
  light: {
    revenue: {
      title: "text-black",
      centerText: "#000000",
      colors: ["#7DBF1F", "#CFF38A", "#092c1b", "#F8A23E"],
      tooltipBg: "#F0F8CC",
      tooltipBorder: "#AFE033",
      tooltipText: "#3D5A00",
      legendText: "#3D5A00",
    },
    expense: {
      title: "text-black",
      centerText: "#000000",
      colors: ["#3D5A00", "#B0E032", "#092c1b"],
      tooltipBg: "#F0F8CC",
      tooltipBorder: "#AFE033",
      tooltipText: "#3D5A00",
      legendText: "#3D5A00",
    },
  },

  dark: {
    revenue: {
      title: "text-white",
      legendText: "#ECFDF5",
      centerText: "#E5E7EB",
      colors: ["#AFE033", "#7DBF1F", "#CFF38A", "#F8A23E"],
      tooltipBg: "#0B1F",
      tooltipBorder: "#AFE033",
      tooltipText: "#ECFDF5",
    },
    expense: {
      title: "text-white",
      legendText: "#ECFDF5",
      centerText: "#E5E7EB",
      colors: ["#CFF38A", "#AFE033", "#7DBF1F"],
      tooltipBg: "#0B8",
      tooltipBorder: "#AFE033",
      tooltipText: "#ECFDF5",
    },
  },
};

export default function OverviewChart({
  clientsCount,
  projectsCount,
  totalRevenue,
  invoiceCount,
  type = "revenue",
}: OverviewChartProps) {
  const { theme: mode } = useTheme(); // light | dark
  const theme = pieTheme[mode][type];

  /* =======================
     ROLE-BASED DATA
  ======================= */
  const data =
    type === "revenue"
      ? [
          { name: "Clients", value: clientsCount },
          { name: "Projects", value: projectsCount },
          { name: "Revenue", value: totalRevenue },
          { name: "Invoices", value: invoiceCount },
        ]
      : [
          { name: "Projects", value: projectsCount },
          { name: "Expense", value: totalRevenue },
          { name: "Invoices", value: invoiceCount },
        ];

  /* =======================
     OUTER VALUE LABELS
  ======================= */
  const CustomValueLabel = (props: any) => {
    const RADIAN = Math.PI / 180;
    const radius = props.outerRadius + 22;
    const x = props.cx + radius * Math.cos(-props.midAngle * RADIAN);
    const y = props.cy + radius * Math.sin(-props.midAngle * RADIAN);

    return (
      <motion.g
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.35,
          delay: props.index * 0.08,
          type: "spring",
          stiffness: 220,
        }}
      >
        <circle cx={x} cy={y} r={14} fill={theme.colors[props.index]} />
        <text
          x={x}
          y={y}
          fill="#ffffff"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={600}
        >
          {props.value >= 1000
            ? `${Math.round(props.value / 1000)}k`
            : props.value}
        </text>
      </motion.g>
    );
  };

  /* =======================
     CENTER LABEL
  ======================= */
  const CenterLabel = ({ viewBox }: any) => {
    const { cx, cy, width } = viewBox;
    const title = type === "revenue" ? "Total Revenue" : "Total Expense";
    const valueSize = Math.min(22, width / 10);

    return (
      <g>
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          fill={theme.centerText}
          fontSize={12}
          fontWeight={500}
          opacity={0.85}
        >
          {title}
        </text>

        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          fill={theme.centerText}
          fontSize={valueSize}
          fontWeight={700}
        >
          ${totalRevenue.toLocaleString()}
        </text>
      </g>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full w-full"
    >
      <h3 className={`font-semibold mb-4 ${theme.title}`}>Overview</h3>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Tooltip
            formatter={(value: any, name: any) => [
              value.toLocaleString(),
              name,
            ]}
            contentStyle={{
              backgroundColor: theme.tooltipBg,
              borderRadius: "8px",
              border: `1px solid ${theme.tooltipBorder}`,
              color: theme.tooltipText,
              fontSize: "14px",
            }}
            labelStyle={{ color: theme.tooltipText }}
          />

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={5}
            isAnimationActive={false}
            label={CustomValueLabel}
            labelLine={false}
          >
            <Label content={CenterLabel} />
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={theme.colors[index % theme.colors.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

        {/* ===================== LEGEND ===================== */}
      <div className="flex flex-wrap justify-center mt-4 gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: theme.colors[index % theme.colors.length] }}
            />
            <span style={{ color: theme.legendText }}>{item.name}</span>
          </div>
        ))}
      </div>

    </motion.div>
  );
}
