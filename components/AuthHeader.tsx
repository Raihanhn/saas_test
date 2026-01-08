// components/AuthHeader.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function AuthHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();

   const isActive = (path: string) => {
    return router.pathname === path;
  };

  const handleLogoClick = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  const handleContactClick = () => {
    const footer = document.getElementById("contact");
    footer?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="w-full py-6 px-4 sm:px-8 flex justify-between items-center bg-white shadow-sm">
      {/* LOGO */}
      <button
        onClick={handleLogoClick}
        className="flex items-center gap-2 font-semibold text-lg"
      >
        <span className="text-emerald-600">◉</span> Agentic
      </button>

      {/* NAV */}
      <nav className="hidden sm:flex gap-6 items-center text-gray-700 text-sm">
        <Link
         href="/"
          className={`relative after:block after:h-0.5 after:bg-emerald-600 after:absolute after:left-0 after:-bottom-1 after:transition-all after:duration-300 ${
            isActive("/") ? "after:w-full" : "after:w-0"
          } hover:text-emerald-600 transition`}
         >
          Home
        </Link>
        <Link
          href="/features"
          className={`relative after:block after:h-0.5 after:bg-emerald-600 after:absolute after:left-0 after:-bottom-1 after:transition-all after:duration-300 ${
            isActive("/features") ? "after:w-full" : "after:w-0"
          } hover:text-emerald-600 transition`}
         >
          Features
        </Link>
        <Link
           href="/pricing"
          className={`relative after:block after:h-0.5 after:bg-emerald-600 after:absolute after:left-0 after:-bottom-1 after:transition-all after:duration-300 ${
            isActive("/pricing") ? "after:w-full" : "after:w-0"
          } hover:text-emerald-600 transition`}
         >
          Pricing
        </Link>
        <button
          onClick={handleContactClick}
          className={`relative hover:text-emerald-600 transition cursor-pointer ${
            isActive("/#contact") ? "after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-emerald-600" : ""
          }`}
        >
          Contact
        </button>

        {status === "loading" ? null : session ? (
          /* LOGGED IN */
          <Link
            href="/dashboard"
            className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm hover:bg-emerald-700 transition"
          >
            Dashboard
          </Link>
        ) : (
          /* NOT LOGGED IN */
          <>
            <Link
              href="/auth/login"
              className={`relative after:block after:h-0.5 after:bg-emerald-600 after:absolute after:left-0 after:-bottom-1 after:transition-all after:duration-300 ${
                isActive("/auth/login") ? "after:w-full" : "after:w-0"
              } hover:text-emerald-600 transition`}
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm transition transform hover:scale-105 hover:bg-emerald-700 transition"
            >
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
