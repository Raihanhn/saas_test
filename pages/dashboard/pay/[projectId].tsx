// pages/dashboard/pay/[projectId].tsx
"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import StripePaymentButton from "@/modules/payments/StripePaymentButton";
import { useRouter } from "next/router"; 
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function PayProjectPage() {
  const router = useRouter();
  const { projectId } = router.query; 
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { data: session, status } = useSession();

useEffect(() => {
  if (status === "unauthenticated") router.push("/login");
}, [status]);

useEffect(() => {
  if (!projectId || !session?.user || !project) return;

  if (session.user.role !== "client") {
    router.push("/dashboard/projects");
    return;
  }

  if (project.clientId?._id !== session.user.id) {
    router.push("/dashboard/projects");
  }
}, [projectId, project, session]);


  useEffect(() => {
    if (!projectId) return; 

    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/projects/${projectId}`);
        setProject(res.data.project);
      } catch (err) {
        console.error("Failed to fetch project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) return <DashboardLayout>
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
  </DashboardLayout>;
  if (!project) return <DashboardLayout>Project not found</DashboardLayout>;

  return (
   <DashboardLayout>
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-indigo-700 p-8 text-white text-center">
            <h1 className="text-3xl font-extrabold">Complete Payment</h1>
            <p className="mt-2 text-indigo-100 opacity-90">Project: {project.name}</p>
            <div className="mt-4 text-4xl font-bold">
              ${project.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="p-8">
            <StripePaymentButton projectId={projectId as string} />
          </div>
        </div>
        
        <button 
          onClick={() => router.back()} 
          className="mt-6 cursor-pointer text-gray-500 hover:text-gray-700 flex items-center justify-center w-full text-sm"
        >
          ← Cancel and go back
        </button>
      </div>
    </div>
  </DashboardLayout>
  );
}
