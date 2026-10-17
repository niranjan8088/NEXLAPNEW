"use client";

import { motion } from "framer-motion";
import {
  Laptop,
  MonitorSmartphone,
  Globe,
  Smartphone,
  Printer,
  Network,
  ShieldCheck,
  FileCog,
  DatabaseBackup,
  Headset,
  LucideIcon,
} from "lucide-react";
import { services } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";

const ICONS: Record<string, LucideIcon> = {
  "laptop-repair": Laptop,
  "desktop-repair": MonitorSmartphone,
  "website-development": Globe,
  "android-app-development": Smartphone,
  "printer-installation": Printer,
  "networking-solutions": Network,
  "antivirus-installation": ShieldCheck,
  amc: FileCog,
  "data-recovery": DatabaseBackup,
  "technical-support": Headset,
};

export default function Services() {
  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Professional Services"
          title="Support That Keeps"
          highlight="Business Moving"
          description="Doorstep and on-call IT services designed to keep your hardware, network, and software running without interruption."
        />

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {services.map((service, i) => {
            const Icon = ICONS[service.id] ?? Laptop;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 5) * 0.07 }}
                className="glass-rog group relative flex flex-col gap-4 p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nex-blue/10 text-nex-blueLight transition-all duration-500 group-hover:bg-nex-blue/20 group-hover:shadow-glow-blue">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-sm font-semibold text-white">
                  {service.title}
                </h3>
                <p className="text-xs leading-relaxed text-nex-mist">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
