import { CheckCircle2, Clock, ShieldAlert } from "lucide-react";

export function DeploymentRoadmap() {
  const steps = [
    {
      phase: "Phase 1 (Current)",
      name: "Deploy Before Building",
      status: "In Progress",
      description:
        "Next.js App Router, Tailwind CSS, TypeScript strict mode, GET /api/health verification, Git repository, and Vercel production deployment pipeline.",
      active: true,
      done: false,
    },
    {
      phase: "Phase 2",
      name: "Database Architecture & Auth",
      status: "Next",
      description:
        "Supabase PostgreSQL schema, migrations, RLS policies, events/budget/guest tables, and optional authentication flow.",
      active: false,
      done: false,
    },
    {
      phase: "Phase 3",
      name: "Gemini AI Event Architect",
      status: "Upcoming",
      description:
        "Gemini API structured JSON generation, Zod schema validation, automated timeline generator, theme synthesizer, and vendor recommendations.",
      active: false,
      done: false,
    },
    {
      phase: "Phase 4",
      name: "Full Interactive UI & Recharts",
      status: "Upcoming",
      description:
        "Comprehensive dashboard, Recharts budget analytics, run-of-show timeline editor, RSVP tracker, and end-to-end user workflows.",
      active: false,
      done: false,
    },
  ];

  return (
    <section id="roadmap" className="scroll-mt-24 py-16 border-t border-slate-800/80">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2">
          Methodical Delivery
        </h2>
        <h3 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Deployment-First Roadmap
        </h3>
        <p className="mt-3 text-slate-400 text-base">
          De-risking the project by securing production CI/CD from day one, followed by strict step-by-step feature integration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`rounded-2xl p-5 border transition-all ${
              step.active
                ? "bg-indigo-950/20 border-indigo-500/50 shadow-lg shadow-indigo-900/20 ring-1 ring-indigo-500/30"
                : "bg-slate-900/30 border-slate-800/80"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-indigo-400">
                {step.phase}
              </span>
              {step.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : step.active ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Active
                </span>
              ) : (
                <Clock className="w-4 h-4 text-slate-600" />
              )}
            </div>
            <h4 className="text-base font-bold text-white mb-2">{step.name}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      <div id="architecture" className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/30 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center flex-shrink-0 text-violet-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Strict Quality Contract</h4>
            <p className="mt-1 text-sm text-slate-400 leading-relaxed">
              No mock data masquerading as real services. No client-side secret leakage. All financial numbers and dates are computed with deterministic application code, while Gemini AI provides structured creative logic.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
