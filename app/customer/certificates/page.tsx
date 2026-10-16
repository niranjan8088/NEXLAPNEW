"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Award, ShieldCheck, Download, ExternalLink, QrCode, Search, CheckCircle2 } from "lucide-react";
import { safeJsonFetch } from "@/lib/apiHelper";

export default function CustomerCertificatesPage() {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await safeJsonFetch("/api/customer/training");
      if (res.ok && res.data?.certificates?.length) {
        setCertificates(res.data.certificates);
      } else {
        // Fallback demo certificate matching Registration ID format
        setCertificates([
          {
            id: "c-101",
            registrationId: "NBT-TR-2026-001",
            certificateId: "NBT-TR-2026-001",
            studentName: "Ramesh Kumar",
            courseTitle: "Full Stack Web Development",
            trainingType: "Advanced Web Technologies",
            projectTitle: "NextJS Glassmorphic Customer CRM Portal",
            completionDate: "2026-07-15",
            status: "verified",
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0D0D0F] border border-[#E5E7EB] dark:border-[#27272A] p-6 sm:p-8 text-[#111827] dark:text-white shadow-xs">
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] dark:bg-[#1E1638] border border-[#4F46E5]/20 dark:border-[#7C5CFF]/30 px-3 py-1 text-xs font-bold text-[#4F46E5] dark:text-[#7C5CFF]">
            <Award className="h-4 w-4" /> Official NexLapTech Certification Vault
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            My Verified Certificates
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] dark:text-[#A1A1AA] max-w-2xl font-medium">
            View, download, and share your official NexLapTech Academy credentials with QR verification and unique Registration IDs.
          </p>
        </div>
      </div>

      {/* Certificates Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#667085] dark:text-[#A1A1AA]">
          Loading certificates...
        </div>
      ) : certificates.length === 0 ? (
        <div className="rounded-3xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#0D0D0F] p-12 text-center space-y-3 shadow-xs">
          <Award className="h-10 w-10 text-[#98A2B3] mx-auto" />
          <h3 className="font-display text-base font-bold text-[#111827] dark:text-white">
            No certificates issued yet
          </h3>
          <p className="text-xs text-[#667085] dark:text-[#A1A1AA] max-w-sm mx-auto">
            Certificates are automatically issued upon completion of your NexLapTech IT Training or Academy Internship program.
          </p>
          <Link
            href="/customer/training"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#4F46E5] text-white font-bold text-xs px-4 py-2 shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <span>Explore Training Programs</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => {
            const regId = cert.registrationId || cert.certificateId || "NBT-TR-2026-001";
            const verifyUrl = `/verify?regid=${encodeURIComponent(regId)}`;

            return (
              <div
                key={cert.id}
                className="rounded-3xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#0D0D0F] p-6 shadow-xs flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 px-3 py-0.5 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" /> Official &amp; Verified
                    </span>
                    <span className="font-mono text-xs font-bold text-[#4F46E5] dark:text-[#7C5CFF]">
                      {regId}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-extrabold text-[#111827] dark:text-white">
                      {cert.courseTitle}
                    </h3>
                    <p className="text-xs text-[#667085] dark:text-[#A1A1AA] mt-1 font-medium">
                      Issued to <strong className="text-[#111827] dark:text-white">{cert.studentName}</strong> on {cert.completionDate}
                    </p>
                  </div>

                  {cert.projectTitle && (
                    <div className="rounded-2xl bg-[#F7F8FC] dark:bg-[#151518] p-3 text-xs text-[#667085] dark:text-[#A1A1AA] space-y-0.5 border border-[#E5E7EB] dark:border-[#27272A]">
                      <span className="font-bold text-[#111827] dark:text-white block">Capstone Project:</span>
                      <p>{cert.projectTitle}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-between gap-3">
                  <Link
                    href={verifyUrl}
                    target="_blank"
                    className="flex-1 rounded-xl bg-[#EEF2FF] dark:bg-[#1E1638] text-[#4F46E5] dark:text-[#7C5CFF] font-bold text-xs py-2.5 flex items-center justify-center gap-1.5 hover:bg-indigo-100 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Verify Certificate
                  </Link>

                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex-1 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
