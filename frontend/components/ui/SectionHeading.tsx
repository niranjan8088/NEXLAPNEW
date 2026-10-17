"use client";

import { motion } from "framer-motion";

type Props = {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: "center" | "left";
};

export default function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}
    >
      <span className="section-eyebrow justify-center">
        <span className="h-1.5 w-1.5 rounded-full bg-nex-blueLight shadow-glow-blue" />
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem]">
        {title} {highlight && <span className="text-gradient-blue">{highlight}</span>}
      </h2>
      {description && (
        <p className="mt-4 text-sm text-nex-mist sm:text-base">{description}</p>
      )}
    </motion.div>
  );
}
