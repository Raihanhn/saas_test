//pages/dashboard/index.tsx
"use client";

import dynamic from "next/dynamic";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback  } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import StatCard from "@/components/dashboard/StatCard";
const RevenueChart = dynamic(() => import("@/components/dashboard/RevenueChart"), { ssr: false });
const OverviewChart = dynamic(() => import("@/components/dashboard/OverviewChart"), { ssr: false });
import { useTheme } from "@/context/ThemeContext";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!session?.user) return;

    setLoading(true);
    try {
      const invoiceRes = await axios.get("/api/invoices/count");
      setInvoiceCount(invoiceRes.data.total);

      const revenueRes = await axios.get("/api/dashboard/revenue");
      setTotalRevenue(revenueRes.data.total);
      setWeeklyRevenue(revenueRes.data.weekly);

      if ((session.user as any).role === "admin") {
        const [clientsData, projectsData] = await Promise.all([
          axios.get("/api/clients"),
          axios.get("/api/projects"),
        ]);

        setClientsCount(clientsData.data.clients.length);
        setProjectsCount(projectsData.data.projects.length);
      } else {
        const res = await axios.get("/api/projects");
        const clientProjects = res.data.projects.filter(
          (p: any) => p.clientId?._id === (session.user as any).id
        );

        setProjectsCount(clientProjects.length);
        setClientsCount(0);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated" && loading) {
      fetchDashboardData();
    }
  }, [status, fetchDashboardData, loading]);

  if (status === "loading" || loading) {
    // Full-page loader
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[70vh]">
         <svg
          className="animate-spin h-12 w-12 text-emerald-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        </div>
      </DashboardLayout>
    );
  }

  if (status !== "authenticated") return null;

  return (
    <DashboardLayout>
      <div className=" relative p-6 space-y-6 h-screen  ">
        {((session.user as any).role === "admin" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Active Clients"
              value={loading ? "..." : clientsCount.toString()}
              change="+4.2%"
            />
            <StatCard
              title="Total Projects"
              value={loading ? "..." : projectsCount.toString()}
              change="+2.1%"
            />
            <StatCard
              title="Total Revenue"
              value={loading ? "..." : `$${totalRevenue.toLocaleString()}`}
              change="+12.5%"
            />
            <StatCard
              title="Total Invoices"
              value={loading ? "..." : invoiceCount.toString()}
              change="+3.1%"
            />
          </div>
        )) || (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Projects"
              value={loading ? "..." : projectsCount.toString()}
              change="+2.1%"
            />
            <StatCard
              title="Total Expense"
              value={loading ? "..." : `$${totalRevenue.toLocaleString()}`}
              change="+12.5%"
            />
            <StatCard
              title="Total Invoices"
              value={loading ? "..." : invoiceCount.toString()}
              change="+3.1%"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div
            className={`lg:col-span-2 rounded-xl p-4 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <RevenueChart
              data={weeklyRevenue}
              type={
                (session.user as any).role === "admin" ? "revenue" : "expense"
              }
            />
          </div>

          <div
            className={`rounded-xl p-4 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <OverviewChart
              clientsCount={clientsCount}
              projectsCount={projectsCount}
              totalRevenue={totalRevenue}
              invoiceCount={invoiceCount}
              type={
                (session.user as any).role === "admin" ? "revenue" : "expense"
              }
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
