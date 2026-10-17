"use client";

import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { stats, trustBadges } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import Counter from "@/components/ui/Counter";

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nex-blue/30 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Trusted Where It"
          highlight="Matters Most"
          description="Six years of consistent service, genuine components, and after-sales support that businesses actually rely on."
        />

        <div className="mt-16 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-rog p-6 text-center"
            >
              <p className="font-display text-3xl font-bold text-gradient-blue sm:text-4xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-xs text-nex-mist sm:text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3 rounded-2xl glass-panel p-6"
        >
          {trustBadges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-4 py-2 text-xs font-medium text-white/90"
            >
              <BadgeCheck className="h-3.5 w-3.5 text-nex-blueLight" />
              {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
