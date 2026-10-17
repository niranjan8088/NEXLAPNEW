"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle, CalendarCheck } from "lucide-react";
import { business } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import { getSafeImageSrc } from "@/lib/utils";

const cards = [
  {
    id: "whatsapp",
    title: "Join Our WhatsApp Channel",
    description: "Get product drops, offers, and service updates straight to WhatsApp.",
    qr: "/images/qr-whatsapp.png",
    href: business.whatsappChannel,
    icon: MessageCircle,
    cta: "Open WhatsApp Channel",
  },
  {
    id: "booking",
    title: "Book a Service Instantly",
    description: "Scan to open our booking form and schedule doorstep service in minutes.",
    qr: "/images/qr-booking.png",
    href: "#",
    icon: CalendarCheck,
    cta: "Open Booking Form",
  },
];

export default function QRSection() {
  return (
    <section id="quote" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-72 -translate-y-1/2 bg-nex-blue/[0.08] blur-[130px]" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Scan &amp; Connect"
          title="One Scan Away From"
          highlight="Faster Service"
          description="Use your phone camera to scan and jump straight into our WhatsApp channel or the service booking form."
        />

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="glass-rog flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left"
            >
              <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white p-2">
                <Image
                  src={getSafeImageSrc(card.qr)}
                  alt={`QR code to ${card.title}`}
                  fill
                  sizes="144px"
                  className="object-contain p-2"
                  loading="lazy"
                />
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-nex-blue to-transparent"
                  animate={{ y: ["0%", "1300%", "0%"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              <div className="flex flex-1 flex-col items-center sm:items-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nex-blue/10 text-nex-blueLight">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-white">
                  {card.title}
                </h3>
                <p className="mt-1.5 text-xs text-nex-mist sm:text-sm">
                  {card.description}
                </p>
                <a
                  href={card.href}
                  target={card.id === "booking" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (card.id === "booking") {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent("nexbyte-open-booking-modal", { detail: { type: "service" } }));
                    }
                  }}
                  className="btn-secondary mt-5 !py-2.5 !px-5 text-xs"
                >
                  {card.cta}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
