//pages/dashboard/projects/new.tsx
"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ProjectForm from "@/modules/projects/ui/ProjectForm";
import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

import toast from "react-hot-toast";

export default function CreateProjectPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    axios.get("/api/auth/session").then((res) => {
      const role = res.data.user?.role || null;
      setUserRole(role);
      if (!res.data.user || role !== "admin") {
        router.push("/dashboard/projects");
      }
    });
  }, [router]);

  const fetchClients = async () => {
    try {
      const res = await axios.get("/api/clients");
      setClients(res.data.clients || []);
    } catch {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-2 space-y-2 h-screen ">
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

        <div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-t-emerald-500 border-gray-200 rounded-full animate-spin"></div>
            </div>
          ) : (
            <ProjectForm
              clients={clients}
              editingProject={null}
              onCreated={() => router.push("/dashboard/projects")}
            />
          )}
        </div>
        <div className="h-50"></div>
      </div>
    </DashboardLayout>
  );
}
