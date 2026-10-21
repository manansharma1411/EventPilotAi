import { Navbar } from "@/components/Navbar";
import { HealthChecker } from "@/components/HealthChecker";
import { FeaturesSection } from "@/components/FeaturesSection";
import { DeploymentRoadmap } from "@/components/DeploymentRoadmap";
import { Footer } from "@/components/Footer";
import { Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
        {/* Hero Section */}
        <div className="relative text-center max-w-4xl mx-auto pt-6 pb-16">
          {/* Subtle background glow */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="w-[500px] h-[300px] bg-gradient-to-tr from-indigo-500/15 via-violet-500/10 to-amber-500/15 blur-3xl rounded-full" />
          </div>

          {/* Challenge Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Prompt Wars Challenge 5 — Celebration &amp; Event Planner</span>
          </div>

          {/* Main Title & Tagline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Plan smarter. <br />
            <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-violet-400 bg-clip-text text-transparent">
              Celebrate better.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The intelligent GenAI operating system for modern event planning.
            Architect multi-phase celebrations, enforce deterministic budget math,
            and persist every detail to production PostgreSQL.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#health"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Verify Live System Health
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/api/health"
              target="_blank"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              View /api/health Response
            </Link>
          </div>

          {/* Key Value Prop Pills */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5">
              <div className="text-[11px] text-slate-400">Architecture</div>
              <div className="text-sm font-bold text-white mt-0.5">Next.js 15 App Router</div>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5">
              <div className="text-[11px] text-slate-400">Data Integrity</div>
              <div className="text-sm font-bold text-white mt-0.5">Deterministic Math</div>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5">
              <div className="text-[11px] text-slate-400">Persistence</div>
              <div className="text-sm font-bold text-white mt-0.5">Supabase PostgreSQL</div>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5">
              <div className="text-[11px] text-slate-400">AI Engine</div>
              <div className="text-sm font-bold text-white mt-0.5">Gemini Structured API</div>
            </div>
          </div>
        </div>

        {/* Live System Health Section */}
        <HealthChecker />

        {/* Feature Highlights */}
        <FeaturesSection />

        {/* Phased Roadmap */}
        <DeploymentRoadmap />
      </main>

      <Footer />
    </>
  );
}
