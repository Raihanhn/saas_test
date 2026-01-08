// pages/dashboard/projects.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ProjectForm from "@/modules/projects/ui/ProjectForm";
import ProjectFiles from "@/modules/projects/ui/ProjectFiles";
import { Pencil, Trash2, Users, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  Loader,
  XCircle,
  FileText,
  DollarSign,
  Calendar,
  CalendarCheck,
  AlignLeft,
} from "lucide-react";

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  const { theme } = useTheme();
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingButtonId, setLoadingButtonId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  const CLIENT_AVATARS = [
    "/users/user-1.jpeg",
    "/users/user-2.png",
    "/users/user-3.jpeg",
    "/users/user-4.jpeg",
  ];

  const getClientAvatar = (id: string) => {
    const index =
      id
        ?.split("")
        .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) %
      CLIENT_AVATARS.length;

    return CLIENT_AVATARS[index];
  };

  const STATUS_META: Record<
    string,
    { label: string; color: string; progress: number }
  > = {
    "TO DO": {
      label: "TO DO",
      color: "bg-slate-500",
      progress: 10,
    },
    PLANNING: {
      label: "PLANNING",
      color: "bg-sky-500",
      progress: 25,
    },
    "IN PROGRESS": {
      label: "IN PROGRESS",
      color: "bg-indigo-600",
      progress: 60,
    },
    REVIEW: {
      label: "REVIEW",
      color: "bg-amber-500",
      progress: 80,
    },
    "CHANGES REQUIRED": {
      label: "CHANGES REQUIRED",
      color: "bg-orange-500",
      progress: 70,
    },
    COMPLETE: {
      label: "COMPLETE",
      color: "bg-emerald-600",
      progress: 100,
    },
    CANCELLED: {
      label: "CANCELLED",
      color: "bg-red-600",
      progress: 0,
    },
  };

  const STATUS_COLOR: any = {
    "TO DO": { color: "bg-gray-100 text-gray-700", icon: Clock },
    PLANNING: { color: "bg-blue-100 text-blue-700", icon: Loader },
    "IN PROGRESS": { color: "bg-indigo-100 text-indigo-700", icon: Loader },
    REVIEW: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
    "CHANGES REQUIRED": { color: "bg-orange-100 text-orange-700", icon: Clock },
    COMPLETE: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
    CANCELLED: { color: "bg-red-100 text-red-700", icon: XCircle },
  };

  const fetchClients = async () => {
    if (role !== "admin") return;
    try {
      const res = await axios.get("/api/clients");
      setClients(res.data.clients);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/projects");
      let data = res.data.projects;

      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchClients();
      fetchProjects();
    }
  }, [status]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.clientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.clientId?.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

  const paginatedProjects = filteredProjects.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleEdit = (project: any) => setEditingProject(project);

  const handleDelete = (id: string) => {
    toast(
      (t) => (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span>Are you sure you want to delete this project?</span>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button
              className="bg-linear-to-b from-emerald-600 via-emerald-700 to-emerald-800 text-white px-3 py-1 cursor-pointer rounded hover:opacity-90"
              onClick={async () => {
                try {
                  setLoadingButtonId(id);
                  await axios.delete(`/api/projects/${id}`);
                  if (editingProject?._id === id) setEditingProject(null);
                  fetchProjects();
                  toast.success("Project deleted successfully!");
                  toast.dismiss(t.id);
                } catch (err) {
                  console.error("Error deleting project:", err);
                  toast.error("Failed to delete project.");
                } finally {
                  setLoadingButtonId(null);
                }
              }}
            >
              Yes
            </button>
            <button
              className="bg-gray-300 text-gray-700 px-3 py-1 cursor-pointer rounded hover:opacity-90"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      }
    );
  };

  if (status !== "authenticated") return null;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 h-screen scroll-smooth  ">
        {role === "admin" && (
          <div
            className={`flex flex-col md:flex-row md:items-center gap-4 
              ${theme === "dark" ? "text-white" : "text-gray-900"}
              `}
          >
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search projects, clients, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className={`w-full px-4 py-2.5
                  ${theme === "dark" ? "text-white  " : "text-black "}
                  rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              />
            </div>

            {/* Filters + Create */}
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className={`px-4 py-2.5 rounded-lg border
                  ${theme === "dark" ? "bg-gray-800" : "bg-white"}
                  text-sm`}
              >
                <option value="ALL">All Status</option>
                {Object.keys(STATUS_META).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <Link
                href="/dashboard/projects/new"
                className={`px-5 py-2.5
                 transition transform hover:scale-105 rounded-lg text-white font-semibold
                  ${
                    theme === "dark"
                      ? "bg-gray-800"
                      : "bg-linear-to-b from-emerald-600  via-emerald-700 to-emerald-800"
                  }
                   `}
              >
                Create Project
              </Link>
            </div>
          </div>
        )}

        {role === "admin" && (
          <div
            className={`shadow rounded-xl overflow-x-auto transition-colors ${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-900"
            }`}
          >
            <table className="w-full text-left">
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3 text-right">Actions</th>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center relative">
                      <svg
                        className="animate-spin h-8 w-8 text-emerald-600 mx-auto"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      <span className="text-gray-500 mt-2 block">
                        Loading projects...
                      </span>
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  /* ---------------- EMPTY SEARCH RESULT ---------------- */
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg
                          className="w-10 h-10 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 15.75L19.5 19.5M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                          />
                        </svg>

                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          No projects found
                        </p>

                        <p className="text-xs text-gray-500">
                          Try adjusting your search or filters
                        </p>

                        {(search || statusFilter !== "ALL") && (
                          <button
                            onClick={() => {
                              setSearch("");
                              setStatusFilter("ALL");
                              setPage(1);
                            }}
                            className="mt-2 text-sm text-emerald-600 hover:underline"
                          >
                            Clear search & filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedProjects.map((p) => {
                    const meta = STATUS_META[p.status] || STATUS_META["TO DO"];

                    return (
                      <tr
                        key={p._id}
                        className={`transition-colors border-b last:border-b-0 ${
                          theme === "dark"
                            ? "border-gray-600 hover:bg-gray-700"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={getClientAvatar(p.clientId?._id)}
                              className="h-9 w-9 rounded-full object-cover"
                              alt="client"
                            />
                            <div>
                              <p className="font-semibold capitalize">
                                {p.clientId?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {p.clientId?.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 font-medium capitalize">
                          {p.name}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-semibold text-white rounded-md ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                        </td>

                        <td className="px-4 py-3 w-56">
                          <div
                            className={`text-xs font-semibold mb-1 ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-600"
                            }`}
                          >
                            {meta.progress}%
                          </div>

                          <div className="w-full h-1.5 bg-gray-200 rounded-sm overflow-hidden">
                            <div
                              className={`h-1.5 ${meta.color}`}
                              style={{ width: `${meta.progress}%` }}
                            />
                          </div>
                        </td>

                        <td
                          className={`px-4 py-3 font-semibold ${
                            theme === "dark" ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          ${p.price?.toFixed(2)}
                        </td>

                        <td className="px-4 py-4 text-right">
                          <div className="relative inline-block group">
                            {/* Trigger */}
                            <button className="px-2 py-1 rounded-md  transition">
                              ⋮
                            </button>

                            {/* Dropdown */}
                            <div
                              className={`
                                absolute right-5
                                 top-full -mt-10
                                 flex
                                ${
                                  theme === "dark"
                                    ? "bg-gray-800"
                                    : "bg-white border-gray-200"
                                }
                                 rounded-lg shadow-lg
                                opacity-0 scale-95
                                group-hover:opacity-100 group-hover:scale-100
                                transition-all duration-150 ease-out
                                z-50
                                `}
                            >
                              <Link
                                href={`/dashboard/projects/${p._id}?mode=view`}
                                className={`
                                  flex items-center h-9 px-4
                                  text-sm
                                   ${
                                     theme === "dark"
                                       ? "bg-gray-800"
                                       : "text-gray-700 hover:bg-gray-100"
                                   }
                                  rounded-t-lg
                                `}
                              >
                                View
                              </Link>

                              <Link
                                href={`/dashboard/projects/${p._id}?mode=edit`}
                                className={`
                                  flex items-center h-9 px-4
                                  text-sm
                                  ${
                                    theme === "dark"
                                      ? "bg-gray-800"
                                      : "text-gray-700 hover:bg-gray-100"
                                  }
                                `}
                              >
                                Edit
                              </Link>

                              <button
                                onClick={() => handleDelete(p._id)}
                                className={`
                                  flex items-center h-9 w-full px-4 cursor-pointer
                                  text-sm
                                   ${
                                     theme === "dark"
                                       ? "text-red-600"
                                       : " text-red-600  hover:bg-red-50"
                                   }
                                  rounded-b-lg
                                  `}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 border transition transform hover:scale-105 rounded disabled:opacity-50 cursor-pointer "
                >
                  Previous
                </button>

                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 border rounded transition transform hover:scale-105 cursor-pointer disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {role === "client" && (
          <div className={`
          ${theme === "dark" ? "bg-gray-800" : "bg-white"}
           rounded-2xl shadow-sm  p-6`}>
            <h2 className="text-lg text-white font-semibold mb-6">
              My Projects
            </h2>

            {loading ? (
              <p className="text-white">Loading projects...</p>
            ) : projects.length === 0 ? (
              <p className="text-white">No projects found.</p>
            ) : (
              <div className="space-y-6">
                {projects.map((p) => {
                  const StatusIcon = STATUS_COLOR[p.status]?.icon || Clock;

                  return (
                    <div
                      key={p._id}
                      className={`rounded-2xl border
                        
                         ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
                         shadow-sm hover:shadow-md transition`}
                    >
                      <div className="px-6 py-4 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-linear-to-b from-emerald-600 via-emerald-700 to-emerald-800 text-white">
                            <FileText size={22} />
                          </div>

                          <div>
                            <h3 className={`text-lg font-semibold capitalize
                              ${theme === "dark" ? "text-white" : " text-gray-800"}
                              `}>
                              {p.name}
                            </h3>

                            <div className={`flex items-center gap-2 capitalize font-semibold text-sm
                               
                               ${theme === "dark" ? " text-white" : " text-gray-800"}
                                mt-1`}>
                              <Users size={14} />
                              <span>{p.clientId?.name}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              STATUS_COLOR[p.status]?.color ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            <StatusIcon size={14} />
                            {p.status}
                          </span>

                          <div className={`flex items-center gap-1
                             
                             ${theme === "dark" ? "text-white" : " text-gray-900"}
                              font-semibold`}>
                            <DollarSign size={16} className={`${theme === "dark" ? "text-white" : " text-gray-900"}`} />
                            {p.price?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100" />

                      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 text-sm text-gray-600">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className={`${theme === "dark" ? "text-white" : " text-gray-900"}`} />
                              <span className={`text-sm ${theme === "dark" ? "text-white" : " text-gray-900"}`}>
                                <strong>Start:</strong>{" "}
                                {new Date(p.startDate).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <CalendarCheck size={14} className={`${theme === "dark" ? "text-white" : " text-gray-900"}`} />
                              <span className={`text-sm ${theme === "dark" ? "text-white" : " text-gray-900"}`}>
                                <strong>End:</strong>{" "}
                                {new Date(p.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <AlignLeft
                              size={14}
                              className={` mt-0.5 ${theme === "dark" ? "text-white" : " text-gray-900"} `}
                            />
                            <p className={`${theme === "dark" ? "text-white" : " text-gray-900"}`}>
                              Description: {p.description || "No description provided."}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-start md:justify-end">
                          {p.status === "COMPLETE" &&
                            p.paymentRequest?.paymentStatus === "requested" && (
                              <Link
                                href={`/dashboard/pay/${p._id}`}
                                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition"
                              >
                                Pay Now
                              </Link>
                            )}

                          {p.paymentRequest?.paymentStatus === "paid" && (
                            <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-5 py-2.5 rounded-xl text-sm font-semibold">
                              Paid ✅
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-6 ">
                        <ProjectFiles
                          projectId={p._id}
                          canUpload={p.clientId?._id === userId}
                          isAdmin={role === "admin"}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="h-50"></div>
      </div>
    </DashboardLayout>
  );
}
