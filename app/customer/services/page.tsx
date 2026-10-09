"use client";

import { useState } from "react";
import {
  Laptop,
  Monitor,
  Wifi,
  ShieldCheck,
  Code2,
  HardDrive,
  Cpu,
  Building2,
  ArrowRight,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import UnifiedBookingModal from "@/components/UnifiedBookingModal";

const SERVICES_LIST = [
  {
    id: "laptop-repair",
    title: "Laptop Repair",
    icon: Laptop,
    description: "Screen replacement, battery swap, motherboard chip-level repair, and fan cleaning.",
    badge: "Most Popular",
  },
  {
    id: "desktop-repair",
    title: "Desktop Repair",
    icon: Monitor,
    description: "Power supply troubleshooting, GPU diagnostics, motherboard fixes, and custom assembling.",
    badge: "Same-Day Diagnosis",
  },
  {
    id: "wifi-networking",
    title: "WiFi & Networking",
    icon: Wifi,
    description: "Router setup, Wi-Fi dead-zone fix, structured LAN cabling, and office bandwidth optimization.",
    badge: "Doorstep Service",
  },
  {
    id: "cctv-security",
    title: "CCTV & Security Systems",
    icon: ShieldCheck,
    description: "IP camera installation, DVR/NVR configuration, remote mobile view, and security maintenance.",
    badge: "Complete Setup",
  },
  {
    id: "software-help",
    title: "Software & OS Support",
    icon: Code2,
    description: "Windows/Mac formatting, virus & malware removal, software licensing, and driver setup.",
    badge: "Quick Fix",
  },
  {
    id: "data-recovery",
    title: "Data Recovery",
    icon: HardDrive,
    description: "Deep scan recovery from corrupted hard drives, SSDs, memory cards, and accidental deletions.",
    badge: "High Success Rate",
  },
  {
    id: "hardware-upgrade",
    title: "Hardware Upgrade",
    icon: Cpu,
    description: "NVMe SSD installation, RAM capacity upgrades, liquid cooler setup, and GPU expansion.",
    badge: "Instant Speed Boost",
  },
  {
    id: "business-it",
    title: "Business IT Support",
    icon: Building2,
    description: "Annual Maintenance Contracts (AMC), corporate workstation setup, and dedicated IT technician support.",
    badge: "Enterprise SLA",
  },
];

export default function CustomerServicesPage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");

  const handleBookService = (serviceName: string) => {
    window.dispatchEvent(
      new CustomEvent("nexbyte-open-booking-modal", {
        detail: { prefilledItem: serviceName, tab: "book" },
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E6EAF0] dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-300">
          <Wrench className="h-3.5 w-3.5 text-sky-600" /> NexByte Service Center
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Professional Computer &amp; IT Services
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Book certified computer technicians for hardware repair, upgrades, CCTV installations, and doorstep IT support across Bengaluru and surrounding regions.
        </p>
      </div>

      {/* 8 Service Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SERVICES_LIST.map((svc) => {
          const IconComp = svc.icon;
          return (
            <div
              key={svc.id}
              className="group rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    {svc.badge}
                  </span>
                </div>

                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {svc.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {svc.description}
                </p>
              </div>

              <button
                onClick={() => handleBookService(svc.title)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2.5 shadow-sm transition-colors"
              >
                <span>Book Service</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      <UnifiedBookingModal />
    </div>
  );
}
