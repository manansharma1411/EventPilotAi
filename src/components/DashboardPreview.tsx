"use client";

import { useState } from "react";
import {
  Users,
  DollarSign,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "budget" | "guests">("overview");

  return (
    <section id="preview" className="scroll-mt-24 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="indigo" size="sm" className="mb-3">
            Product Architecture Preview
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            The celebration control center
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Engineered for high-stakes events. Every milestone, dollar, and vendor synchronized with zero hallucinated data.
          </p>
        </div>

        {/* Dashboard Shell with Real UI Components */}
        <div className="rounded-3xl border border-slate-200/90 bg-white shadow-dropdown overflow-hidden">
          {/* Dashboard Topbar */}
          <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                EP
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-navy-900">
                    Elena &amp; Marcus — Modern Garden Wedding
                  </h3>
                  <Badge variant="success" size="sm">
                    Confirmed
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Sept 26, 2026 • Sonoma Valley Estate • 140 Expected Guests
                </p>
              </div>
            </div>

            {/* Clearly labeled preview pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Interactive UI Engine Preview</span>
            </div>
          </div>

          {/* Interactive Tab Navigation */}
          <div className="flex border-b border-slate-200 px-6 gap-2 sm:gap-6 bg-white overflow-x-auto">
            {[
              { id: "overview", label: "Overview & Analytics" },
              { id: "timeline", label: "Run-of-Show Schedule" },
              { id: "budget", label: "Deterministic Budget" },
              { id: "guests", label: "RSVP & Dietary Tracking" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-3.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-slate-500 hover:text-navy-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="p-6 sm:p-8 bg-warmth-50/50">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* 4 Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Total Budget</span>
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-navy-900 mt-1">
                      $45,000
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium mt-1">
                      $4,500 Contingency (10%)
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Committed Spend</span>
                      <CheckCircle2 className="w-4 h-4 text-brand-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-navy-900 mt-1">
                      $38,200
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      $6,800 Unallocated Buffer
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>RSVP Confirmed</span>
                      <Users className="w-4 h-4 text-violet-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-navy-900 mt-1">
                      118 / 140
                    </div>
                    <div className="text-[11px] text-violet-700 font-medium mt-1">
                      84% Attendance rate
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Schedule Milestones</span>
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-navy-900 mt-1">
                      14 Events
                    </div>
                    <div className="text-[11px] text-amber-700 font-medium mt-1">
                      Run-of-show locked
                    </div>
                  </div>
                </div>

                {/* Next Up in Schedule & AI Recommendation Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-sm text-navy-900">
                        Upcoming Day-of Milestones
                      </h4>
                      <Badge variant="outline" size="sm">
                        Day-of Preview
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {[
                        { time: "13:30", title: "Photographer & Bridal Party First Look", lead: "Marcus B. (Photo Lead)" },
                        { time: "15:00", title: "Catering Staff Briefing & Bar Prep", lead: "Chef Jean (Artisan Catering)" },
                        { time: "16:15", title: "Guest Seating & Welcome Prosecco", lead: "Coordination Team" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200/60">
                              {item.time}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-navy-900">{item.title}</p>
                              <p className="text-[11px] text-slate-500">{item.lead}</p>
                            </div>
                          </div>
                          <span className="text-xs text-emerald-600 font-semibold">Scheduled</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-5 rounded-2xl border border-brand-200/90 bg-gradient-to-br from-brand-50/70 via-white to-white p-6 shadow-subtle">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-brand-600" />
                      <h4 className="font-bold text-sm text-navy-900">
                        Gemini AI Architect Insight
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      “Based on sunset at 18:42, schedule golden-hour portraits strictly between 18:05 and 18:35 before commencement of the sit-down dinner service.”
                    </p>
                    <div className="pt-3 border-t border-brand-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Schema: EventScheduleOptimization</span>
                      <span className="text-brand-600 font-semibold">Zod Validated</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TIMELINE TAB */}
            {activeTab === "timeline" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-navy-900">
                    Full Day-of Chronological Run-of-Show
                  </h4>
                  <span className="text-xs text-slate-500">All times local PDT</span>
                </div>
                <div className="space-y-3">
                  {[
                    { time: "11:00", title: "Venue Access & Floral Installation", role: "Florist & Rigging", status: "Confirmed" },
                    { time: "13:00", title: "Sound Check & A/V Lighting Balancing", role: "Sound Tech", status: "Confirmed" },
                    { time: "14:30", title: "Hair & Makeup Touch-ups", role: "Styling Team", status: "Confirmed" },
                    { time: "16:30", title: "Ceremony Processional Commences", role: "Officiant & Quartet", status: "Locked" },
                    { time: "17:30", title: "Passed Canapés & Cocktail Reception", role: "Catering Crew", status: "Locked" },
                    { time: "19:00", title: "Grand Entrance & Welcome Speeches", role: "MC & Hosts", status: "Locked" },
                    { time: "20:30", title: "Cake Cutting & Live Band First Set", role: "Band & Pastry Chef", status: "Confirmed" },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white shadow-subtle"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-navy-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          {row.time}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-navy-900">{row.title}</p>
                          <p className="text-[11px] text-slate-500">{row.role}</p>
                        </div>
                      </div>
                      <Badge variant="indigo" size="sm">
                        {row.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BUDGET TAB */}
            {activeTab === "budget" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">
                      Deterministic Budget Distribution &amp; Actuals
                    </h4>
                    <p className="text-xs text-slate-500">Computed via strict application arithmetic</p>
                  </div>
                  <Badge variant="success" size="sm">
                    Variance: +$6,800 Under
                  </Badge>
                </div>
                <div className="space-y-3">
                  {[
                    { category: "Estate Venue & Structural Rentals", allocated: 15000, committed: 14500, pct: 33 },
                    { category: "Artisan Catering & Premium Open Bar", allocated: 16000, committed: 15200, pct: 35 },
                    { category: "Live 6-Piece Brass & DJ Entertainment", allocated: 5500, committed: 5000, pct: 12 },
                    { category: "Editorial Photography & Cinema", allocated: 4500, committed: 4500, pct: 10 },
                    { category: "Contingency & Incidentals (10%)", allocated: 4500, committed: 0, pct: 10 },
                  ].map((cat, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-subtle">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-navy-900">{cat.category}</span>
                        <span className="font-mono text-slate-700">
                          ${cat.committed.toLocaleString()} / ${cat.allocated.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-600 rounded-full"
                          style={{ width: `${(cat.committed / cat.allocated) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GUESTS TAB */}
            {activeTab === "guests" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-navy-900">
                    Live RSVP &amp; Dietary Requirements Breakdown
                  </h4>
                  <span className="text-xs text-slate-500">118 Confirmed Guests</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white text-center">
                    <div className="text-xs text-slate-500">Vegetarian / Vegan</div>
                    <div className="text-xl font-bold text-navy-900 mt-1">24 Guests</div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-white text-center">
                    <div className="text-xs text-slate-500">Gluten-Free Required</div>
                    <div className="text-xl font-bold text-navy-900 mt-1">9 Guests</div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-white text-center">
                    <div className="text-xs text-slate-500">Children / Minor Meals</div>
                    <div className="text-xl font-bold text-navy-900 mt-1">6 Guests</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
