"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Phone, ArrowUp, CalendarCheck } from "lucide-react";
import { business } from "@/lib/data";

export default function FloatingButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname && (pathname.startsWith("/admin") || pathname.startsWith("/customer"))) {
    return null;
  }


  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            aria-label="Scroll to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex h-11 w-11 items-center justify-center rounded-full glass-panel text-white shadow-glass transition-colors hover:border-nex-blue/50"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <button
        type="button"
        aria-label="Book a service"
        onClick={() => {
          window.dispatchEvent(new CustomEvent("nexbyte-open-booking-modal"));
        }}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-nex-blue text-white shadow-glow-blue transition-transform hover:scale-110 cursor-pointer"
      >
        <CalendarCheck className="h-5 w-5" />
      </button>

      <a
        href={`tel:${business.phoneLinks[0]}`}
        aria-label="Call Nex LapTech"
        className="flex h-11 w-11 items-center justify-center rounded-full glass-panel text-white shadow-glass transition-transform hover:scale-110 hover:border-nex-blue/50"
      >
        <Phone className="h-5 w-5" />
      </a>
    </div>
  );
}
