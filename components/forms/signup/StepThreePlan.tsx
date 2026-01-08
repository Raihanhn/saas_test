//components/forms/signup/StepThreePlan.tsx
import { useState } from "react";
import { SignupFormData } from "@/components/forms/signup/types";
import React from "react";

interface Props {
  form: SignupFormData;
  update: (key: keyof SignupFormData, value: any) => void;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0 / month",
    features: [
      "Manage 1 client",
      "Create 1 project",
      "Upload & download files (5MB limit)",
      "View invoices",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49 / month",
    features: [
      "Manage unlimited clients",
      "Create unlimited projects",
      "Upload & download files (1GB limit)",
      "Invoice creation & PDF download",
      "Payment status tracking",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$99 / month",
    features: [
      "All Pro features",
      "Custom roles & permissions",
      "Advanced analytics & reporting",
      "White-label branding",
      "Dedicated account manager",
    ],
  },
];

export default function StepThreePlan({ form, update, validateRef }: Props & { validateRef: React.MutableRefObject<() => boolean> }) {
  const [error, setError] = useState("");

  const validate = (): boolean => {
    if (!form.plan) {
      setError("Please select a plan to continue");
      return false;
    }
    setError("");
    return true;
  };

  validateRef.current = validate;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">
        Choose Your Subscription Plan
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => update("plan", plan.id)}
            className={`cursor-pointer rounded-xl border p-5 shadow-md h-full min-h-[350px]  hover:shadow-lg transition ${
              form.plan === plan.id
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-300 bg-white"
            }`}
          >
            <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
            <p className="text-emerald-500 font-semibold mb-3">{plan.price}</p>
            <ul className="text-sm text-gray-600 space-y-1 mb-3">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✔</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

    </div>
  );
}
