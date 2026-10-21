import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SamplePlanSection() {
  const sampleAllocations = [
    { category: "Waterfront Glass Pavilion Venue", allocated: 12500, spent: 12500, status: "Contract Signed" },
    { category: "Four-Course Farm-to-Table Dinner & Bar", allocated: 14000, spent: 13800, status: "Deposit Paid" },
    { category: "Stage Rigging, Concert Audio & Lighting", allocated: 4800, spent: 4800, status: "Contract Signed" },
    { category: "Keynote Recording & Photo Coverage", allocated: 3200, spent: 3000, status: "Contract Signed" },
    { category: "Contingency & Incidentals (10%)", allocated: 3500, spent: 0, status: "Reserved" },
  ];

  const totalAllocated = sampleAllocations.reduce((acc, curr) => acc + curr.allocated, 0);
  const totalSpent = sampleAllocations.reduce((acc, curr) => acc + curr.spent, 0);
  const remainingBuffer = totalAllocated - totalSpent;

  return (
    <section id="sample-plan" className="scroll-mt-24 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="indigo" size="sm" className="mb-3">
            Real-World Architecture Demonstration
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            Example Event Blueprint
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Inspect a complete event plan generated and calculated using our deterministic engine.
          </p>
        </div>

        {/* Prominent Demo Notice */}
        <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50/80 p-4 sm:p-5 flex items-start gap-3.5 shadow-subtle">
          <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Architectural Sample Plan Notice:</span> The figures, vendor line items, and schedule below represent realistic sample content for structural evaluation. Real event plans persist directly into your isolated Supabase PostgreSQL database tables with strict Row Level Security.
          </div>
        </div>

        {/* Example Event Plan Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-card">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="default" size="sm">
                  Corporate Gala
                </Badge>
                <span className="text-xs text-slate-500">• October 14, 2026</span>
                <span className="text-xs text-slate-500">• Waterfront Marina Pavilion, Seattle</span>
              </div>
              <h3 className="text-2xl font-bold text-navy-900">
                Veritas AI Annual Innovation Gala 2026
              </h3>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 self-start sm:self-auto">
              <div>
                <span className="text-slate-500">Guests: </span>
                <span className="font-bold text-navy-900">180 Confirmed</span>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                <span className="text-slate-500">Cost/Guest: </span>
                <span className="font-bold text-emerald-700">${Math.round(totalAllocated / 180)}</span>
              </div>
            </div>
          </div>

          {/* Plan Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
            {/* Left: Financial Ledger */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-navy-900">
                  Deterministic Budget Allocation Table
                </h4>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Buffer Remaining: ${remainingBuffer.toLocaleString()}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3.5">Category</th>
                      <th className="py-2.5 px-3.5">Allocated</th>
                      <th className="py-2.5 px-3.5">Committed</th>
                      <th className="py-2.5 px-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sampleAllocations.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3.5 font-medium text-navy-900">{item.category}</td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-700">${item.allocated.toLocaleString()}</td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-900 font-semibold">${item.spent.toLocaleString()}</td>
                        <td className="py-2.5 px-3.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50/80 font-bold text-navy-900 border-t border-slate-200">
                    <tr>
                      <td className="py-2.5 px-3.5">Total Mathematical Sum</td>
                      <td className="py-2.5 px-3.5 font-mono">${totalAllocated.toLocaleString()}</td>
                      <td className="py-2.5 px-3.5 font-mono">${totalSpent.toLocaleString()}</td>
                      <td className="py-2.5 px-3.5 text-emerald-700">Zero Overrun</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Right: Chronological Schedule */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="text-sm font-bold text-navy-900">
                Day-of Run-of-Show Agenda
              </h4>
              <div className="space-y-2.5">
                {[
                  { time: "15:00", title: "A/V Soundcheck & Keynote Stage Setup", status: "Rigging Team" },
                  { time: "17:30", title: "Registration Desk & Welcome Cocktails", status: "Greeters" },
                  { time: "18:45", title: "Opening Remarks & Annual Keynote", status: "Executive Stage" },
                  { time: "19:45", title: "Four-Course Dinner & Wine Pairings", status: "Catering Crew" },
                  { time: "21:15", title: "Excellence Awards & Networking Mixer", status: "Live Quartet" },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-brand-700">{s.time}</span>
                      <span className="font-semibold text-navy-900">{s.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
