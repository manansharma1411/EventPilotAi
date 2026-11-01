import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Subtle warm ambient glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[350px] bg-gradient-to-tr from-brand-100/60 via-amber-100/30 to-violet-100/50 blur-3xl rounded-full opacity-70" />
      </div>

      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
        {/* Main Title & Tagline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-navy-900 tracking-tight leading-[1.08]">
          Plan smarter. <br />
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
            Celebrate better.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The intelligent operating system for milestone celebrations. Synthesize
          comprehensive itineraries, enforce deterministic budget math, and orchestrate
          run-of-show logistics with persistent cloud storage.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link href="/events/new" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-7 py-3 text-base shadow-sm">
              <span>Plan My Event</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>

          <a href="#features" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-7 py-3 text-base"
            >
              <span>Explore Features</span>
              <ChevronRight className="w-4 h-4 ml-1 text-slate-400" />
            </Button>
          </a>
        </div>

        {/* Trust & Architecture Principles Bar */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Deterministic Budget Engine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Structured Gemini 2.0 AI Schemas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Supabase PostgreSQL Cloud Storage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Zero Mockup Pretending</span>
          </div>
        </div>
      </div>
    </section>
  );
}
