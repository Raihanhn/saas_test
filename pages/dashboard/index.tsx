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
  const [dashboardData, setDashboardData] = useState({
  invoiceCount: 0,
  clientsCount: 0,
  projectsCount: 0,
  totalRevenue: 0,
  weeklyRevenue: [] as any[],
});
  const [loading, setLoading] = useState(true);



//   useEffect(() => {
//   if (status !== "authenticated") return;

//   const fetchSummary = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get("/api/dashboard/summary");
//       setDashboardData(res.data);
//     } catch (err) {
//       console.error("Dashboard summary error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchSummary();
// }, [status]);

useEffect(() => {
  if (status !== "authenticated") return;

  let isMounted = true;

  const fetchSummary = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const res = await axios.get("/api/dashboard/summary");
      if (isMounted) setDashboardData(res.data);
    } catch (err) {
      console.error("Dashboard summary error:", err);
    } finally {
      if (isMounted && showLoader) setLoading(false);
    }
  };

  // initial load → show loader
  fetchSummary(true);

  // refetch when tab gains focus → no full-page loader
  const onFocus = () => fetchSummary(false);
  window.addEventListener("focus", onFocus);

  return () => {
    isMounted = false;
    window.removeEventListener("focus", onFocus);
  };
}, [status]);




//   const fetchDashboardData = useCallback(async () => {
//   if (!session?.user) return;

//   setLoading(true);
//   try {
//     const invoiceRes = await axios.get("/api/invoices/count");
//     const revenueRes = await axios.get("/api/dashboard/revenue");

//     let clientsCount = 0;
//     let projectsCount = 0;

//     if ((session.user as any).role === "admin") {
//       const [clientsData, projectsData] = await Promise.all([
//         axios.get("/api/clients"),
//         axios.get("/api/projects"),
//       ]);

//       clientsCount = clientsData.data.clients.length;
//       projectsCount = projectsData.data.projects.length;
//     } else {
//       const res = await axios.get("/api/projects");
//       const clientProjects = res.data.projects.filter(
//         (p: any) => p.clientId?._id === (session.user as any).id
//       );

//       projectsCount = clientProjects.length;
//     }

//     setDashboardData({
//       invoiceCount: invoiceRes.data.total,
//       totalRevenue: revenueRes.data.total,
//       weeklyRevenue: revenueRes.data.weekly,
//       clientsCount,
//       projectsCount,
//     });
//   } catch (err) {
//     console.error("Dashboard error:", err);
//   } finally {
//     setLoading(false);
//   }
// }, [session]);



  // useEffect(() => {
  //   if (status === "authenticated" && loading) {
  //     fetchDashboardData();
  //   }
  // }, [status, fetchDashboardData, loading]);




  if (status === "loading" || loading) {

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
              value={loading ? "..." : dashboardData.clientsCount.toString()}
              change="+4.2%"
            />
            <StatCard
              title="Total Projects"
              value={loading ? "..." : dashboardData.projectsCount.toString()}
              change="+2.1%"
            />
            <StatCard
              title="Total Revenue"
              value={loading ? "..." : `$${dashboardData.totalRevenue.toLocaleString()}`}
              change="+12.5%"
            />
            <StatCard
              title="Total Invoices"
              value={loading ? "..." : dashboardData.invoiceCount.toString()}
              change="+3.1%"
            />
          </div>
        )) || (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Projects"
              value={loading ? "..." : dashboardData.projectsCount.toString()}
              change="+2.1%"
            />
            <StatCard
              title="Total Expense"
              value={loading ? "..." : `$${dashboardData.totalRevenue.toLocaleString()}`}
              change="+12.5%"
            />
            <StatCard
              title="Total Invoices"
              value={loading ? "..." : dashboardData.invoiceCount.toString()}
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
              data={dashboardData.weeklyRevenue}
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
              clientsCount={dashboardData.clientsCount}
              projectsCount={dashboardData.projectsCount}
              totalRevenue={dashboardData.totalRevenue}
              invoiceCount={dashboardData.invoiceCount}
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
