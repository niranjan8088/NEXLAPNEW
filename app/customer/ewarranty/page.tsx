"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  QrCode,
  FileText,
  PlusCircle,
  X,
  Sparkles,
  ArrowRight,
  Laptop,
  MessageSquare,
  Wrench
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";

export interface WarrantyRecord {
  id: string;
  serialNumber: string;
  productName: string;
  category: string;
  brand: string;
  purchaseDate: string;
  expiryDate: string;
  warrantyDuration: string;
  status: "active" | "expired" | "claimed";
  coverageTerms: string;
  invoiceNumber?: string;
  customerName?: string;
}

export default function CustomerEWarrantyPage() {
  const [warranties, setWarranties] = useState<WarrantyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Serial Tool
  const [searchSerial, setSearchSerial] = useState("");
  const [searchResult, setSearchResult] = useState<WarrantyRecord | null | "not_found">(null);

  // Modals
  const [selectedWarrantyCert, setSelectedWarrantyCert] = useState<WarrantyRecord | null>(null);
  const [showRmaModal, setShowRmaModal] = useState(false);
  const [rmaDevice, setRmaDevice] = useState<WarrantyRecord | null>(null);
  const [rmaIssue, setRmaIssue] = useState("");
  const [rmaSuccessMsg, setRmaSuccessMsg] = useState("");

  const loadWarranties = async () => {
    setLoading(true);
    try {
      // Mock / database loaded customer warranties
      const defaultWarranties: WarrantyRecord[] = [
        {
          id: "war-101",
          serialNumber: "SN-SAM-980P-9921",
          productName: "Samsung 980 PRO 1TB PCIe 4.0 NVMe SSD",
          category: "Storage",
          brand: "Samsung",
          purchaseDate: "2025-11-10",
          expiryDate: "2030-11-10",
          warrantyDuration: "5 Years",
          status: "active",
          coverageTerms: "5 Years Samsung Official Brand Warranty covering hardware failures, controller faults, and flash memory degradation.",
          invoiceNumber: "NEX-2025-0841",
          customerName: "Valued Customer"
        },
        {
          id: "war-102",
          serialNumber: "SN-LNV-T490-4810",
          productName: "Lenovo ThinkPad T490 (Certified Refurbished)",
          category: "Laptops",
          brand: "Lenovo",
          purchaseDate: "2026-02-15",
          expiryDate: "2027-02-15",
          warrantyDuration: "1 Year",
          status: "active",
          coverageTerms: "1 Year NexLapTech Hardware & Motherboard Repair Guarantee including free diagnostic and battery replacement.",
          invoiceNumber: "NEX-2026-0129",
          customerName: "Valued Customer"
        },
        {
          id: "war-103",
          serialNumber: "SN-EVM-NVME-512G",
          productName: "EVM 512GB NVMe M.2 SSD",
          category: "Storage",
          brand: "EVM",
          purchaseDate: "2024-05-01",
          expiryDate: "2027-05-01",
          warrantyDuration: "3 Years",
          status: "active",
          coverageTerms: "3 Years Brand Warranty with instant replacement support at NexLapTech Authorized Hubs.",
          invoiceNumber: "NEX-2024-0412",
          customerName: "Valued Customer"
        }
      ];

      setWarranties(defaultWarranties);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarranties();
  }, []);

  // Handle Serial Number Lookup
  const handleSearchSerial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchSerial.trim()) return;
    const clean = searchSerial.trim().toUpperCase();
    const found = warranties.find(
      (w) => w.serialNumber.toUpperCase() === clean || (w.invoiceNumber && w.invoiceNumber.toUpperCase() === clean)
    );
    setSearchResult(found || "not_found");
  };

  // Handle RMA Submission
  const handleRmaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rmaDevice || !rmaIssue.trim()) return;
    setRmaSuccessMsg(`RMA Claim #${Math.floor(100000 + Math.random() * 900000)} successfully submitted for ${rmaDevice.productName}. Our technicians will contact you within 4 hours.`);
    setTimeout(() => {
      setShowRmaModal(false);
      setRmaDevice(null);
      setRmaIssue("");
      setRmaSuccessMsg("");
    }, 4000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 text-slate-900 dark:text-white shadow-[0_4px_24px_rgba(14,165,233,0.06)]">
        {/* Ambient Flares */}
        <div className="pointer-events-none absolute -top-12 -left-12 h-64 w-64 rounded-full bg-[#0EA5E9]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-[#F472B6]/15 blur-3xl" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-300 mb-1">
            <ShieldCheck className="h-4 w-4 text-[#0EA5E9]" /> Official NexLapTech E-Warranty Vault
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Digital Hardware Warranties &amp; RMA Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
            Manage your hardware protection, verify serial numbers, download official warranty certificates, and initiate instant claim requests.
          </p>
        </div>
      </div>

      {/* 1. SERIAL NUMBER VERIFICATION SEARCH TOOL */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Search className="h-5 w-5 text-nex-blue" />
          <span>Verify Any Hardware Serial Number or Invoice Number</span>
        </div>

        <form onSubmit={handleSearchSerial} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchSerial}
            onChange={(e) => {
              setSearchSerial(e.target.value);
              setSearchResult(null);
            }}
            placeholder="Enter Serial No. (e.g. SN-SAM-980P-9921) or Invoice No..."
            className="flex-1 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 px-4 py-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-nex-blue"
          />
          <button
            type="submit"
            className="rounded-2xl bg-nex-blue hover:bg-blue-600 text-white font-bold text-xs px-6 py-3 shadow-md flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" /> Check Warranty Status
          </button>
        </form>

        {/* Search Result Card */}
        {searchResult === "not_found" && (
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">No registered warranty record found for &quot;{searchSerial}&quot;.</p>
              <p className="text-[11px] mt-0.5">Please check your invoice receipt or contact support if you recently purchased this item.</p>
            </div>
          </div>
        )}

        {searchResult && searchResult !== "not_found" && (
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span>OFFICIAL WARRANTY VERIFIED • ACTIVE</span>
              </div>
              <span className="font-mono text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-emerald-300 font-bold text-slate-700 dark:text-slate-300">
                {searchResult.serialNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Product</span>
                <span className="font-bold text-slate-900 dark:text-white">{searchResult.productName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Coverage</span>
                <span className="font-bold text-slate-900 dark:text-white">{searchResult.warrantyDuration}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Valid Until</span>
                <span className="font-bold text-emerald-600">{searchResult.expiryDate}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setSelectedWarrantyCert(searchResult)}
                className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1"
              >
                <FileText className="h-3.5 w-3.5" /> E-Certificate
              </button>
              <button
                onClick={() => {
                  setRmaDevice(searchResult);
                  setShowRmaModal(true);
                }}
                className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1"
              >
                <Wrench className="h-3.5 w-3.5" /> Request Claim / RMA
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. REGISTERED CUSTOMER WARRANTIES LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>My Hardware E-Warranties ({warranties.length})</span>
          </h2>
          <span className="text-xs text-slate-500">Auto-linked with your NEXLAPTECH invoices</span>
        </div>

        {loading ? (
          <div className="rounded-3xl border p-8 text-center text-xs text-slate-400">
            Loading digital warranty vault...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warranties.map((war) => (
              <div
                key={war.id}
                className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">
                      ● Active Protection
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10">
                      {war.serialNumber}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {war.productName}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {war.coverageTerms}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-white/5">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Purchase Date</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{war.purchaseDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Expires On</span>
                      <span className="font-bold text-emerald-600">{war.expiryDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedWarrantyCert(war)}
                    className="flex-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold text-xs py-2 flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-nex-blue" /> View Certificate
                  </button>

                  <button
                    onClick={() => {
                      setRmaDevice(war);
                      setShowRmaModal(true);
                    }}
                    className="flex-1 rounded-xl bg-nex-blue hover:bg-blue-600 text-white font-bold text-xs py-2 flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Wrench className="h-3.5 w-3.5" /> Submit Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. PRINTABLE E-WARRANTY CERTIFICATE MODAL */}
      {selectedWarrantyCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setSelectedWarrantyCert(null)} />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-white/10 bg-white text-slate-900 p-6 sm:p-8 shadow-2xl z-10 font-sans space-y-6">
            <button
              onClick={() => setSelectedWarrantyCert(null)}
              className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-700 print:hidden"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Official E-Warranty Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div>
                <h2 className="font-display text-xl font-extrabold text-slate-900 tracking-tight">
                  NexLapTech
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  Official Electronic Warranty Certificate
                </p>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  VERIFIED &amp; ACTIVE
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">ID: {selectedWarrantyCert.id}</p>
              </div>
            </div>

            {/* Hardware & Coverage Details */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Covered Device / Component</div>
                <h3 className="font-display text-lg font-extrabold text-slate-900">{selectedWarrantyCert.productName}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[9px] text-slate-400 block">Serial Number</span>
                    <span className="font-mono font-bold text-slate-900">{selectedWarrantyCert.serialNumber}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Brand</span>
                    <span className="font-bold text-slate-900">{selectedWarrantyCert.brand}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Purchase Date</span>
                    <span className="font-semibold text-slate-700">{selectedWarrantyCert.purchaseDate}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Warranty Expiry</span>
                    <span className="font-bold text-blue-700">{selectedWarrantyCert.expiryDate}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900">Warranty Coverage Terms &amp; Conditions:</h4>
                <p className="text-slate-600 leading-relaxed text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedWarrantyCert.coverageTerms} This electronic certificate certifies that the product identified by serial number {selectedWarrantyCert.serialNumber} is covered against manufacturing defects, hardware failure, and component malfunction under NexLapTech official service terms.
                </p>
              </div>

              {/* QR Code / Authenticity Seal */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <QrCode className="h-12 w-12 text-slate-800" />
                  <div className="text-[10px] text-slate-500">
                    <p className="font-bold text-slate-800">Scan to Verify Warranty</p>
                    <p>NexLapTech Authorized Service Network</p>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-500">
                  <p className="font-bold text-slate-800">NexLapTech Digital Stamp</p>
                  <p>Bangalore, KA 560070</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-primary !py-2 !px-5 text-xs flex items-center gap-1.5 shadow-md"
              >
                <Printer className="h-4 w-4" /> Print / Save PDF Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUBMIT RMA / WARRANTY CLAIM MODAL */}
      {showRmaModal && rmaDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowRmaModal(false)} />

          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-2xl z-10 text-slate-900 dark:text-white space-y-4">
            <button
              onClick={() => setShowRmaModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Submit Warranty Claim (RMA Request)
            </h3>

            {rmaSuccessMsg ? (
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 p-4 text-xs text-emerald-800 dark:text-emerald-300 font-semibold space-y-2 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                <p>{rmaSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleRmaSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Selected Device:</span>
                  <div className="font-bold text-slate-900 dark:text-white">{rmaDevice.productName}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">SN: {rmaDevice.serialNumber}</div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Describe Issue / Fault *</label>
                  <textarea
                    required
                    rows={3}
                    value={rmaIssue}
                    onChange={(e) => setRmaIssue(e.target.value)}
                    placeholder="e.g. Device not powering on, slow read speed, screen flickering..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRmaModal(false)}
                    className="btn-secondary !py-2 !px-4 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary !py-2 !px-5 text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Wrench className="h-3.5 w-3.5" /> Submit RMA Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
