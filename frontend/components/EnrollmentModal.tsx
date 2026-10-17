"use client";

import React, { useEffect, useState } from "react";
import { X, Calendar, GraduationCap, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { safeJsonFetch } from "@/lib/apiHelper";

const COURSE_OPTIONS = [
  "Advanced Web Technologies & React",
  "Python Django Full Stack Development",
  "Embedded Systems & IoT Projects",
  "Desktop & Laptop Hardware Diagnostics",
  "CCTV Systems & Network Security",
  "Custom PC Architecture & Assembly",
];

const BATCH_OPTIONS = [
  "Weekday Morning (09:30 AM - 11:30 AM)",
  "Weekday Evening (05:30 PM - 07:30 PM)",
  "Weekend Batch (Saturday & Sunday)",
];

const PROJECT_OPTIONS = [
  "Minor College Project",
  "Major Engineering Project",
  "Industrial Live Project",
  "Research-oriented Project",
];

const INTERNSHIP_OPTIONS = [
  "Offline Hands-on Internship (Bengaluru/Tumkur)",
  "Online Remote Internship",
  "Hybrid Model",
];

const DURATION_OPTIONS = [
  "4 Weeks Program",
  "8 Weeks Program",
  "12 Weeks (3 Months)",
  "6 Months In-depth Program",
];

export default function EnrollmentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"training" | "internship">("training");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [preferredBatch, setPreferredBatch] = useState(BATCH_OPTIONS[0]);
  const [projectType, setProjectType] = useState(PROJECT_OPTIONS[0]);
  const [internshipType, setInternshipType] = useState(INTERNSHIP_OPTIONS[0]);
  const [duration, setDuration] = useState(DURATION_OPTIONS[0]);
  const [skills, setSkills] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleOpen = (e: any) => {
      setType(e.detail?.type || "training");
      if (e.detail?.item) {
        setSelectedCourse(e.detail.item);
      } else {
        setSelectedCourse(COURSE_OPTIONS[0]);
      }
      setSuccessData(null);
      setIsOpen(true);
    };

    window.addEventListener("nexbyte-open-enrollment-modal", handleOpen);
    return () => window.removeEventListener("nexbyte-open-enrollment-modal", handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      fullName,
      phone,
      email,
      college,
      branch,
      semester,
      city,
      message,
      type,
      // Conditional fields
      ...(type === "training"
        ? { courseTitle: selectedCourse, preferredBatch }
        : { projectType, internshipType, duration, skills }),
    };

    console.log("Form Submitted", payload);

    try {
      console.log("API Called", "/api/enrollments");
      const res = await safeJsonFetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok && res.data?.success) {
        setSuccessData(res.data.enrollment);
        // Clear fields
        setFullName("");
        setPhone("");
        setEmail("");
        setCollege("");
        setBranch("");
        setSemester("");
        setSkills("");
        setMessage("");
      } else {
        alert(res.error || "Failed to submit enrollment request.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={() => setIsOpen(false)} 
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel bg-nex-ink border border-cyan-500/20 shadow-glow-blue flex flex-col p-6 md:p-8 animate-float">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {successData ? (
          /* Success Screen */
          <div className="flex flex-col items-center text-center py-10 space-y-6">
            <div className="h-16 w-16 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-white">Enrollment Submitted Successfully!</h3>
              <p className="text-xs text-nex-mist mt-2 max-w-md mx-auto">
                We have registered your application. Our counselor will contact you shortly to schedule your consultation batch.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 w-full max-w-sm">
              <span className="text-[10px] text-nex-mist uppercase tracking-widest block">Your Request tracking ID</span>
              <span className="text-2xl font-mono font-bold text-gradient-blue tracking-wider block mt-1">
                {successData.enrollmentId}
              </span>
              <span className="text-[9px] text-white/30 block mt-2">
                Use this ID on our `/track` page to check status in real time.
              </span>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="btn-primary !py-2.5 !px-8 text-xs bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] border-none"
            >
              Close Portal
            </button>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                {type === "training" ? <Calendar className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  {type === "training" ? "Academy Enrollment Registration" : "Internship & Live Projects Registration"}
                </h3>
                <p className="text-xs text-nex-mist mt-0.5">Submit your enrollment details below.</p>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">Full Name *</label>
                <input 
                  type="text" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Niranjan Prasad"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">Phone Number *</label>
                <input 
                  type="tel" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">Email Address *</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@gmail.com"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">City / Location *</label>
                <input 
                  type="text" 
                  required 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* College */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">College / Institution *</label>
                <input 
                  type="text" 
                  required 
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. SIT Tumkur"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Branch */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">Branch / Stream *</label>
                <input 
                  type="text" 
                  required 
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science (BE)"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Semester */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">Semester / Academic Year *</label>
                <select 
                  required 
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="">Select Semester</option>
                  <option value="1st/2nd Semester (1st Year)">1st/2nd Sem (1st Year)</option>
                  <option value="3rd/4th Semester (2nd Year)">3rd/4th Sem (2nd Year)</option>
                  <option value="5th/6th Semester (3rd Year)">5th/6th Sem (3rd Year)</option>
                  <option value="7th/8th Semester (4th Year)">7th/8th Sem (4th Year)</option>
                  <option value="Graduated">Graduated / Working</option>
                </select>
              </div>

              {type === "training" ? (
                /* TRAINING SPECIFIC FIELDS */
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">Training Course *</label>
                    <select 
                      required
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      {COURSE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">Preferred Batch *</label>
                    <select 
                      required
                      value={preferredBatch}
                      onChange={(e) => setPreferredBatch(e.target.value)}
                      className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      {BATCH_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                /* INTERNSHIP SPECIFIC FIELDS */
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">Project Type *</label>
                    <select 
                      required
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      {PROJECT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">Internship Type *</label>
                    <select 
                      required
                      value={internshipType}
                      onChange={(e) => setInternshipType(e.target.value)}
                      className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      {INTERNSHIP_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">Internship Duration *</label>
                    <select 
                      required
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      {DURATION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">Core Skills *</label>
                    <input 
                      type="text" 
                      required 
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. React, Nodejs, Python, Embedded C"
                      className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Message / Motivation */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">Cover Message / Inquiries</label>
              <textarea 
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mention any queries or specific details you wish to ask..."
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>

            {/* File upload placeholder (optional) */}
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white/[0.01] border border-white/5">
              <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
              <span className="text-[10px] text-nex-mist">Resume submission (optional) can be uploaded later during phone/email verification consultation.</span>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 text-xs py-3.5 bg-cyan-600 hover:bg-cyan-500 border-none shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Registering Enrollment...
                </>
              ) : (
                "Submit Enrollment Application"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
