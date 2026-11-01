import { Sparkles, Calculator, CalendarClock, Briefcase, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function FeaturesSection() {
  const features = [
    {
      title: "Gemini AI Event Architect",
      badge: "AI Celebration Architect",
      description:
        "Synthesizes cohesive celebration themes, multi-phase itineraries, and tailored vendor briefs. Every AI output is strictly validated against TypeScript Zod schemas.",
      icon: Sparkles,
      color: "bg-brand-50 text-brand-600 border-brand-200",
      bullets: [
        "Dynamic theme & moodboard generation",
        "Structured JSON run-of-show schemas",
        "Deterministic post-processing validation",
      ],
    },
    {
      title: "Deterministic Budget Engine",
      badge: "Zero Math Hallucinations",
      description:
        "Financial allocation and variance calculations are executed strictly in application TypeScript. Categorize deposits, pending liabilities, and contingency buffers with 100% precision.",
      icon: Calculator,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
      bullets: [
        "Configurable contingency reserves (5–20%)",
        "Live variance meter against committed contracts",
        "Per-guest cost breakdown ratios",
      ],
    },
    {
      title: "Run-of-Show Timeline Coordinator",
      badge: "Synchronized Logistics",
      description:
        "Transform abstract event visions into precise minute-by-minute execution agendas. Assign point persons, link vendor load-in times, and prevent day-of bottlenecks.",
      icon: CalendarClock,
      color: "bg-violet-50 text-violet-600 border-violet-200",
      bullets: [
        "Vendor load-in & soundcheck tracking",
        "Ceremony & banquet milestone locks",
        "Printable and exportable production schedules",
      ],
    },
    {
      title: "Vendor Coordination & Contracts",
      badge: "Structured Matrix",
      description:
        "Organize caterers, floral stylists, sound engineers, and photographers under a unified dashboard. Track payment milestones and dietary constraints cleanly.",
      icon: Briefcase,
      color: "bg-amber-50 text-amber-600 border-amber-200",
      bullets: [
        "Contract status & payment due dates",
        "Dietary & allergy aggregated summaries",
        "Real PostgreSQL relational persistence",
      ],
    },
  ];

  return (
    <section id="features" className="scroll-mt-24 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="indigo" size="sm" className="mb-3">
            Core Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            Engineered for unforgettable celebrations
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Combining the creative intelligence of Gemini 2.0 with the deterministic rigor of modern SaaS architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${f.color} shadow-subtle`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-navy-900 group-hover:text-brand-600 transition-colors">
                    {f.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                    {f.description}
                  </p>

                  <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
                    {f.bullets.map((b, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    href="/plan"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Launch in Planner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
