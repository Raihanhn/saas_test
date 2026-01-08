//components/layouts/DashboardLayout.tsx
"use client";
import { useEffect, useState} from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Footer from "../Footer";
import RequireAuth from "@/components/guards/RequireAuth";
import { useTheme } from "@/context/ThemeContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem("sidebar_collapsed");
    if (stored !== null) {
      setCollapsed(stored === "true");
    }
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar_collapsed", String(!prev));
      return !prev;
    });
  };


  return (
     <RequireAuth>
    <div className={`flex flex-col min-h-screen ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        }`}
    >
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          toggleCollapse={toggleCollapse}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar
            onMenuClick={() => setMobileOpen(true)}
            collapsed={collapsed}
            toggleCollapse={toggleCollapse}
          />

          <main className="flex-1 overflow-auto p-4 ">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
    </RequireAuth>
  );
}