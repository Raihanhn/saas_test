"use client";

import { useState, useEffect, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  LinkAuthenticationElement,
  AddressElement,
} from "@stripe/react-stripe-js";
import axios from "axios";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function StripePaymentButton({
  projectId,
}: {
  projectId: string;
}) {
  const [clientSecret, setClientSecret] = useState<string>("");

  useEffect(() => {
    const createIntent = async () => {
      try {
        const res = await axios.post(
          "/api/payments/create-payment-intent",
          { projectId }
        );
        setClientSecret(res.data.clientSecret);
      } catch (err) {
        console.error("Failed to create payment intent", err);
      }
    };

    createIntent();
  }, [projectId]);

  const options = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#4f46e5",
          borderRadius: "12px",
        },
      },
    }),
    [clientSecret]
  );

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        <p className="text-gray-500 animate-pulse">
          Initializing secure checkout...
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm projectId={projectId} />
    </Elements>
  );
}

function CheckoutForm({ projectId }: { projectId: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!stripe || !elements) return;

  setLoading(true);
  setErrorMessage(null);

  const result = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/dashboard/invoices?projectId=${projectId}`,
    },
    redirect: "if_required",
  });

  if (result.error) {
    setErrorMessage(result.error.message || "Payment failed");
    setLoading(false);

    window.location.href = "/dashboard/projects?payment=failed";
    return;
  }

  if (result.paymentIntent?.status === "succeeded") {
    window.location.href = `/dashboard/invoices?projectId=${projectId}`;
  }
};


  return (
    <form onSubmit={handlePay} className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold uppercase mb-3">
          1. Contact Information
        </h3>
        <LinkAuthenticationElement />
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase mb-3">
          2. Billing Address
        </h3>
        <AddressElement options={{ mode: "billing" }} />
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase mb-3">
          3. Payment Method
        </h3>
        <div className="p-4 border rounded-xl bg-gray-50">
          <PaymentElement />
        </div>
      </section>

      {errorMessage && (
        <div className="text-red-600 bg-red-50 p-3 rounded">
          {errorMessage}
        </div>
      )}

      <button
        disabled={loading || !stripe}
        className="w-full bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white font-bold py-4 rounded-xl disabled:opacity-50"
      >
        {loading ? "Processing Payment..." : "Confirm & Pay Now"}
      </button>
    </form>
  );
}
