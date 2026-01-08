//components/Footer.tsx
"use client";

import { useEffect, useState } from "react";
import { Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer  id="contact" className="bg-[#0F172A] text-white border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col items-center justify-center gap-2">
        <div className="text-sm text-white/80">
          &copy; {currentYear ?? ""}{" "}
          <span className="font-semibold">Agentic</span>. All rights reserved.
        </div>

        <div className="flex gap-4">
          <a
            href="https://instagram.com/yourorg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition"
          >
            <Instagram size={20} />
          </a>
          <a
            href="https://facebook.com/yourorg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition"
          >
            <Facebook size={20} />
          </a>
          <a
            href="https://twitter.com/yourorg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition"
          >
            <Twitter size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
