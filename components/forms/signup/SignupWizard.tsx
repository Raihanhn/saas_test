// components/forms/signup/SignupWizard.tsx
"use client";

import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import SignupRightPanel from "./SignupRightPanel";
import StepOnePersonal from "./StepOnePersonal";
import StepTwoBusiness from "./StepTwoBusiness";
import StepThreePlan from "./StepThreePlan";


import { signupInitialState } from "./initialState";
import { SignupFormData } from "./types";

export default function SignupWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SignupFormData>(signupInitialState);
  const [userId, setUserId] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  const router = useRouter();

  const step1Ref = useRef<() => boolean>(() => true);
  const step2Ref = useRef<() => boolean>(() => true);
  const step3Ref = useRef<() => boolean>(() => true);

  const updateForm = (key: keyof SignupFormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = async () => {
    let isValid = true;
    if (step === 1) isValid = await  step1Ref.current();
    if (step === 2) isValid = await  step2Ref.current();
    if (!isValid) return;

    if (step === 2 && !userId) {
      setStep(3);
      if (!form.plan) form.plan = "free";

      try {
        const formData = new FormData();

        for (const [key, value] of Object.entries(form)) {
          if (value !== null && value !== undefined) {
            if (key === "logo" && value instanceof File) {
              formData.append("logo", value);
            } else {
              formData.append(key, value.toString());
            }
          }
        }
        setRegistering(true);
        const { data } = await axios.post("/api/auth/register", formData);
        setUserId(data.userId);
        setRegistering(false);
      } catch (error: any) {
        alert(error.response?.data?.message || "Error creating user");
        setStep(2); // rollback if failed
      }
    return
    }

    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleFinish = async () => {
    if (!step3Ref.current()) return;
    if (!userId || !form.plan) return alert("Please select a plan");

    try {
      if (form.plan === "free") {
        const res = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (res?.error) {
          alert("Auto login failed. Please login manually.");
          router.push("/auth/login");
        } else {
          router.push("/dashboard");
        }
      } else {
        const { data } = await axios.post("/api/stripe/checkout", {
          userId,
          plan: form.plan,
        });

        if (data.url) window.location.href = data.url;
        else alert("Failed to start Stripe checkout");
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center px-4">
      <div className="w-full ">
        {/* MAIN WRAPPER */}
        <div className="flex flex-col lg:flex-row gap-8 rounded-3xl gap-3  lg:gap-0 ">
          {/* <div className=""></div> */}

          {/* LEFT – FORM */}
          <AnimatePresence mode="wait">

            <motion.div
              key={step} // <-- important: triggers animation when step changes
              initial={{ opacity: 0, x: 50 }} // start slightly to the right and invisible
              animate={{ opacity: 1, x: 0 }} // animate to visible and center
              exit={{ opacity: 0, x: -50 }} // when leaving, slide left and fade
              transition={{ duration: 0.5, ease: "easeInOut" }} // smooth timing
              className={`w-full rounded-3xl px-6 sm:px-10 lg:px-14 py-10 ${
                step === 3 ? "lg:w-full" : "lg:w-1/2"
              }`}
            >
              {/* HEADER */}
              <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome to <span className="text-emerald-600">Agentic</span>
                </h1>
                <p className="text-gray-600 max-w-md">
                  Manage clients, projects, files, and invoices from one
                  powerful dashboard.
                </p>
              </div>

              {/* PROGRESS */}
              <div className="relative flex items-center justify-center mb-10">
                <div className="absolute h-0.5 w-full max-w-xs bg-emerald-200" />
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`z-10 mx-6 h-5 w-5 rounded-full border-2 transition-all duration-300 ${
                      step >= s
                        ? "bg-emerald-600 border-emerald-600"
                        : "bg-white border-emerald-400"
                    }`}
                  />
                ))}
              </div>

              {/* STEPS */}
              {step === 1 && (
                <StepOnePersonal
                  form={form}
                  update={updateForm}
                  validateRef={step1Ref}
                />
              )}
              {step === 2 && (
                <StepTwoBusiness
                  form={form}
                  update={updateForm}
                  validateRef={step2Ref}
                />
              )}
              {step === 3 && (
                <StepThreePlan
                  form={form}
                  update={updateForm}
                  validateRef={step3Ref}
                />
              )}

              {/* ACTIONS */}
              <div className="flex items-center mt-8">
                {step > 1 && (
                  <button
                    onClick={prevStep}
                    className="px-5 py-2 rounded-lg transition transform hover:scale-105 cursor-pointer text-white bg-black hover:bg-gray-800"
                  >
                    Back
                  </button>
                )}

                {step < 3 && (
                  <button
                    onClick={nextStep}
                    className="ml-auto px-6 py-2 transition transform hover:scale-105 cursor-pointer rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Next
                  </button>
                )}

                {step === 3 && (
                 <button
                  onClick={handleFinish}
                  disabled={registering}
                  className={`ml-auto px-6 py-2 rounded-lg text-white cursor-pointer
                    ${registering ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}
                  `}
                >
                  {registering ? "Preparing your account..." : "Finish & Continue"}
                </button>
                )}
              </div>
              {/* Already have an account link */}
              <p className="text-center mt-4 text-gray-500 text-sm">
                Already have an account?{" "}
                <span
                  onClick={() => router.push("/auth/login")}
                  className="text-emerald-700 cursor-pointer hover:underline"
                >
                  Sign in
                </span>
              </p>
            </motion.div>
            {/* </div> */}
          </AnimatePresence>

          {/* RIGHT – VISUAL */}
          {step !== 3 && <SignupRightPanel step={step} />}
        </div>
      </div>
    </div>
  );
}
