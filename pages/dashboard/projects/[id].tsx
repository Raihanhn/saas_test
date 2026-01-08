//pages/dashboard/projects/[id].tsx
"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useRouter } from "next/router";
import ProjectForm from "@/modules/projects/ui/ProjectForm";
import ProjectFiles from "@/modules/projects/ui/ProjectFiles";
import { useTheme } from "@/context/ThemeContext";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  Folder,
  Users,
  Calendar,
  CalendarCheck,
  DollarSign,
  Send,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";

import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default function ProjectInnerPage() {
  const router = useRouter();
  const [loadingButtonId, setLoadingButtonId] = useState<string | null>(null);
  const { id, mode } = router.query;
  const [userRole, setUserRole] = useState<string | null>(null);
  const { theme } = useTheme();

  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [project, setProject] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/auth/session").then((res) => {
      const role = res.data.user?.role || null;
      setUserRole(role);
      if (!res.data.user) router.push("/login");
      // Block client from edit mode
      if (role === "client" && mode === "edit")
        router.push("/dashboard/projects");
    });
  }, [mode, router]);

  const fetchProject = async () => {
    try {
      const res = await axios.get(`/api/projects/${id}`);
      setProject(res.data.project);
    } catch (err: any) {
      if (err.response?.status === 403) toast.error("Access denied");
      else toast.error("Failed to load project");
      router.push("/dashboard/projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get(`/api/clients`);
      setClients(res.data.clients || []);
    } catch {
      toast.error("Failed to load clients");
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchProject();
    fetchClients();
  }, [id]);

  if (loading) {
    return (
     <DashboardLayout>
  <div className="flex items-center justify-center min-h-[80vh]">
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

  if (!project) return null;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 h-screen  scroll-smooth">
        <button
          onClick={() => router.push("/dashboard/projects")}
          className={`mb-4 cursor-pointer px-4 py-2 rounded flex items-center gap-2 transition-colors ${
            theme === "dark"
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-gray-200 text-gray-900 hover:bg-gray-300"
          }`}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {isView && project && (
          <div
            className={`max-w-6xl mx-auto rounded-2xl border shadow-sm overflow-hidden transition-colors ${
              theme === "dark"
                ? "bg-gray-700 border-gray-800 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            {/* Header */}
            <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                  <Image
                    src="/users/user-1.jpeg"
                    alt="User"
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold capitalize">
                    {project.name}
                  </h2>
                  <p
                    className={`text-sm mt-1 line-clamp-2 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {project.description || "No description provided"}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium w-fit ${
                  project.status === "COMPLETE"
                    ? "bg-emerald-100 text-emerald-700"
                    : project.status === "IN PROGRESS"
                    ? "bg-blue-100 text-blue-700"
                    : project.status === "CANCELLED"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                {project.status}
              </span>
            </div>

            {/* <div className={theme === "dark" ? "border-t border-gray-800" : "border-t"} /> */}

            {/* Info Grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Client */}
              <div className="flex gap-3">
                <Users className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs uppercase text-gray-500">Client</p>
                  <p className="text-sm font-medium capitalize">
                    {project.clientId?.name}
                  </p>
                </div>
              </div>

              {/* Start Date */}
              <div className="flex gap-3">
                <Calendar className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs uppercase text-gray-500">Start Date</p>
                  <p className="text-sm">
                    {new Date(project.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* End Date */}
              <div className="flex gap-3">
                <CalendarCheck className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs uppercase text-gray-500">End Date</p>
                  <p className="text-sm">
                    {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Budget */}
              <div className="flex gap-3">
                <DollarSign className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs uppercase text-gray-500">Budget</p>
                  <p className="text-sm font-semibold text-emerald-600">
                    ${project.price?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* <div className={theme === "dark" ? "border-t border-gray-800" : "border-t"} /> */}

            <div className="p-6 flex flex-wrap gap-4 items-center">
              {project.status === "COMPLETE" &&
                project.paymentRequest?.paymentStatus === "none" && (
                  <button
                    onClick={async () => {
                      setLoadingButtonId(project._id);
                      try {
                        await axios.post("/api/payments/send-request", {
                          projectId: project._id,
                        });
                        toast.success("Payment request sent");
                        fetchProject();
                      } catch {
                        toast.error("Failed to send payment request");
                      } finally {
                        setLoadingButtonId(null);
                      }
                    }}
                    disabled={loadingButtonId === project._id}
                    className="inline-flex items-center cursor-pointer transition transform hover:scale-105 gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium "
                  >
                    {loadingButtonId === project._id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    Send Payment Request
                  </button>
                )}

              {project.paymentRequest?.paymentStatus === "requested" && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-100 text-yellow-700 text-sm font-medium">
                  <Clock size={16} />
                  Payment Requested
                </span>
              )}

              {project.paymentRequest?.paymentStatus === "paid" && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium">
                  <CheckCircle size={16} />
                  Payment Completed
                </span>
              )}
            </div>

            {/* Files */}
            <div className="p-4">
              <ProjectFiles
                projectId={project._id}
                canUpload={true}
                isAdmin={true}
              />
            </div>

            {/* <div className={theme === "dark" ? "border-t border-gray-800" : "border-t"} /> */}

            {/* Actions */}
          </div>
        )}

        {isEdit && project && (
          <div
          // className={`shadow rounded-xl p-6 space-y-6 transition-colors ${
          //   theme === "dark"
          //     ? "bg-gray-800 text-white"
          //     : "bg-white text-gray-900"
          // }`}
          >
            <ProjectForm
              editingProject={project}
              onUpdated={() => router.push("/dashboard/projects")}
              clients={clients}
            />
            <div
              className={`mt-6 p-4 rounded-xl shadow-md space-y-4 w-full max-w-3xl mx-auto ${
                theme === "dark"
                  ? "bg-gray-800 text-gray-200"
                  : "bg-white text-gray-900"
              }`}
            >
              <ProjectFiles
                projectId={project._id}
                canUpload={true}
                isAdmin={true}
              />
            </div>
          </div>
        )}

        <div className="h-50"></div>
      </div>
    </DashboardLayout>
  );
}
