// pages/stripe/success.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function StripeSuccess() {
  const router = useRouter();
  const { session_id } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !session_id) return;

    const finalizeAndLogin = async () => {
      try {
        const res = await fetch("/api/stripe/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: session_id }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Stripe finalize failed");
        }

        const token = data.token;
        if (!token) {
          throw new Error("Login token not received");
        }

        console.log(" Auto-login token received:", token);
        const result = await signIn("token-login", {
          token,
          redirect: true,
          callbackUrl: "/dashboard",
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        console.log(" User auto-logged in successfully");

      } catch (err) {
        console.error("Auto-login error:", err);
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    finalizeAndLogin();
  }, [router.isReady, session_id]);

  return (
    <div className="min-h-screen  items-center justify-center bg-gray-50">
      {loading && (
         <>
          {/* Next.js Image component for GIF */}
          <div className="relative w-64 h-64 mb-6">
            <Image
              src="/agentic.gif"
              alt="Loading..."
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <p className="text-lg text-gray-700 text-center">
            Finalizing your subscription...
          </p>
        </>
      )}
    </div>
  );
}
