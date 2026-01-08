"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useTheme } from "@/context/ThemeContext";
import { useSession, signOut } from "next-auth/react";

type Subscription = {
  plan: "free" | "pro" | "enterprise";
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
  status: "trial" | "active" | "canceled" | "past_due";
  trialEnd?: string | null;
  currentPeriodEnd?: string | null;
};

export default function SettingsPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await axios.get("/api/subscription/me");
        setSubscription(res.data.subscription);
      } catch (err) {
        console.error("Failed to load subscription", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleManage = async () => {
    try {
      const res = await axios.post("/api/stripe/manage");
      if (res.data.url) window.location.href = res.data.url;
    } catch {
      alert("Unable to open Stripe portal");
    }
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  if (status === "loading") return null;
  if (session?.user.role !== "admin") return null;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-gray-500">
            Manage your account and subscription
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* ADMIN INFO */}
            <div
              className={`rounded-2xl border p-6
              ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2 className="font-semibold mb-4">Admin Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{session?.user.email}</p>
                </div>

                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="font-medium capitalize">{session?.user.role}</p>
                </div>
              </div>
            </div>

            {/* SUBSCRIPTION */}
            <div
              className={`rounded-2xl border p-6
              ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2 className="font-semibold mb-4">Subscription</h2>

              {loading && (
                <div className="flex justify-center items-center min-h-[200px]">
                  <svg
                    className="animate-spin h-8 w-8 text-emerald-600"
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
              )}

              {!loading && !subscription && (
                <p className="text-gray-500">No active subscription</p>
              )}

              {subscription && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plan</span>
                    <span className="font-medium capitalize">
                      {subscription.plan}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="font-medium capitalize">
                      {subscription.status}
                    </span>
                  </div>

                  {subscription.plan === "free" && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Trial Ends</span>
                      <span>{formatDate(subscription.trialEnd)}</span>
                    </div>
                  )}

                  {subscription.plan !== "free" && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Current Period Ends</span>
                      <span>{formatDate(subscription.currentPeriodEnd)}</span>
                    </div>
                  )}

                  {!!subscription.stripeSubscriptionId && (
                    <button
                      onClick={handleManage}
                      className="mt-5 w-full bg-gradient-to-r cursor-pointer
                        from-emerald-600 to-emerald-500
                        hover:from-emerald-500 hover:to-emerald-600
                        text-white px-4 py-2.5 rounded-xl
                        transition transform hover:scale-[1.02]"
                    >
                      Manage Subscription
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* THEME */}
            <div
              className={`rounded-2xl border p-6
              ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2 className="font-semibold mb-4">Appearance</h2>
              <div className="bg-emerald-600 p-1 rounded-2xl transition transform hover:scale-105 cursor-pointer">
                <DarkModeToggle />
              </div>
            </div>

            {/* LOGOUT */}
            <div
              className={`rounded-2xl border p-6
              ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2 className="font-semibold mb-4">Account</h2>

              <button
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className={`w-full px-4 py-2.5 rounded-xl font-medium cursor-pointer
                ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
