// components/Topbar.tsx
"use client";

import Image from "next/image";
import { Menu, User, Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";
import axios from "axios";
import Link from "next/link";

interface Props {
  onMenuClick: () => void;
  collapsed: boolean;
  toggleCollapse: () => void;
}

export default function Topbar({
  onMenuClick,
  collapsed,
  toggleCollapse,
}: Props) {
  const [open, setOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const userImage = session?.user?.image || null;
  const role = session?.user?.role;
  const { theme } = useTheme();

  const handleNotificationClick = async () => {
    setNotifOpen((prev) => !prev);

    if (notifCount > 0) {
      try {
        await axios.post("/api/notifications/read");
        setNotifCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (err) {
        console.error("Failed to mark notifications as read");
      }
    }
  };

  useEffect(() => {
    if (role === "client") {
      const fetchNotifications = async () => {
        try {
          const res = await axios.get("/api/notifications");
          setNotifCount(res.data.count);
          setNotifications(res.data.notifications);
        } catch (err) {
          console.error("Failed to fetch notifications:", err);
        }
      };

      fetchNotifications();
    }
  }, [role]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    console.log("SESSION IMAGE:", session?.user?.image);
  }, [session]);

  return (
    <header className={`flex items-center justify-between
      px-4 py-3 shadow  ${theme === "dark" ? "bg-gray-600" : "bg-white"} `}>
      <div className="flex items-center gap-2">
        <button onClick={onMenuClick} className="md:hidden cursor-pointer ">
          <Menu />
        </button>

        <button
          onClick={toggleCollapse}
          className="hidden md:flex items-center justify-center cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Image
            src="/logo.png"
            alt="PineForgeLab"
            width={collapsed ? 32 : 40}
            height={40}
            className="transition-all duration-300"
            priority
          />
        </button>
      </div>

      <div className="flex items-center gap-3 relative" ref={ref}>
        {role === "client" && (
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className={`relative h-10 w-10 rounded-full cursor-pointer transition transform hover:scale-105
          ${theme === "dark" ? "bg-gray-800 hover:bg-gray-700  " : "bg-emerald-700 hover:bg-emerald-800  "}
        flex items-center justify-center`}
              aria-label="Notifications"
            >
              <Bell size={18} className={` ${theme === "dark" ? "text-white" : "text-white"}`} />
              {notifCount > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </button>

            {notifOpen && (
              <div className={`absolute right-0 mt-2 w-64 max-h-80 overflow-auto
                 ${theme === "dark" ? "bg-gray-800" : "bg-white"}
                shadow-lg rounded-lg z-50`}>
                {notifications.length === 0 ? (
                  <p className="p-4 text-gray-500 text-sm">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className="border-b last:border-b-0 px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {n.message}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="h-10 w-10 rounded-full
    bg-linear-to-b from-emerald-600 via-emerald-700 to-emerald-700
    text-white flex items-center justify-center overflow-hidden cursor-pointer"
        >
          <img
            src={userImage || "/avatars/avatars.png"}
            alt="User"
            className="w-full h-full object-cover transition-all duration-300"
          />
        </button>

        {open && (
          <div
            className={`absolute z-10 right-0 top-12 w-40 shadow rounded p-2 ${
              theme === "dark"
                ? "bg-gray-800 text-white" // dark background + text
                : "bg-white text-gray-900" // light background + text
            }`}
          >
            <Link href="/dashboard/profile">
              <button
                className={`block w-full text-left px-4 py-2 rounded cursor-pointer ${
                  theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                Profile
              </button>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className={`block w-full text-left px-4 py-2 rounded cursor-pointer ${
                theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
