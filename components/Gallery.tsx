"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { galleryImages } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import { getSafeImageSrc } from "@/lib/utils";

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="gallery" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Gallery"
          title="Inside the"
          highlight="NexLapTech Experience"
          description="A look at our brand, products, and services — genuine hardware, professionally presented."
        />

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {galleryImages.map((img, i) => (
            <motion.button
              key={img.src + i}
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              onClick={() => setActiveIndex(i)}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]"
            >
              <Image
                src={getSafeImageSrc(img.src)}
                alt={img.alt || "Gallery Image"}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-contain p-3 transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-nex-black/0 opacity-0 transition-all duration-300 group-hover:bg-nex-black/50 group-hover:opacity-100">
                <ZoomIn className="h-6 w-6 text-white" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-nex-black/90 backdrop-blur-md p-6"
            onClick={() => setActiveIndex(null)}
          >
            <button
              aria-label="Close lightbox"
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full glass-panel"
              onClick={() => setActiveIndex(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative h-[70vh] w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={getSafeImageSrc(galleryImages[activeIndex]?.src)}
                alt={galleryImages[activeIndex]?.alt || "Gallery Image"}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
