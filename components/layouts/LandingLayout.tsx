// components/layouts/LandingLayout.tsx
"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthHeader from "@/components/AuthHeader";
import Footer from "@/components/Footer";

export default function LandingLayout({
  children,
  routeKey,
}: {
  children: ReactNode;
  routeKey: string;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AuthHeader />

      <AnimatePresence mode="wait">
        <motion.main
          key={routeKey}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1], // very smooth
          }}
          className="flex-1"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  );
}
