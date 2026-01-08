import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SignupWizard from "@/components/forms/signup/SignupWizard";
import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";
import LandingLayout from "@/components/layouts/LandingLayout";

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

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

  return (
    <LandingLayout routeKey="register" >
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full py-6 ">
          <SignupWizard />
        </div>
      </main>

    </div>
    </LandingLayout>
  );
}