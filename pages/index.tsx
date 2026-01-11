// pages/index.tsx
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Image from "next/image";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return { props: {} };
}

/* ------------------ Animations ------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeUpBig = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen bg-[#e6e6e6] flex items-center justify-center p-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
          className="w-full max-w-7xl  xl:max-w-[1400px]  2xl:max-w-[1500px] bg-white rounded-[28px] p-10"
        >
          {/* Navbar */}
          <motion.header
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-16"
          >
            <div className="flex items-center gap-2 font-semibold text-lg">
              <span className="text-emerald-600">◉</span>
              Agentic
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm text-gray-700">
              <Link href="/" className="hover:text-emerald-600 transition">
                Home
              </Link>
              <Link href="/features" className="hover:text-emerald-600 transition">
                Features
              </Link>
              <Link href="/pricing" className="hover:text-emerald-600 transition">
                Pricing
              </Link>
              <button
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="hover:text-emerald-600 transition cursor-pointer "
              >
                Contact
              </button>
              <Link href="/auth/login" className="hover:text-emerald-600">
                Sign in
              </Link>
              <Link href="/auth/register" className="hover:text-emerald-600">
                Sign up
              </Link>
            </nav>

            <Link href="/auth/register">
              <button
                className="bg-black text-white px-5 py-2 cursor-pointer rounded-full text-sm
                transition transform hover:scale-105 hover:shadow-lg hover:bg-gray-800"
              >
                Get Started
              </button>
            </Link>
          </motion.header>

          {/* Hero Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              variants={staggerChildren}
              className="space-y-4"
            >
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.7 }}
                className="uppercase text-xs tracking-widest text-gray-500 mb-4"
              >
                SaaS Platform
              </motion.p>

              <motion.h1
                variants={fadeUpBig}
                transition={{ duration: 1 }}
                className="text-4xl lg:text-6xl font-bold leading-tight text-gray-900"
              >
                Manage Clients <br />
                Projects &{" "}
                <span className="text-emerald-600">Invoices</span>
                <br />
                Effortlessly
              </motion.h1>

              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-6 text-gray-600 max-w-lg"
              >
                Agentic helps agencies and freelancers manage clients, track
                projects, upload files, and handle invoices — all from a single,
                secure dashboard.
              </motion.p>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="mt-8"
              >
                <Link href="/auth/register">
                  <button
                    className="bg-emerald-600 text-white cursor-pointer px-8 py-3 rounded-full font-medium
                    transition transform hover:scale-105 hover:shadow-lg hover:bg-emerald-700"
                  >
                    Start Free Trial
                  </button>
                </Link>
              </motion.div>

              {/* Tags */}
              <motion.div
                variants={staggerChildren}
                className="flex flex-wrap gap-3 mt-10"
              >
                <Tag text="Client Management" delay={0.1} />
                <Tag text="Project Tracking" delay={0.2} />
                <Tag text="Invoices & Payments" delay={0.3} />
                <Tag text="File Sharing" delay={0.4} />
                <Tag text="Secure Dashboard" delay={0.5} />
              </motion.div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              variants={fadeUpBig}
              transition={{ duration: 1, delay: 0.6 }}
              className="relative"
            >
              <div className="relative w-full h-[460px] rounded-[28px] overflow-hidden">
                <Image
                  src="/landing/hero.jpg"
                  alt="Agentic Dashboard"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>
          </section>
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}

/* ------------------ Tag Component ------------------ */
function Tag({ text, delay }: { text: string; delay?: number }) {
  return (
    <motion.span
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: delay || 0 }}
      className="px-4 py-2 text-sm border border-gray-300 rounded-full text-gray-600"
    >
      {text}
    </motion.span>
  );
}
