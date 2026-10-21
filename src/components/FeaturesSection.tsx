import { Sparkles, Calculator, Users, Database, ArrowRight } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      title: "Gemini AI Event Architect",
      badge: "Prompt Wars Challenge 5",
      description:
        "Generates tailored multi-phase timelines, bespoke celebration themes, run-of-show agendas, and vendor recommendations validated against strict JSON schemas.",
      icon: Sparkles,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    },
    {
      title: "Deterministic Budget Optimization",
      badge: "Zero Math Hallucinations",
      description:
        "Rigorous financial calculations performed deterministically in TypeScript code — categorizing deposits, pending payments, contingency buffers, and actual variance.",
      icon: Calculator,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Smart Guest & RSVP Orchestration",
      badge: "Real-time Tracking",
      description:
        "Live RSVP counters, dietary restrictions breakdown, plus-one tracking, and table assignments with dynamic updates.",
      icon: Users,
      color: "from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30",
    },
    {
      title: "PostgreSQL Cloud Persistence",
      badge: "Supabase Relational DB",
      description:
        "No mock data, no volatile local state. Production-grade relational schemas for events, budget line items, vendors, and guests with Row Level Security (RLS).",
      icon: Database,
      color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
    },
  ];

  return (
    <section id="features" className="scroll-mt-24 py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2">
          Architecture & Product Blueprint
        </h2>
        <h3 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Everything required to plan unforgettable celebrations
        </h3>
        <p className="mt-3 text-slate-400 text-base">
          Built with real engineering principles: structured AI outputs, deterministic arithmetic, and persistent cloud storage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="group relative rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 hover:border-slate-700 hover:bg-slate-900/70 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border bg-gradient-to-br ${f.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {f.badge}
                </span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                {f.title}
              </h4>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                {f.description}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center text-xs text-indigo-400 font-medium group-hover:translate-x-1 transition-transform">
                <span>Phase Integration Blueprint</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
