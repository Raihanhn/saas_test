// pages/auth/login.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import LandingLayout from "@/components/layouts/LandingLayout";

// --- Right panel content (like Signup) ---
const content = {
  1: {
    title: "Welcome Back",
    desc: "Log in to manage clients, projects, and invoices from one powerful dashboard.",
    image: "/signup/hero.jpg", // use the same signup images
  },
};

const schema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErrorMsg("");

    const res = await signIn("credentials", { ...data, redirect: false });

    if (res?.error) {
      setErrorMsg("Invalid credentials");
    } else {
      router.push("/dashboard");
    }

    setLoading(false);
  };

  if (status === "loading" || session)  return (
    <div className="flex items-center justify-center min-h-screen">
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
  );

  const panelData = content[1];

  return (
    <LandingLayout routeKey="login">
    <div className="flex flex-col min-h-screen">

      <main className="flex-1 flex  items-center justify-center px-4 py-10">
  <div className="w-full max-w-7xl flex flex-col lg:flex-row lg:space-x-8 rounded-3xl ">
    {/* LEFT – FORM */}
    <div className="w-full lg:w-1/2 bg-white rounded-3xl shadow-2xl p-10 sm:p-14 flex flex-col justify-center z-10 relative">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome Back</h1>
      <p className="text-gray-600 mb-8">
        Log in to continue managing your clients, projects, and invoices.
      </p>

      {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register("email")}
            placeholder="Email"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            {...register("password")}
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-2 rounded-lg cursor-pointer  transform hover:scale-102 hover:bg-emerald-700 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-4">
        Don’t have an account?{" "}
        <span
          onClick={() => router.push("/auth/register")}
          className="text-emerald-600 cursor-pointer hover:underline cursor-pointer"
        >
          Sign Up
        </span>
      </p>
    </div>

    {/* RIGHT – IMAGE PANEL */}
    <div className="relative hidden lg:flex w-1/2 min-h-[500px] overflow-hidden rounded-3xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={1}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image
            src={panelData.image}
            alt={panelData.title}
            fill
            priority
            className="object-cover rounded-3xl"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/35 rounded-3xl" />

      <div className="relative z-10 flex flex-col justify-center p-12 text-white h-full">
        <h2 className="text-3xl font-bold mb-4">{panelData.title}</h2>
        <p className="text-white/90 max-w-md">{panelData.desc}</p>

        <div className="text-sm text-white/70 mt-auto">
          © {new Date().getFullYear()} Agentic
        </div>
      </div>
    </div>
  </div>
</main>

    </div>
    </LandingLayout>
  );
}
