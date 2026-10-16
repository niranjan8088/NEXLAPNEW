"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Target,
  Trophy,
  History,
  Mail,
  Linkedin,
  Globe,
  Award,
  BookOpen,
  Cpu,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";

const MILESTONES = [
  { year: "2020", title: "Founding in Tumkur", desc: "Nex LapTech established as a dedicated computer repair service center, focusing on chip-level troubleshooting." },
  { year: "2022", title: "Expansion to Bengaluru", desc: "Opened head office in Padmanabhanagar, scaling IT maintenance contracts (AMC) and custom PC construction." },
  { year: "2024", title: "Academy & Training Division", desc: "Launched hardware repair certifications and student IEEE project support courses." },
  { year: "2026", title: "Enterprise Systems Platform", desc: "Integrated cloud management portals, scaling hardware supply chains across Karnataka." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="relative min-h-screen bg-nex-black pt-28 pb-16 overflow-hidden">
        {/* Glow gradients */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-nex-blue/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-40 right-1/4 h-[500px] w-[500px] rounded-full bg-nex-blueLight/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
          
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="section-eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-nex-blueLight shadow-glow-blue" />
              NEX LAPTECH STORY
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
              About Our <span className="text-gradient-blue">Enterprise.</span>
            </h1>
            <p className="mt-4 text-base text-nex-mist leading-relaxed">
              We started with a simple belief: high-fidelity hardware servicing should be transparent, prompt, and accessible. Today, Nex LapTech is an integrated IT hardware partner and academic hub.
            </p>
          </div>

          {/* Vision, Mission, Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
            {/* Vision */}
            <div className="glass-card p-6 bg-nex-ink border border-white/5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-nex-blue/15 text-nex-blueLight flex items-center justify-center mb-4">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="font-display text-sm font-bold text-white mb-2">Our Vision</h3>
                <p className="text-[11px] text-nex-mist leading-relaxed">
                  To become the leading systems engineering and technology repair platform in South India, setting the standard for technical accuracy and client transparency.
                </p>
              </div>
            </div>

            {/* Mission */}
            <div className="glass-card p-6 bg-nex-ink border border-white/5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-nex-blue/15 text-nex-blueLight flex items-center justify-center mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-display text-sm font-bold text-white mb-2">Our Mission</h3>
                <p className="text-[11px] text-nex-mist leading-relaxed">
                  To deliver premium hardware sales, board-level repairs, networking configurations, and industry-grade training that empowers technicians and corporations.
                </p>
              </div>
            </div>

            {/* Achievements */}
            <div className="glass-card p-6 bg-nex-ink border border-white/5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-nex-blue/15 text-nex-blueLight flex items-center justify-center mb-4">
                  <Trophy className="h-5 w-5" />
                </div>
                <h3 className="font-display text-sm font-bold text-white mb-2">Our Achievements</h3>
                <p className="text-[11px] text-nex-mist leading-relaxed">
                  Over 500+ micro-soldering board repairs completed, 150+ certified technicians trained, and 200+ academic IEEE IoT project modules fully engineered.
                </p>
              </div>
            </div>
          </div>

          {/* CEO Section - Niranjan M. */}
          <div className="mb-24 scroll-mt-24">
            <div className="text-center mb-12">
              <span className="section-eyebrow">EXECUTIVE LEADERSHIP</span>
              <h2 className="font-display text-2xl font-bold text-white sm:text-4xl">
                CEO &amp; <span className="text-gradient-blue">Founder Message</span>
              </h2>
            </div>

            <div className="glass-panel p-6 md:p-10 rounded-3xl border border-white/5 bg-nex-ink flex flex-col lg:flex-row items-center gap-10 shadow-glow-blue">
              {/* Profile image card */}
              <div className="relative h-64 w-64 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-white/5 p-4 flex flex-col items-center justify-center">
                <div className="relative h-44 w-44 rounded-full overflow-hidden border-2 border-nex-blueLight mb-4 flex items-center justify-center bg-nex-black">
                  <User className="h-24 w-24 text-white/20" />
                </div>
                <h3 className="font-display text-sm font-bold text-white">Niranjan M.</h3>
                <p className="text-[10px] text-nex-blueLight font-semibold">CEO &amp; Co-Founder</p>
              </div>

              {/* CEO details */}
              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 text-[9px] text-nex-blueLight font-bold uppercase">
                    Technology Passion
                  </span>
                  <span className="rounded bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 text-[9px] text-green-400 font-bold uppercase">
                    Systems Architect
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-white italic">
                  &ldquo;Our focus is resolving hardware failures others find too complex.&rdquo;
                </h3>

                <p className="text-xs text-nex-mist leading-relaxed">
                  As the founding technician and director of Nex LapTech, I have overseen the troubleshooting of hundreds of liquid-damaged motherboards, micro-chip shorts, and structural laptop failures. Our goal is to extend Nex LapTech into a modular corporate supplier, while offering the best hands-on practical academy for aspiring engineers in Karnataka.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-white/5">
                  <div>
                    <h4 className="font-bold text-white/95">Leadership Focus</h4>
                    <p className="text-[11px] text-nex-mist mt-0.5">Chip-level diagnostics, circuit board prototyping, and server infrastructure configurations.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white/95">Business Goals</h4>
                    <p className="text-[11px] text-nex-mist mt-0.5">Establishing 5 additional service branches in Karnataka and offering digital certification codes.</p>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <a
                    href="mailto:nexbytetechnologies@gmail.com"
                    className="h-8.5 w-8.5 rounded-full glass-panel flex items-center justify-center text-white hover:text-nex-blueLight transition-colors"
                    title="Email CEO"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8.5 w-8.5 rounded-full glass-panel flex items-center justify-center text-white hover:text-nex-blueLight transition-colors"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Business Growth Timeline */}
          <div className="mb-24">
            <div className="text-center mb-12">
              <span className="section-eyebrow">HISTORICAL JOURNEY</span>
              <h2 className="font-display text-2xl font-bold text-white sm:text-4xl">
                Business Growth <span className="text-gradient-blue">Timeline</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {MILESTONES.map((m, idx) => (
                <div key={idx} className="glass-card p-6 bg-nex-ink border border-white/5 rounded-2xl relative group">
                  <div className="font-display text-2xl font-bold text-nex-blueLight mb-3">
                    {m.year}
                  </div>
                  <h4 className="font-display text-sm font-bold text-white mb-2">{m.title}</h4>
                  <p className="text-[10px] text-nex-mist leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Credentials & Certificates */}
          <div className="mb-24">
            <div className="text-center mb-12">
              <span className="section-eyebrow">TRUST &amp; CERTIFICATION</span>
              <h2 className="font-display text-2xl font-bold text-white sm:text-4xl">
                Professional <span className="text-gradient-blue">Credentials</span>
              </h2>
              <p className="mt-3 text-xs text-nex-mist max-w-lg mx-auto">
                We are fully registered and carry technical authorizations for industrial hardware services.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="glass-panel p-5 rounded-2xl bg-nex-ink border border-white/5 flex items-center gap-4">
                <Award className="h-8 w-8 text-nex-blueLight shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">ISO Certified Standards</h4>
                  <p className="text-[9px] text-nex-mist mt-0.5">Compliant with tech troubleshooting protocols</p>
                </div>
              </div>
              <div className="glass-panel p-5 rounded-2xl bg-nex-ink border border-white/5 flex items-center gap-4">
                <ShieldCheck className="h-8 w-8 text-nex-blueLight shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">MSME Registered</h4>
                  <p className="text-[9px] text-nex-mist mt-0.5">Government recognized service platform</p>
                </div>
              </div>
              <div className="glass-panel p-5 rounded-2xl bg-nex-ink border border-white/5 flex items-center gap-4">
                <Cpu className="h-8 w-8 text-nex-blueLight shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">IEEE Project Partner</h4>
                  <p className="text-[9px] text-nex-mist mt-0.5">Authorized technology project mentoring center</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}

function User(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
