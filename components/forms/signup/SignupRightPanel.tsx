"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const content = {
  1: {
    title: "AI-powered agency workspace",
    desc: "Create, track, and deliver client work faster with a unified workflow.",
    image: "/signup/hero.jpg",
  },
  2: {
    title: "Build your professional presence",
    desc: "Set up branding, business details, and operations in minutes.",
    image: "/signup/hero-2.jpg",
  },
  3: {
    title: "Scale without limits",
    desc: "Upgrade anytime as your clients, projects, and revenue grow.",
    image: "/signup/hero-2.jpg",
  },
};

export default function SignupRightPanel({ step }: { step: number }) {
  const data = content[step as 1 | 2 | 3];

  return (
    <div className="relative hidden lg:flex w-1/2 min-h-full rounded-3xl overflow-hidden">

      {/* BACKGROUND IMAGE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image
            src={data.image}
            alt={data.title}
            fill
            priority
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/35" />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
        <div>
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            {data.title}
          </h2>
          <p className="text-white/90 max-w-md">
            {data.desc}
          </p>
        </div>

        <div className="text-sm text-white/70">
          © {new Date().getFullYear()} Agentic
        </div>
      </div>
    </div>
  );
}
