// pages/dashboard/invoices.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useSession } from "next-auth/react";
import { Download, Search } from "lucide-react";
import Project from "@/modules/projects/project.model";
import { useTheme } from "@/context/ThemeContext";

interface Invoice {
  _id: string;
  clientId?: { _id: string; name: string; email: string };
  projectId?: { _id: string; name: string; price: number };
  paidAt?: string;
}

interface Subscription {
  _id: string;
  plan: string;
  status: string;
  trialEnd?: string;
  currentPeriodEnd?: string;
}

type FilterStatus = "all" | "paid" | "pending";

export default function InvoicesPage() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  const router = useRouter();
  const { theme } = useTheme();
  const [subscriptionInvoices, setSubscriptionInvoices] = useState<
    Subscription[]
  >([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  useEffect(() => {
    if (role === "admin") {
      axios
        .get("/api/subscription-invoices/subscription-invoices")
        .then((res) => {
          setSubscriptionInvoices(res.data.subscriptions);
        });
    }
  }, [role]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const projectId = router.query.projectId as string | undefined;

    const fetchWithRetry = async () => {
      let attempts = 0;
      let data: Invoice[] = [];

      while (attempts < 5) {
        try {
          const res = await axios.get("/api/invoices");
          data = res.data.invoices || [];

          if (
            !projectId ||
            data.some((inv) => inv.projectId?._id === projectId)
          ) {
            break;
          }
        } catch (err) {
          console.error("Failed to fetch invoices", err);
        }

        attempts++;
        await new Promise((r) => setTimeout(r, 500 * attempts));
      }

      setInvoices(data);
      setLoading(false);
    };

    fetchWithRetry();
  }, [status, router.query.projectId]);

  const getStatus = (inv: Invoice) => {
    if (inv.paidAt) return "paid";
    return "pending";
  };

  const latestInvoice = role === "client" ? invoices[0] : null;
  const historyInvoices = role === "client" ? invoices.slice(1) : invoices;

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const statusMatch = filter === "all" || getStatus(inv) === filter;

      const searchMatch =
        inv.clientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        inv.clientId?.email?.toLowerCase().includes(search.toLowerCase()) ||
        inv.projectId?.name?.toLowerCase().includes(search.toLowerCase());

      return statusMatch && searchMatch;
    });
  }, [invoices, filter, search]);

  if (status !== "authenticated") {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full min-h-[300px]">
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full min-h-[300px]">
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

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 min-h-screen   ">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            {role === "admin" ? "All Clients Invoices" : "Invoices"}
          </h1>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              placeholder="Search by name, email..."
              className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          {[
            { key: "all", label: "All" },
            { key: "paid", label: "Paid" },
            { key: "pending", label: "Pending" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as FilterStatus)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium
                ${
                  filter === tab.key
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-700 text-gray-600 hover:bg-gray-600 text-white"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className={`rounded-2xl overflow-hidden
          shadow-sm border
         ${
           theme === "dark"
             ? "bg-gray-800 border-gray-800"
             : "bg-white border-gray-100"
         }
           `}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead
                className={`
              
                 ${theme === "dark" ? "bg-gray-800" : "bg-white"}
                `}
              >
                <tr>
                  <th className="px-6 py-4 text-left">Client</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Project</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Invoice</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((inv) => {
                  const status = getStatus(inv);

                  return (
                    <tr
                      key={inv._id}
                      className={`
                        transition
                        ${
                          theme === "dark"
                            ? "bg-gray-800 hover:bg-gray-700 border-gray-800"
                            : "bg-white hover:bg-gray-50 border-gray-100"
                        }
                        `}
                    >
                      <td className="px-6 py-4 font-medium">
                        {inv.clientId?.name || "N/A"}
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {inv.clientId?.email || "N/A"}
                      </td>

                      <td className="px-6 py-4">
                        {inv.projectId?.name || "N/A"}
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        ${inv.projectId?.price?.toFixed(2) || "0.00"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`
                    inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
                    ${
                      status === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                        >
                          {status === "paid" ? "Paid" : "Pending"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <a
                          href={`/api/invoices/pdf/${inv._id}`}
                          target="_blank"
                          className="
                          inline-flex items-center gap-2
                          rounded-lg bg-emerald-600 px-3 py-1.5
                          text-white text-xs font-medium
                          hover:bg-emerald-700 transition
                        "
                        >
                          <Download className="h-4 w-4" />
                          PDF
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredInvoices.length === 0 && (
              <p className="p-8 text-center text-gray-500">No invoices found</p>
            )}
          </div>
        </div>

        {role === "admin" && subscriptionInvoices.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2
              className={`text-2xl font-semibold
               ${theme === "dark" ? "text-white" : "text-gray-800"}
               `}
            >
              Admin Invoices
            </h2>

            <div
              className={`rounded-2xl shadow-sm border overflow-hidden
             
              ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-800  "
                  : "bg-white border-gray-100"
              }
            `}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead
                    className={`
                  
                  ${theme === "dark" ? "bg-gray-800 " : "bg-white"}
            `}
                  >
                    <tr>
                      <th className="px-6 py-4 text-left">Plan</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Period End</th>
                      <th className="px-6 py-4 text-right">Invoice</th>
                    </tr>
                  </thead>

                  <tbody>
                    {subscriptionInvoices.map((sub) => {
                      const isActive = sub.status === "active";

                      return (
                        <tr
                          key={sub._id}
                          className={`
                    border-t transition
                    ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-800 hover:bg-gray-700 "
                        : "bg-white hover:bg-gray-200  border-gray-100"
                    }`}
                        >
                          <td className="px-6 py-4 font-medium capitalize">
                            {sub.plan}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`
                        inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
                        ${
                          isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-200 text-gray-600"
                        } `}
                            >
                              {sub.status}
                            </span>
                          </td>

                          <td
                            className={`px-6 py-4
                            
                             `}
                          >
                            {sub.currentPeriodEnd
                              ? new Date(
                                  sub.currentPeriodEnd
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <a
                              href={`/api/subscription-invoices/pdf/${sub._id}`}
                              target="_blank"
                              className="
                              inline-flex items-center gap-2
                              rounded-lg bg-emerald-600 px-3 py-1.5
                              text-white text-xs font-medium
                              hover:bg-emerald-700 transition
                            "
                            >
                              <Download className="h-4 w-4" />
                              PDF
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {subscriptionInvoices.length === 0 && (
                  <p className="p-8 text-center text-gray-500">
                    No admin invoices found.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="h-50"></div>
      </div>
    </DashboardLayout>
  );
}
