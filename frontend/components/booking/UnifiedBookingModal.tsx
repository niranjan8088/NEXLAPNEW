"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  CheckCircle,
  Send,
  Calendar,
  Search,
  MessageSquare,
  Clock,
  Phone,
  Mail,
  User,
  ArrowRight,
  Clipboard,
  Check,
  Building,
  Smartphone,
  ChevronRight
} from "lucide-react";
import { services, products, business } from "@/lib/data";
import { dbHelper } from "@/lib/dbHelper";
import { realtimeSync } from "@/lib/realtimeSync";
import { safeJsonFetch } from "@/lib/apiHelper";

const STATUS_STEPS = [
  { value: "new", label: "New Enquiry", color: "text-blue-400 bg-blue-500/10 border-blue-500/25" },
  { value: "contacted", label: "Contacted", color: "text-amber-400 bg-amber-500/10 border-amber-500/25" },
  { value: "quoted", label: "Quotation Sent", color: "text-purple-400 bg-purple-500/10 border-purple-500/25" },
  { value: "waiting", label: "Awaiting Conf.", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25" },
  { value: "confirmed", label: "Confirmed", color: "text-green-400 bg-green-500/10 border-green-500/25" },
  { value: "delivered", label: "Delivered", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" },
  { value: "completed", label: "Completed", color: "text-teal-400 bg-teal-500/10 border-teal-500/25" },
  { value: "cancelled", label: "Cancelled", color: "text-red-400 bg-red-500/10 border-red-500/25" },
];

export default function UnifiedBookingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"book" | "track">("book");

  // Booking Form State
  const [name, setName] = useState("");
  const [phoneVal, setPhoneVal] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [addressVal, setAddressVal] = useState("");
  const [cityVal, setCityVal] = useState("Bengaluru");
  const [stateVal, setStateVal] = useState("Karnataka");
  const [pincodeVal, setPincodeVal] = useState("560001");
  const [requestItem, setRequestItem] = useState("");
  const [configVal, setConfigVal] = useState("Standard");
  const [quantityVal, setQuantityVal] = useState(1);
  const [preferredDateVal, setPreferredDateVal] = useState(new Date().toISOString().split("T")[0]);
  const [preferredTimeVal, setPreferredTimeVal] = useState("10:30 AM");
  const [budgetVal, setBudgetVal] = useState("Standard");
  const [messageVal, setMessageVal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // Tracking State
  const [trackId, setTrackId] = useState("");
  const [trackPhone, setTrackPhone] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackedBooking, setTrackedBooking] = useState<any | null>(null);
  const [trackError, setTrackError] = useState("");

  // Chat State
  const [chatMessage, setChatMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.prefilledItem) {
        setRequestItem(customEvent.detail.prefilledItem);
      }
      if (customEvent.detail?.tab) {
        setActiveTab(customEvent.detail.tab);
      } else {
        setActiveTab("book");
      }
      if (customEvent.detail?.bookingId && customEvent.detail?.phone) {
        setTrackId(customEvent.detail.bookingId);
        setTrackPhone(customEvent.detail.phone);
        setTrackLoading(true);
        setTrackError("");
        safeJsonFetch(`/api/bookings?phone=${encodeURIComponent(customEvent.detail.phone)}&bookingId=${encodeURIComponent(customEvent.detail.bookingId)}`)
          .then((res) => {
            if (res.ok && res.data?.success && res.data?.booking) {
              setTrackedBooking(res.data.booking);
            } else {
              setTrackError(res.error || "Booking not found.");
            }
            setTrackLoading(false);
          }).catch(() => {
            setTrackError("Failed to fetch booking.");
            setTrackLoading(false);
          });
      } else {
        setTrackedBooking(null);
      }
      setIsOpen(true);
      setBookingSuccess(false);
      setCreatedBooking(null);
      setErrorMsg("");
    };

    window.addEventListener("nexbyte-open-booking-modal", handleOpen);
    return () => window.removeEventListener("nexbyte-open-booking-modal", handleOpen);
  }, []);

  // Sync tracked booking state when realtime sync triggers
  useEffect(() => {
    if (!isOpen || !trackedBooking) return;
    const handleRealtime = async () => {
      try {
        const res = await safeJsonFetch(`/api/bookings?phone=${encodeURIComponent(trackPhone)}&bookingId=${encodeURIComponent(trackId)}`);
        if (res.ok && res.data?.success && res.data?.booking) {
          setTrackedBooking(res.data.booking);
        }
      } catch {}
    };

    window.addEventListener("nexbyte-realtime", handleRealtime);
    return () => window.removeEventListener("nexbyte-realtime", handleRealtime);
  }, [isOpen, trackedBooking, trackId, trackPhone]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [trackedBooking?.timeline]);

  const handleClose = () => {
    setIsOpen(false);
    setBookingSuccess(false);
    setCreatedBooking(null);
    setErrorMsg("");
    setTrackError("");
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErrorMsg("Name is required.");
    if (!phoneVal.trim()) return setErrorMsg("Phone is required.");
    if (!requestItem) return setErrorMsg("Please select a service or product.");

    console.log("Form Submitted", { name, phoneVal, requestItem });
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      console.log("API Called", "/api/bookings");
      const res = await safeJsonFetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          phone: phoneVal,
          email: emailVal,
          address: addressVal,
          city: cityVal,
          state: stateVal,
          pincode: pincodeVal,
          requestType: services.some(s => s.title === requestItem) ? "service" : "product",
          selectedItem: requestItem,
          configuration: configVal,
          quantity: quantityVal,
          preferredDate: preferredDateVal,
          preferredTime: preferredTimeVal,
          description: messageVal,
          remarks: messageVal,
          budget: budgetVal,
        }),
      });

      if (res.status === 401) {
        const next = `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/customer/signin?next=${encodeURIComponent(next)}`);
        return;
      }
      if (!res.ok || !res.data?.success) {
        throw new Error(res.error || "Failed to submit booking.");
      }

      setCreatedBooking(res.data.booking || { bookingId: res.data.bookingId, phone: phoneVal });
      setBookingSuccess(true);
      // Reset form
      setName("");
      setPhoneVal("");
      setEmailVal("");
      setMessageVal("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId.trim() || !trackPhone.trim()) {
      setTrackError("Please enter both Reference ID and Phone.");
      return;
    }

    setTrackLoading(true);
    setTrackError("");
    setTrackedBooking(null);

    try {
      const res = await safeJsonFetch(`/api/bookings?phone=${encodeURIComponent(trackPhone)}&bookingId=${encodeURIComponent(trackId)}`);

      if (!res.ok || !res.data?.success) {
        setTrackError(res.error || "No matching booking found. Verify ID format and Phone.");
      } else {
        setTrackedBooking(res.data.booking);
      }
    } catch (err) {
      setTrackError("Failed to retrieve booking status.");
    } finally {
      setTrackLoading(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !trackedBooking) return;

    setSendingChat(true);
    try {
      const res = await safeJsonFetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: trackedBooking.id,
          chatMessage: chatMessage.trim(),
        }),
      });

      if (res.status === 401) {
        const next = `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/customer/signin?next=${encodeURIComponent(next)}`);
        return;
      }
      if (!res.ok || !res.data?.success) throw new Error(res.error || "Failed to send message.");

      setTrackedBooking(res.data.booking);
      setChatMessage("");
      // Trigger realtime Sync event locally
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("nexbyte-realtime"));
      }
    } catch (err: any) {
      alert(err.message || "Failed to send message.");
    } finally {
      setSendingChat(false);
    }
  };

  const handleCopyId = () => {
    if (!createdBooking) return;
    navigator.clipboard.writeText(createdBooking.bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusConfig = (val: string) => {
    return STATUS_STEPS.find((s) => s.value === val) || STATUS_STEPS[0];
  };

  const chatMessages = trackedBooking?.timeline?.filter((t: any) => t.type === "chat") || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass-panel relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-nex-ink shadow-glow-blue flex flex-col max-h-[90vh]"
          >
            {/* Header with tabs */}
            <div className="flex justify-between items-center px-6 pt-5 pb-3 border-b border-white/5 shrink-0">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setActiveTab("book");
                    setTrackedBooking(null);
                  }}
                  className={`font-display text-sm font-bold pb-2 border-b-2 transition-all ${
                    activeTab === "book"
                      ? "border-nex-blue text-white"
                      : "border-transparent text-nex-mist hover:text-white"
                  }`}
                >
                  New Request
                </button>
                <button
                  onClick={() => setActiveTab("track")}
                  className={`font-display text-sm font-bold pb-2 border-b-2 transition-all ${
                    activeTab === "track"
                      ? "border-nex-blue text-white"
                      : "border-transparent text-nex-mist hover:text-white"
                  }`}
                >
                  Track Live / Chat
                </button>
              </div>
              <button
                onClick={handleClose}
                className="text-white/50 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {/* BOOK TAB */}
              {activeTab === "book" && (
                <>
                  {bookingSuccess && createdBooking ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400 mb-2">
                        <CheckCircle className="h-8 w-8" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-white">
                        Booking Request Received!
                      </h3>
                      <p className="text-xs text-nex-mist max-w-md mx-auto leading-relaxed">
                        Your request has been successfully created. Please write down your sequential Reference ID to track this request live.
                      </p>

                      <div className="flex items-center justify-center gap-2 max-w-sm mx-auto p-3 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-sm font-bold text-nex-blueLight">
                        <span>{createdBooking.bookingId}</span>
                        <button
                          onClick={handleCopyId}
                          className="p-1 hover:text-white transition-colors ml-auto"
                          title="Copy ID"
                        >
                          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Clipboard className="h-4 w-4" />}
                        </button>
                      </div>

                      <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                        <button
                          onClick={() => {
                            setTrackId(createdBooking.bookingId);
                            setTrackPhone(createdBooking.phone);
                            setTrackedBooking(createdBooking);
                            setActiveTab("track");
                          }}
                          className="btn-primary py-2 px-6 text-xs flex items-center justify-center gap-1"
                        >
                          <span>Track Live Details</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={handleClose} className="btn-secondary py-2 px-6 text-xs">
                          Close Window
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleBookSubmit} className="space-y-4 text-left">
                      {errorMsg && (
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400 font-semibold">
                          {errorMsg}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="modal-book-name" className="text-xs font-semibold text-white/80 flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-nex-blueLight" /> Full Name *
                          </label>
                          <input
                            id="modal-book-name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Ramesh Kumar"
                            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="modal-book-phone" className="text-xs font-semibold text-white/80 flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5 text-nex-blueLight" /> Phone Number *
                          </label>
                          <input
                            id="modal-book-phone"
                            type="tel"
                            required
                            value={phoneVal}
                            onChange={(e) => setPhoneVal(e.target.value)}
                            placeholder="e.g. 9876543210"
                            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="modal-book-email" className="text-xs font-semibold text-white/80 flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-nex-blueLight" /> Email (Optional)
                          </label>
                          <input
                            id="modal-book-email"
                            type="email"
                            value={emailVal}
                            onChange={(e) => setEmailVal(e.target.value)}
                            placeholder="e.g. ramesh@gmail.com"
                            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="modal-book-city" className="text-xs font-semibold text-white/80 flex items-center gap-1">
                            <Building className="h-3.5 w-3.5 text-nex-blueLight" /> Select Branch / City *
                          </label>
                          <select
                            id="modal-book-city"
                            value={cityVal}
                            onChange={(e) => setCityVal(e.target.value)}
                            className="w-full rounded-xl bg-nex-ink border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                          >
                            {business.branches.map((b) => (
                              <option key={b.name} value={b.name} className="bg-nex-ink text-white">
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="modal-book-item" className="text-xs font-semibold text-white/80">
                            Service / Product Interested *
                          </label>
                          <select
                            id="modal-book-item"
                            required
                            value={requestItem}
                            onChange={(e) => setRequestItem(e.target.value)}
                            className="w-full rounded-xl bg-nex-ink border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                          >
                            <option value="" className="bg-nex-ink text-white">Select option...</option>
                            <optgroup label="IT Services" className="bg-nex-ink text-white/50">
                              {services.map((s) => (
                                <option key={s.id} value={s.title} className="bg-nex-ink text-white">
                                  {s.title}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Hardware Products" className="bg-nex-ink text-white/50">
                              {products.map((p) => (
                                <option key={p.id} value={p.title} className="bg-nex-ink text-white">
                                  {p.title}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="modal-book-budget" className="text-xs font-semibold text-white/80">
                            Approx Budget (Optional)
                          </label>
                          <input
                            id="modal-book-budget"
                            type="text"
                            value={budgetVal}
                            onChange={(e) => setBudgetVal(e.target.value)}
                            placeholder="e.g. ₹35,000 / Standard AMC"
                            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="modal-book-config" className="text-xs font-semibold text-white/80">
                            Configuration / Variant
                          </label>
                          <input
                            id="modal-book-config"
                            type="text"
                            value={configVal}
                            onChange={(e) => setConfigVal(e.target.value)}
                            placeholder="e.g. 16GB RAM / 512GB SSD"
                            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="modal-book-qty" className="text-xs font-semibold text-white/80">
                            Quantity
                          </label>
                          <input
                            id="modal-book-qty"
                            type="number"
                            min={1}
                            value={quantityVal}
                            onChange={(e) => setQuantityVal(Number(e.target.value))}
                            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="modal-book-date" className="text-xs font-semibold text-white/80 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-nex-blueLight" /> Preferred Date
                          </label>
                          <input
                            id="modal-book-date"
                            type="date"
                            value={preferredDateVal}
                            onChange={(e) => setPreferredDateVal(e.target.value)}
                            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="modal-book-time" className="text-xs font-semibold text-white/80 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-nex-blueLight" /> Preferred Time
                          </label>
                          <select
                            id="modal-book-time"
                            value={preferredTimeVal}
                            onChange={(e) => setPreferredTimeVal(e.target.value)}
                            className="w-full rounded-xl bg-nex-ink border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                          >
                            <option value="10:30 AM" className="bg-nex-ink text-white">10:30 AM - Morning Slot</option>
                            <option value="02:00 PM" className="bg-nex-ink text-white">02:00 PM - Afternoon Slot</option>
                            <option value="05:30 PM" className="bg-nex-ink text-white">05:30 PM - Evening Slot</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="modal-book-msg" className="text-xs font-semibold text-white/80">
                          Remarks / Special Requirements *
                        </label>
                        <textarea
                          id="modal-book-msg"
                          required
                          value={messageVal}
                          onChange={(e) => setMessageVal(e.target.value)}
                          placeholder="Describe details, specifications or issue symptoms..."
                          rows={3}
                          className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none resize-none"
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-primary w-full sm:w-auto py-3 px-8 text-xs font-bold"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Enquiry"}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* TRACK TAB */}
              {activeTab === "track" && (
                <div className="space-y-6">
                  {!trackedBooking ? (
                    <form onSubmit={handleTrackSubmit} className="space-y-4 max-w-md mx-auto py-4 text-left">
                      <h4 className="font-display text-sm font-bold text-white text-center">Track Live Booking Request</h4>
                      
                      {trackError && (
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 font-semibold">
                          {trackError}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label htmlFor="modal-track-id" className="text-xs font-semibold text-white/80">Booking Reference ID *</label>
                        <input
                          id="modal-track-id"
                          type="text"
                          required
                          value={trackId}
                          onChange={(e) => setTrackId(e.target.value)}
                          placeholder="e.g. NXB-2026-000001"
                          className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="modal-track-phone" className="text-xs font-semibold text-white/80">Customer Phone Number *</label>
                        <input
                          id="modal-track-phone"
                          type="tel"
                          required
                          value={trackPhone}
                          onChange={(e) => setTrackPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={trackLoading}
                        className="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        {trackLoading ? "Searching..." : "Lookup Status"}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      {/* Left: Progress info & timeline */}
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-mono text-[10px] font-bold text-nex-blueLight">{trackedBooking.bookingId}</span>
                              <h4 className="font-display text-sm font-bold text-white truncate max-w-[200px]">{trackedBooking.productName}</h4>
                            </div>
                            {(() => {
                              const cfg = getStatusConfig(trackedBooking.status);
                              return (
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase border animate-pulse ${cfg.color}`}>
                                  <span className="h-1 w-1 rounded-full bg-current shrink-0" />
                                  {cfg.label}
                                </span>
                              );
                            })()}
                          </div>
                          
                          <div className="space-y-1 text-[11px] text-nex-mist pt-2 border-t border-white/5">
                            <p><span className="font-semibold text-white/80">Client:</span> {trackedBooking.customerName}</p>
                            <p><span className="font-semibold text-white/80">Phone:</span> {trackedBooking.phone}</p>
                            <p><span className="font-semibold text-white/80">Branch:</span> {trackedBooking.city}</p>
                            <p><span className="font-semibold text-white/80">Assigned Tech:</span> {trackedBooking.assignedTo || "Awaiting Assignment"}</p>
                          </div>
                        </div>

                        {/* Status Timeline */}
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                          <h5 className="font-display text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-nex-blueLight" /> Service Status History
                          </h5>
                          <div className="space-y-4 relative before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-white/10 pl-1">
                            {trackedBooking.timeline?.filter((t: any) => t.type !== "chat").map((step: any, idx: number) => (
                              <div key={idx} className="flex gap-3 items-start relative text-[10px]">
                                <div className="h-4.5 w-4.5 rounded-full bg-nex-ink border border-white/10 flex items-center justify-center shrink-0 z-10">
                                  <span className="h-1.5 w-1.5 rounded-full bg-nex-blueLight" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-white capitalize">{step.status}</span>
                                    <span className="text-[8px] text-white/30">
                                      {new Date(step.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                    </span>
                                  </div>
                                  {step.message && <p className="text-nex-mist mt-0.5">{step.message}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Real-time Live Chat Widget */}
                      <div className="flex flex-col h-[320px] rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
                        <div className="bg-white/[0.03] px-4 py-2.5 border-b border-white/5 flex items-center gap-2 shrink-0">
                          <MessageSquare className="h-4 w-4 text-nex-blueLight" />
                          <span className="text-xs font-bold text-white">Live Discussion Thread</span>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                          {chatMessages.length === 0 ? (
                            <div className="text-center py-10 space-y-1">
                              <p className="text-[11px] text-white/70">No conversation messages yet.</p>
                              <p className="text-[9px] text-nex-mist">Type a message below to start chatting with support.</p>
                            </div>
                          ) : (
                            chatMessages.map((msg: any, idx: number) => {
                              const isAdmin = msg.sender === "admin";
                              return (
                                <div
                                  key={idx}
                                  className={`flex flex-col max-w-[80%] ${
                                    isAdmin ? "mr-auto items-start" : "ml-auto items-end"
                                  }`}
                                >
                                  <div
                                    className={`p-3 rounded-2xl text-[11px] leading-relaxed text-left ${
                                      isAdmin
                                        ? "bg-white/[0.05] border border-white/10 rounded-tl-none text-white/95"
                                        : "bg-nex-blue rounded-tr-none text-white"
                                    }`}
                                  >
                                    {msg.message}
                                  </div>
                                  <span className="text-[8px] text-white/30 mt-1">
                                    {isAdmin ? "NexLapTech Support" : "You"} •{" "}
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                              );
                            })
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Message Input */}
                        <form onSubmit={handleSendChat} className="p-3 border-t border-white/5 bg-white/[0.01] flex gap-2 shrink-0">
                          <input
                            type="text"
                            required
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Type a reply to NexLapTech Support..."
                            className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-xs text-white focus:outline-none focus:border-nex-blue/50"
                          />
                          <button
                            type="submit"
                            disabled={sendingChat || !chatMessage.trim()}
                            className="bg-nex-blue hover:bg-nex-blueLight disabled:opacity-50 text-white rounded-xl h-8.5 w-8.5 flex items-center justify-center shrink-0 transition-colors"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4.5 border-t border-white/5 flex justify-between items-center bg-white/[0.01] shrink-0 text-[10px] text-nex-mist">
              <span>Need immediate phone support? Call +91 8088979706</span>
              {trackedBooking && (
                <button
                  onClick={() => setTrackedBooking(null)}
                  className="text-nex-blueLight hover:underline font-semibold"
                >
                  Track another request
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
