"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, Send, Star } from "lucide-react";
import StarRating from "@/components/ui/StarRating";
import { services } from "@/lib/data";

export default function BookServiceReviewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Prompt, 2: Review Form, 3: Success

  // Form State
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [recommend, setRecommend] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleTrigger = () => {
      // Delay slightly so the new tab opens first without obstruction
      setTimeout(() => {
        setIsOpen(true);
        setStep(1);
      }, 800);
    };

    window.addEventListener("nexbyte-booking-triggered", handleTrigger);
    return () => {
      window.removeEventListener("nexbyte-booking-triggered", handleTrigger);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Reset form states
    setName("");
    setCity("");
    setService("");
    setMessage("");
    setRating(5);
    setRecommend(true);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErrorMsg("Name is required.");
    if (!city.trim()) return setErrorMsg("City is required.");
    if (!message.trim()) return setErrorMsg("Review message is required.");
    if (rating < 1 || rating > 5) return setErrorMsg("Rating must be between 1 and 5.");

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: name,
          city,
          service_used: service || null,
          rating,
          review_message: message,
          recommend,
          verified: true,
          source: "post_service_popup",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review.");
      }

      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="glass-panel relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-nex-ink p-6 shadow-glow-blue sm:p-8"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Step 1: Thank You & Invite */}
            {step === 1 && (
              <div className="text-center py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-nex-blue/10 text-nex-blueLight mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                  Thank You for Choosing Us!
                </h3>
                <p className="mt-3 text-sm text-nex-mist leading-relaxed">
                  Your booking form has opened. While you wait, would you mind sharing your feedback or rating your previous experience with NexLapTech? It helps us serve you better!
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    onClick={() => setStep(2)}
                    className="btn-primary w-full sm:w-auto px-8"
                  >
                    Rate Us Now
                  </button>
                  <button
                    onClick={handleClose}
                    className="btn-secondary w-full sm:w-auto"
                  >
                    No Thanks
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Feedback Form */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center sm:text-left">
                  <h3 className="font-display text-lg font-bold text-white sm:text-xl">
                    Share Your Feedback
                  </h3>
                  <p className="text-xs text-nex-mist mt-1">
                    Your response helps us maintain our quality service standards.
                  </p>
                </div>

                {errorMsg && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/80">
                    How would you rate your experience? *
                  </label>
                  <div className="py-1">
                    <StarRating rating={rating} onChange={setRating} size="lg" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="modal-name" className="text-xs font-semibold text-white/80">
                      Your Name *
                    </label>
                    <input
                      id="modal-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-nex-blue/50 focus:outline-none focus:ring-1 focus:ring-nex-blue/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="modal-city" className="text-xs font-semibold text-white/80">
                      Your City *
                    </label>
                    <input
                      id="modal-city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-nex-blue/50 focus:outline-none focus:ring-1 focus:ring-nex-blue/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="modal-service" className="text-xs font-semibold text-white/80">
                    Service Requested
                  </label>
                  <select
                    id="modal-service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full rounded-xl bg-nex-ink border border-white/[0.08] px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-nex-blue/50 focus:outline-none focus:ring-1 focus:ring-nex-blue/30"
                  >
                    <option value="" className="bg-nex-ink text-white">Select a service</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.title} className="bg-nex-ink text-white">
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="modal-message" className="text-xs font-semibold text-white/80">
                    Review Message * <span className="text-[10px] text-nex-mist">({message.length}/1000)</span>
                  </label>
                  <textarea
                    id="modal-message"
                    required
                    maxLength={1000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your service experience, quality of work, and support..."
                    rows={3}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-nex-blue/50 focus:outline-none focus:ring-1 focus:ring-nex-blue/30 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    id="modal-recommend"
                    type="checkbox"
                    checked={recommend}
                    onChange={(e) => setRecommend(e.target.checked)}
                    className="h-4 w-4 rounded border-white/[0.08] bg-white/[0.04] text-nex-blue focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="modal-recommend" className="text-xs text-white/80 cursor-pointer select-none">
                    Yes, I recommend NexLapTech
                  </label>
                </div>

                <div className="pt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                    className="btn-secondary py-2 px-5 text-xs order-2 sm:order-1"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary py-2 px-5 text-xs flex items-center justify-center gap-1.5 order-1 sm:order-2"
                  >
                    {isSubmitting ? (
                      <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Submit Review
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success Confirmation */}
            {step === 3 && (
              <div className="text-center py-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400 mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">
                  Review Submitted!
                </h3>
                <p className="mt-3 text-sm text-nex-mist leading-relaxed">
                  Thank you! Your feedback has been logged. Since this request was tied to an active booking, it is pre-verified and will be showcased on our site once our team reviews it.
                </p>
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleClose}
                    className="btn-primary px-8"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
