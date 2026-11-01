"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Calculator,
  Clock,
  Plus,
  Trash2,
  Share2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface TimelineItem {
  id: string;
  time: string;
  title: string;
  notes: string;
}

export default function PlanEventPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [title, setTitle] = useState("Serena & Liam's Sunset Wedding");
  const [category, setCategory] = useState("wedding");
  const [date, setDate] = useState("2026-09-18");
  const [guestCount, setGuestCount] = useState(120);
  const [location, setLocation] = useState("Napa Valley, CA");

  // Financial & Priorities
  const [totalBudget, setTotalBudget] = useState(25000);
  const [contingencyPct, setContingencyPct] = useState(10);
  const [topPriority, setTopPriority] = useState<"catering" | "venue" | "entertainment" | "decor">("catering");

  // Custom Timeline Items
  const [timeline, setTimeline] = useState<TimelineItem[]>([
    { id: "1", time: "14:00", title: "Vendor Load-in & Floral Setup", notes: "Main Pavilion access opens" },
    { id: "2", time: "16:30", title: "Guest Welcome & Refreshments", notes: "Acoustic duo begins in courtyard" },
    { id: "3", time: "17:15", title: "Celebration Ceremony", notes: "Photographer & videographer in place" },
    { id: "4", time: "18:15", title: "Cocktail Hour & Passed Hors d'oeuvres", notes: "Bar opens, photo session" },
    { id: "5", time: "19:30", title: "Dinner Reception & Speeches", notes: "Seated three-course meal" },
    { id: "6", time: "21:30", title: "Dancing & Evening Festivities", notes: "DJ set begins, dessert table" },
  ]);

  const [newTime, setNewTime] = useState("");
  const [newTitle, setNewTitle] = useState("");

  // Deterministic mathematical budget calculation
  const contingencyAmount = Math.round((totalBudget * contingencyPct) / 100);
  const spendableBudget = totalBudget - contingencyAmount;

  // Weightings based on priority
  const weights = {
    catering: { venue: 0.32, catering: 0.40, entertainment: 0.12, photography: 0.10, decor: 0.06 },
    venue: { venue: 0.42, catering: 0.32, entertainment: 0.11, photography: 0.09, decor: 0.06 },
    entertainment: { venue: 0.30, catering: 0.32, entertainment: 0.22, photography: 0.10, decor: 0.06 },
    decor: { venue: 0.30, catering: 0.32, entertainment: 0.12, photography: 0.10, decor: 0.16 },
  }[topPriority];

  const allocations = [
    { name: "Venue & Rentals", pct: Math.round(weights.venue * 100), amount: Math.round(spendableBudget * weights.venue) },
    { name: "Catering, Bar & Service", pct: Math.round(weights.catering * 100), amount: Math.round(spendableBudget * weights.catering) },
    { name: "Entertainment & Sound", pct: Math.round(weights.entertainment * 100), amount: Math.round(spendableBudget * weights.entertainment) },
    { name: "Photography & Videography", pct: Math.round(weights.photography * 100), amount: Math.round(spendableBudget * weights.photography) },
    { name: "Decor, Florals & Lighting", pct: Math.round(weights.decor * 100), amount: Math.round(spendableBudget * weights.decor) },
    { name: "Contingency Reserve", pct: contingencyPct, amount: contingencyAmount },
  ];

  const calculatedSum = allocations.reduce((acc, curr) => acc + curr.amount, 0);
  const costPerGuest = guestCount > 0 ? Math.round(totalBudget / guestCount) : 0;

  function handleAddTimeline() {
    if (!newTime || !newTitle) return;
    setTimeline([
      ...timeline,
      { id: Date.now().toString(), time: newTime, title: newTitle, notes: "Custom milestone" },
    ]);
    setNewTime("");
    setNewTitle("");
  }

  function handleRemoveTimeline(id: string) {
    setTimeline(timeline.filter((item) => item.id !== id));
  }

  return (
    <div className="min-h-screen bg-warmth-50 text-navy-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-navy-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="font-bold text-sm text-navy-900">EventPilot Planner</span>
          </div>
          <Badge variant="indigo" size="sm">
            Interactive Studio
          </Badge>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        {/* Step Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-3">
            <span className={step >= 1 ? "text-brand-600" : ""}>1. Celebration Profile</span>
            <span className={step >= 2 ? "text-brand-600" : ""}>2. Budget &amp; Priorities</span>
            <span className={step >= 3 ? "text-brand-600" : ""}>3. Generated Blueprint</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 transition-all duration-300"
              style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
            />
          </div>
        </div>

        {/* STEP 1: Celebration Profile */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                Tell us about your celebration
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Define the baseline vision. We will compute realistic financial splits and run-of-show logistics.
              </p>
            </div>

            <Card>
              <CardContent className="space-y-5 pt-6">
                <Input
                  label="Event Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Maya's 30th Rooftop Gala"
                  helperText="Give your celebration a distinctive name."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Event Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="wedding">Wedding &amp; Reception</option>
                    <option value="birthday">Milestone Birthday</option>
                    <option value="corporate">Corporate Gala &amp; Summit</option>
                    <option value="anniversary">Anniversary Celebration</option>
                    <option value="conference">Conference &amp; Workshop</option>
                    <option value="social">Private Dinner &amp; Social Gathering</option>
                  </Select>

                  <Input
                    label="Target Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Estimated Guest Count"
                    type="number"
                    min="5"
                    max="5000"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    helperText="Used to compute per-guest catering and rental ratios."
                  />

                  <Input
                    label="Location / Region"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Austin, TX or Chicago Downtown"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button size="lg" onClick={() => setStep(2)}>
                Continue to Budget &amp; Scale
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Budget & Priorities */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                Establish deterministic financial parameters
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Every calculation is mathematically bound in application code. No AI arithmetic hallucinations.
              </p>
            </div>

            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label="Total Budget ($ USD)"
                      type="number"
                      step="500"
                      min="500"
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(Number(e.target.value))}
                      helperText="Total target spend including all taxes and tips."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Contingency Buffer ({contingencyPct}%)
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      step="1"
                      value={contingencyPct}
                      onChange={(e) => setContingencyPct(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600 mt-3"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>5% (Tight)</span>
                      <span className="font-semibold text-brand-600">${contingencyAmount.toLocaleString()} Reserve</span>
                      <span>20% (Conservative)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Primary Experience Focus
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Select where you want to lean your budget weighting.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: "catering", label: "Catering & Bar", desc: "Top culinary experience" },
                      { key: "venue", label: "Venue & Atmosphere", desc: "Iconic space & scenic views" },
                      { key: "entertainment", label: "Music & Party", desc: "Live band & high energy" },
                      { key: "decor", label: "Decor & Floral", desc: "Statement visual aesthetics" },
                    ].map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setTopPriority(p.key as typeof topPriority)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          topPriority === p.key
                            ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="text-xs font-bold text-navy-900">{p.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instant Financial KPI Card */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-[11px] text-slate-500">Spendable Budget</div>
                    <div className="text-base font-bold text-navy-900 mt-0.5">
                      ${spendableBudget.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Contingency Reserve</div>
                    <div className="text-base font-bold text-amber-700 mt-0.5">
                      ${contingencyAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Est. Spend / Guest</div>
                    <div className="text-base font-bold text-brand-700 mt-0.5">
                      ${costPerGuest.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button size="lg" onClick={() => setStep(3)}>
                Synthesize Blueprint
                <Sparkles className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Generated Blueprint */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header banner */}
            <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-r from-brand-50/90 via-indigo-50/40 to-white p-6 sm:p-8 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="indigo" size="sm">
                      {category.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-500">• {date}</span>
                    <span className="text-xs text-slate-500">• {location}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
                    {title}
                  </h1>
                  <p className="text-xs text-slate-600 mt-1">
                    Computed for {guestCount} guests at ${totalBudget.toLocaleString()} total budget (${costPerGuest}/guest).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                        title, category, date, guestCount, location, totalBudget, contingencyPct, allocations, timeline
                      }, null, 2));
                      const downloadAnchor = document.createElement("a");
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, "-")}-plan.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1" />
                    Export Plan JSON
                  </Button>
                  <Button size="sm" onClick={() => setStep(2)}>
                    Refine Parameters
                  </Button>
                </div>
              </div>
            </div>

            {/* Split Grid: Budget Allocation & Run-of-Show */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Deterministic Budget Allocation */}
              <div className="lg:col-span-6 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-brand-600" />
                        <CardTitle>Deterministic Budget Breakdown</CardTitle>
                      </div>
                      <Badge variant="success" size="sm">
                        Balanced (100%)
                      </Badge>
                    </div>
                    <CardDescription>
                      Category caps mathematically computed from your ${totalBudget.toLocaleString()} target.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {allocations.map((a, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">{a.name}</span>
                          <span className="font-mono text-navy-900">
                            ${a.amount.toLocaleString()} <span className="text-slate-400">({a.pct}%)</span>
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              a.name.includes("Contingency")
                                ? "bg-amber-500"
                                : "bg-brand-600"
                            }`}
                            style={{ width: `${a.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="pt-3 border-t border-slate-100 flex justify-between text-xs font-bold text-navy-900">
                      <span>Total Mathematical Sum:</span>
                      <span>${calculatedSum.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Cloud Database Notice */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3 shadow-subtle">
                  <Info className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-navy-900">Architecture Persistence Note</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      This plan was synthesized in-memory. In Phase 3, this plan will persist to your Supabase PostgreSQL database tables with Row Level Security.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Run-of-Show Timeline */}
              <div className="lg:col-span-6 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-brand-600" />
                        <CardTitle>Run-of-Show Agenda</CardTitle>
                      </div>
                      <Badge variant="outline" size="sm">
                        {timeline.length} Milestones
                      </Badge>
                    </div>
                    <CardDescription>
                      Chronological day-of schedule for vendors, staff, and guests.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add Milestone Form */}
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="text-xs font-semibold text-slate-700">Add Milestone</div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="HH:MM (e.g. 20:45)"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                        <input
                          type="text"
                          placeholder="Milestone title (e.g. Cake Cutting)"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                        <Button size="sm" type="button" aria-label="Add milestone" onClick={handleAddTimeline}>
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Timeline List */}
                    <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200">
                      {timeline.map((item) => (
                        <div key={item.id} className="relative flex items-start gap-4 group">
                          <div className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-xs font-mono font-bold text-brand-700 flex-shrink-0 shadow-subtle z-10">
                            {item.time}
                          </div>
                          <div className="flex-1 rounded-xl border border-slate-200/80 bg-white p-3 shadow-subtle group-hover:border-slate-300 transition-colors">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-navy-900">{item.title}</h4>
                              <button
                                onClick={() => handleRemoveTimeline(item.id)}
                                aria-label="Delete milestone"
                                className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{item.notes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
