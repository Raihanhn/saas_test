"use client";

import Link from "next/link";
import { X, ChevronRight } from "lucide-react";
import { adminMenu, clientMenu } from "@/components/sidebar/menu";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  collapsed: boolean;
  toggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  collapsed,
  toggleCollapse,
  mobileOpen,
  onCloseMobile,
}: Props) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { theme } = useTheme();

  if (status === "loading" || !session) return null;

  const role = session.user.role;
  const menus = role === "admin" ? adminMenu : clientMenu;

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
        flex-shrink-0
        z-50 flex flex-col shadow-xl
        ${theme === "dark" ? "bg-gray-800" : "bg-linear-to-b from-emerald-600 via-emerald-700 to-emerald-800"}
        text-white
        ${collapsed ? "w-20" : "w-64"}
        ${mobileOpen ? "fixed inset-y-0 left-0" : "hidden"}
        md:static md:flex
      `}
          >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          {!collapsed && (
            <span className="text-lg font-bold tracking-wide">Agentic</span>
          )}

          {/* Collapse Toggle (ONLY control) */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-1 rounded hover:bg-white/10"
          >
            <ChevronRight
              className={`flex flex-col flex-1 overflow-hidden ${
                collapsed ? "rotate-0" : "rotate-180"
              }`}
            />
          </button>

          {/* Mobile Close */}
          <button onClick={onCloseMobile} className="md:hidden">
            <X />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 ">
          {menus.map(({ name, href, icon: Icon }) => {
            const active = pathname === href;

            return (
              <motion.div
                key={name}
                whileHover={{ scale: 1.05, x: 4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
          
                <Link
                  href={href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    text-sm font-medium transition
                    ${
                      active
                        ? "bg-white/25 backdrop-blur-md"
                        : "hover:bg-white/20 hover:backdrop-blur-md"
                    }
                  `}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{name}</span>}
                </Link>
              </motion.div>
              // </div>
            );
          })}
        </nav>

        {/* Bottom Area */}
        <div className="px-3 cursor-pointer border-t border-white/10">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`flex cursor-pointer  ${collapsed ? "justify-center" : ""}`}
          >
            <DarkModeToggle collapsed={collapsed}   />
          </motion.div>
        </div>
      </aside>
    </>
  );
}
