"use client";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

interface Props {
  collapsed?: boolean; // Optional prop to know if sidebar is collapsed
}

export default function DarkModeToggle({ collapsed }: Props) {
  const { theme, toggleTheme } = useTheme();

  // Icon colors
  const iconColor = theme === "dark" ? "#facc15" /* amber/yellow for sun */ : "#ffffff" /*  for moon */;

  return (
    <button
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`
        flex items-center justify-center cursor-pointer
        ${collapsed ? "w-10 h-10" : "w-full h-10 px-3"}
        rounded-lg
        hover:bg-white/20 transition-colors
        text-white
      `}
    >
      {theme === "dark" ? (
        <Sun size={18} color={iconColor} />
      ) : (
        <Moon size={18} color={iconColor} />
      )}
      {!collapsed && (
        <span className="ml-2 text-sm font-medium">
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
