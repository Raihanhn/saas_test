// pages/features.tsx
import LandingLayout from "@/components/layouts/LandingLayout";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Users,
  Folder,
  FileText,
  CreditCard,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

/* ------------------ Animation Variants ------------------ */
const textFade = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const cardFade = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

/* ------------------ Features Data ------------------ */
const features = [
  {
    title: "Client Management",
    description:
      "Create, organize, and manage all your clients from a single dashboard with role-based access.",
    icon: Users,
  },
  {
    title: "Project Tracking",
    description:
      "Track project progress, deadlines, and statuses in real-time to keep everything on schedule.",
    icon: BarChart3,
  },
  {
    title: "File Storage & Sharing",
    description:
      "Securely upload, store, and download project files with easy access for both admins and clients.",
    icon: Folder,
  },
  {
    title: "Invoice Generation",
    description:
      "Create professional invoices, download PDFs, and share them instantly with your clients.",
    icon: FileText,
  },
  {
    title: "Payment Status Tracking",
    description:
      "Mark invoices as paid or pending and maintain a clear financial overview at all times.",
    icon: CreditCard,
  },
  {
    title: "Secure & Private",
    description:
      "Built with strong security practices to keep your business data protected and private.",
    icon: ShieldCheck,
  },
];

export default function FeaturesPage() {
  return (
    <LandingLayout routeKey="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* ---------------- Hero Section ---------------- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          variants={stagger}
          className="text-center max-w-3xl mx-auto mb-24"
        >
          <motion.h1
            variants={textFade}
            transition={{ duration: 1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Powerful Features to Run Your Agency
          </motion.h1>

          <motion.p
            variants={textFade}
            transition={{ duration: 1, delay: 0.15 }}
            className="text-gray-600 text-lg"
          >
            Agentic gives freelancers and agencies everything they need to manage
            clients, projects, files, and invoices — all in one secure platform.
          </motion.p>
        </motion.div>

        {/* ---------------- Feature Cards ---------------- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardFade}
                transition={{
                  duration: 0.9,
                  delay: index * 0.15,
                  ease: "easeOut",
                }}
                className="bg-white rounded-2xl border p-6 shadow-md hover:shadow-2xl transition group"
              >
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={textFade}
                  transition={{ duration: 0.8 }}
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 mb-4"
                >
                  <Icon size={22} />
                </motion.div>

                <motion.h3
                  variants={textFade}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-lg font-semibold text-gray-900 mb-2"
                >
                  {feature.title}
                </motion.h3>

                <motion.p
                  variants={textFade}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-gray-600 text-sm leading-relaxed"
                >
                  {feature.description}
                </motion.p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ---------------- Trust / Security Section ---------------- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          variants={stagger}
          className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              title: "Bank-Grade Security",
              text: "Your data is encrypted at rest and in transit using industry-standard security practices.",
            },
            {
              title: "Privacy-First Platform",
              text: "We never sell your data. Your business and client information stays fully private.",
            },
            {
              title: "Compliance Ready",
              text: "Designed with best practices to support GDPR-friendly and compliant workflows.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={cardFade}
              transition={{
                duration: 1,
                delay: i * 0.2,
              }}
              className="bg-white rounded-2xl border p-6 shadow-md hover:shadow-xl transition"
            >
              <motion.h4
                variants={textFade}
                transition={{ duration: 0.8 }}
                className="text-lg font-semibold text-gray-900 mb-2"
              >
                {item.title}
              </motion.h4>
              <motion.p
                variants={textFade}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="text-gray-600 text-sm"
              >
                {item.text}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>

        {/* ---------------- CTA ---------------- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mt-28"
        >
          <motion.p
            variants={textFade}
            transition={{ duration: 0.9 }}
            className="text-lg text-gray-700 mb-6"
          >
            Ready to simplify your workflow?
          </motion.p>

           <Link href="/auth/register">
          <motion.button
            variants={textFade}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="bg-emerald-600 cursor-pointer text-white px-8 py-3 rounded-full font-medium hover:bg-emerald-700 transition transform hover:scale-105"
          >
            Get Started with Agentic
          </motion.button>
          </Link>
        </motion.div>
      </div>
    </LandingLayout>
  );
}
