"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { products } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";

import { getSafeImageSrc } from "@/lib/utils";

export default function ProductShowcase() {
  return (
    <section id="products" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 h-96 bg-nex-blue/[0.06] blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Product Range"
          title="Hardware Built for"
          highlight="Every Workload"
          description="From competitive gaming rigs to enterprise fleets — every product is quality-checked, genuine, and backed by warranty."
        />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, i) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              className="glass-rog group relative flex flex-col overflow-hidden"
            >
              <div className="relative h-44 w-full overflow-hidden border-b border-white/[0.06]">
                <Image
                  src={getSafeImageSrc(product.image)}
                  alt={product.title || "Product"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-contain p-3 opacity-95 transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-nex-ink via-transparent to-transparent" />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-base font-semibold text-white">
                  {product.title}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-nex-mist">
                  {product.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] font-medium text-nex-blueLight/90"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href="#quote"
                  className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-nex-blueLight transition-colors group-hover:text-white"
                >
                  Enquire now
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
