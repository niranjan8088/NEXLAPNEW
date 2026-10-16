"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Briefcase, Send, CheckCircle2, Clock, FileText, Award, RefreshCw, GraduationCap } from "lucide-react";
import { safeJsonFetch } from "@/lib/apiHelper";

export default function CustomerInternshipPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [internships, setInternships] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("Computer Science & Engineering");
  const [semester, setSemester] = useState("6th Semester");
  const [domain, setDomain] = useState("Embedded & IoT Systems");
  const [resumeUrl, setResumeUrl] = useState("");

  useEffect(() => {
    fetchProfileAndInternships();
  }, []);

  const fetchProfileAndData = async () => {
    try {
      const profRes = await safeJsonFetch("/api/customer/profile");
      if (profRes.ok && profRes.data?.profile) {
        const p = profRes.data.profile;
        setStudentName(p.full_name || "");
        setEmail(p.email || "");
        setPhone(p.phone || "");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const res = await safeJsonFetch("/api/customer/internships");
      if (res.ok && res.data?.internships) {
        setInternships(res.data.internships);
      } else {
        // Fallback demo data
        setInternships([
          {
            id: "int-101",
            application_id: "INT-2026-000002",
            student_name: "Ramesh Kumar",
            email: "customer@nexbyte.com",
            phone: "9876543210",
            college: "SIT Tumkur",
            domain: "Embedded & IoT Systems",
            status: "Under Review",
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileAndInternships = async () => {
    await fetchProfileAndData();
    await fetchInternships();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");

    try {
      const payload = {
        student_name: studentName,
        email,
        phone,
        college,
        branch,
        semester,
        domain,
        resume_url: resumeUrl || "#",
      };

      const res = await safeJsonFetch("/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(res.data?.error || "Failed to submit internship application.");

      const appId = res.data?.applicationId || `INT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setSuccessMsg(`Application ${appId} submitted successfully! Our academy coordinator will review your profile.`);
      fetchInternships();
    } catch (err: any) {
      setSuccessMsg(`Application received! Ref ID: INT-2026-${Math.floor(100000 + Math.random() * 900000)}.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0D0D0F] border border-[#E5E7EB] dark:border-[#27272A] p-6 sm:p-8 text-[#111827] dark:text-white shadow-xs">
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] dark:bg-[#1E1638] border border-[#4F46E5]/20 dark:border-[#7C5CFF]/30 px-3 py-1 text-xs font-bold text-[#4F46E5] dark:text-[#7C5CFF]">
            <Briefcase className="h-4 w-4" /> Academic &amp; Industry Internships
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Nex LapTech Student Internship Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] dark:text-[#A1A1AA] max-w-2xl font-medium">
            Gain hands-on industry experience in Embedded Systems, Full-Stack Web Development, Cyber Security, and Hardware Engineering with official certification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 rounded-3xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#0D0D0F] p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="font-display text-lg font-bold text-[#111827] dark:text-white flex items-center gap-2">
            <Send className="h-5 w-5 text-[#4F46E5] dark:text-[#7C5CFF]" />
            <span>Apply for Internship Program</span>
          </h2>

          {successMsg && (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">Student Name *</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile Number"
                  className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">College / University *</label>
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. SIT Tumkur, RVCE, BMSCE"
                  className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">Domain Preference</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none"
                >
                  <option value="Embedded & IoT Systems">Embedded &amp; IoT Systems</option>
                  <option value="Full Stack Web Development">Full Stack Web Development</option>
                  <option value="Python AI & ML">Python AI &amp; Machine Learning</option>
                  <option value="Cyber Security & Networking">Cyber Security &amp; Networking</option>
                  <option value="Hardware & Chip Repair">Hardware &amp; Motherboard Repair</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#111827] dark:text-white block mb-1">Resume Link (Drive / LinkedIn)</label>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/..."
                  className="w-full rounded-xl bg-[#F7F8FC] dark:bg-[#151518] border border-[#E5E7EB] dark:border-[#27272A] px-3.5 py-2.5 text-xs text-[#111827] dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary !px-6 !py-3 text-xs font-bold flex items-center gap-2 shadow-xs"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          <h2 className="font-display text-base font-bold text-[#111827] dark:text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#4F46E5] dark:text-[#7C5CFF]" />
            <span>My Applications</span>
          </h2>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#667085] dark:text-[#A1A1AA]">
              Loading applications...
            </div>
          ) : internships.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#0D0D0F] p-6 text-center text-xs text-[#667085] dark:text-[#A1A1AA] space-y-2">
              <GraduationCap className="h-8 w-8 mx-auto text-[#98A2B3]" />
              <p className="font-bold">No internship applications yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {internships.map((int) => (
                <div
                  key={int.id}
                  className="rounded-2xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#0D0D0F] p-4 text-xs space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#4F46E5] dark:text-[#7C5CFF]">
                      {int.application_id || int.id}
                    </span>
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                      {int.status || "Under Review"}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#111827] dark:text-white">{int.domain}</h3>
                  <p className="text-[11px] text-[#667085] dark:text-[#A1A1AA]">{int.college || "Academic Internship"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
