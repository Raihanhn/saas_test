//components/guards/RequireAuth.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // next/navigation is correct for app router
import { useEffect } from "react";

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: ("admin" | "client")[];
  fallback?: React.ReactNode; // optional loader component
}

export default function RequireAuth({
  children,
  roles,
  fallback = null,
}: RequireAuthProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      // Not logged in → redirect to login
      router.replace("/auth/login");
      return;
    }

    if (roles && !roles.includes(session.user.role)) {
      // Role mismatch → redirect to dashboard (or custom page)
      router.replace("/dashboard");
      return;
    }
  }, [status, session, roles, router]);

  // Show loader while checking session
  if (status === "loading") return fallback;

  // If session exists but role doesn't match, we briefly render nothing before redirect
  if (session && roles && !roles.includes(session.user.role)) return fallback;

  if (!session) return fallback;

  return <>{children}</>;
}
