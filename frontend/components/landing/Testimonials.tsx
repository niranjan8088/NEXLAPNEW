"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { testimonials } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
}

export default function Testimonials() {
  const [list, setList] = useState<TestimonialItem[]>(testimonials);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch("/api/reviews?rating=5&limit=8");
        const data = await res.json();
        if (res.ok && data.reviews && data.reviews.length > 0) {
          const mapped: TestimonialItem[] = data.reviews.map((r: any) => ({
            id: r.id,
            name: r.customer_name,
            role: `${r.service_used || r.product_purchased || "Customer"} · ${r.city}`,
            quote: r.review_message,
            rating: r.rating,
          }));
          setList(mapped);
        }
      } catch (err) {
        console.error("Failed to load testimonials, using static fallbacks:", err);
      }
    }
    loadReviews();
  }, []);

  useEffect(() => {
    if (paused || list.length <= 1) return;
    const id = setInterval(() => {
      setIndex((v) => (v + 1) % list.length);
    }, 5500);
    return () => clearInterval(id);
  }, [paused, list.length]);

  const current = list[index] || testimonials[0];

  const go = (dir: 1 | -1) => {
    setIndex((v) => (v + dir + list.length) % list.length);
  };

  return (
    <section id="testimonials" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="What Our Clients"
          highlight="Say About Us"
        />

        <div
          className="relative mt-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="glass-rog relative overflow-hidden p-8 sm:p-12">
            <Quote className="absolute right-6 top-6 h-16 w-16 text-nex-blue/10" />
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="flex gap-1">
                  {Array.from({ length: current.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-nex-blueLight text-nex-blueLight"
                    />
                  ))}
                </div>
                <p className="mt-5 text-base leading-relaxed text-white/90 sm:text-lg">
                  &ldquo;{current.quote}&rdquo;
                </p>
                <div className="mt-6">
                  <p className="font-display text-sm font-semibold text-white">
                    {current.name}
                  </p>
                  <p className="text-xs text-nex-mist">{current.role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              aria-label="Previous testimonial"
              onClick={() => go(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full glass-panel transition-colors hover:border-nex-blue/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {list.map((t, i) => (
                <button
                  key={t.id}
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-nex-blueLight" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
            <button
              aria-label="Next testimonial"
              onClick={() => go(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full glass-panel transition-colors hover:border-nex-blue/50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
