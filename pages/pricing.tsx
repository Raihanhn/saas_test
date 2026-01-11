// pages/pricing.tsx
import LandingLayout from "@/components/layouts/LandingLayout";
import { motion } from "framer-motion";

const plans = [
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

/* ------------------ Animations ------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeUpBig = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

export default function PricingPage() {
  return (
    <LandingLayout routeKey="pricing">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        {/* Hero */}
        <motion.div
          variants={fadeUp}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.h1
            variants={fadeUpBig}
            transition={{ duration: 1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Pricing Plans
          </motion.h1>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-600 text-lg"
          >
            Flexible pricing for freelancers, agencies, and teams. Choose the
            plan that suits your workflow.
          </motion.p>
        </motion.div>

        {/* Plan Cards */}
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              variants={fadeUp}
              transition={{ duration: 0.8, delay: index * 0.3 }}
              className="flex flex-col rounded-xl border p-6 shadow-lg hover:shadow-2xl transition bg-white"
            >
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-emerald-500 font-semibold text-lg mb-4">
                {plan.price}
              </p>
              <ul className="text-gray-600 text-sm space-y-2 mb-6 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✔</span>
                    {feature}
                  </li>
                ))}
              </ul>
              {/* Button with extra latency */}
              <motion.button
                variants={fadeUp}
                transition={{ duration: 0.8, delay: index * 0.3 + 0.4 }}
                className="w-full bg-emerald-600 text-white py-2 rounded-full font-medium hover:bg-emerald-700 transition transform hover:scale-105 cursor-pointer"
              >
                Choose {plan.name}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* Optional CTA */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-12"
        >
          <p className="text-gray-700 text-lg">
            Need a custom solution for your team?{" "}
            <span className="text-emerald-600 font-semibold cursor-pointer hover:underline">
              Contact Us
            </span>
          </p>
        </motion.div>
      </motion.div>
    </LandingLayout>
  );
}
