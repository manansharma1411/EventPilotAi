import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Input Vision & Constraints",
      description:
        "Provide your celebration type, date, location, guest target, and total budget. Choose your experience priority: culinary, atmosphere, music, or styling.",
    },
    {
      step: "02",
      title: "AI Synthesizes Event Structure",
      description:
        "Gemini 2.0 creates a tailored celebration blueprint with structured run-of-show milestones, vendor allocation suggestions, and thematic details.",
    },
    {
      step: "03",
      title: "Refine with Deterministic Precision",
      description:
        "Every dollar and minute is verified by strict application logic. Adjust category caps, lock contingency buffers, and verify budget math with zero hallucinations.",
    },
    {
      step: "04",
      title: "Coordinate & Persist to Cloud",
      description:
        "Store your event directly in Supabase PostgreSQL with Row Level Security. Share schedules with vendors, track RSVPs in real time, and celebrate with confidence.",
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-24 py-16 md:py-24 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="indigo" size="sm" className="mb-3">
            Workflow Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            How EventPilot AI works
          </h2>
          <p className="mt-3 text-base text-slate-600">
            From initial concept to flawless celebration execution in four methodical steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div
              key={i}
              className="relative rounded-2xl border border-slate-200 bg-warmth-50/60 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-extrabold text-brand-600">
                    {s.step}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-navy-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-xs text-brand-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Flow</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/events/new">
            <Button size="lg" className="px-8 shadow-sm">
              <span>Start Planning Your Event</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
