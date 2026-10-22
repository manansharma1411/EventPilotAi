"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowLeft, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { VALID_EVENT_TYPES, VALID_CURRENCIES, validateEventInput } from "@/lib/validation/event";
import type { EventType } from "@/types";

export default function NewEventPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<EventType>("wedding");
  const [eventDate, setEventDate] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [location, setLocation] = useState("");
  const [guestCount, setGuestCount] = useState<number>(100);
  const [totalBudget, setTotalBudget] = useState<number>(15000);
  const [currency, setCurrency] = useState("USD");
  const [theme, setTheme] = useState("");
  
  // Preferences State
  const [dietaryOptions, setDietaryOptions] = useState<string[]>([]);
  const [dietaryInput, setDietaryInput] = useState("");
  const [accessibilityOptions, setAccessibilityOptions] = useState<string[]>([]);
  const [accessibilityInput, setAccessibilityInput] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const addDietary = () => {
    if (dietaryInput.trim() && !dietaryOptions.includes(dietaryInput.trim())) {
      setDietaryOptions([...dietaryOptions, dietaryInput.trim()]);
      setDietaryInput("");
    }
  };

  const removeDietary = (item: string) => {
    setDietaryOptions(dietaryOptions.filter((d) => d !== item));
  };

  const addAccessibility = () => {
    if (accessibilityInput.trim() && !accessibilityOptions.includes(accessibilityInput.trim())) {
      setAccessibilityOptions([...accessibilityOptions, accessibilityInput.trim()]);
      setAccessibilityInput("");
    }
  };

  const removeAccessibility = (item: string) => {
    setAccessibilityOptions(accessibilityOptions.filter((a) => a !== item));
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!title.trim() || title.length < 3) errors.title = "Title must be at least 3 characters";
    if (!eventDate) errors.eventDate = "Please choose a valid event date";
    if (!location.trim()) errors.location = "Please provide an event location/venue";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!guestCount || guestCount < 1) errors.guestCount = "Guest count must be at least 1";
    if (totalBudget === undefined || totalBudget < 0) errors.totalBudget = "Budget must be a positive number";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFormErrors({});

    const payload = {
      title,
      event_type: eventType,
      event_date: eventDate,
      timezone,
      location,
      guest_count: Number(guestCount),
      total_budget: Number(totalBudget),
      currency,
      theme: theme.trim() || undefined,
      preferences: {
        dietary_requirements: dietaryOptions.length > 0 ? dietaryOptions : undefined,
        accessibility_requirements: accessibilityOptions.length > 0 ? accessibilityOptions : undefined,
        special_instructions: specialInstructions.trim() || undefined,
      },
    };

    // Client-side validation check
    const clientVal = validateEventInput(payload);
    if (!clientVal.success && clientVal.errors) {
      const errMap: Record<string, string> = {};
      clientVal.errors.forEach((err) => {
        errMap[err.field] = err.message;
      });
      setFormErrors(errMap);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setGeneralError("Please sign in or create an account to save your event to the database.");
          setTimeout(() => router.push("/login"), 2000);
          return;
        }
        throw new Error(data.error || "Failed to create event");
      }

      // Success -> Redirect directly to the event workspace
      router.push(`/events/${data.event.id}`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error creating event";
      setGeneralError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-warmth-50 text-navy-900 pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-navy-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Wizard Step {step} of 3</span>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    s === step ? "bg-brand-600 ring-2 ring-brand-200" : s < step ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Wizard Form */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Event Creation Wizard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Create Your Next Celebration
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Provide the foundational parameters. EventPilot will generate structured task checklists and budget allocations.
          </p>
        </div>

        {generalError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3 shadow-subtle">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Submission Error</p>
              <p className="mt-0.5">{generalError}</p>
            </div>
          </div>
        )}

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            {/* STEP 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-navy-900 mb-1">Step 1: Event Identity & Venue</h2>
                  <p className="text-xs text-slate-500">Define what you are celebrating and where it will happen.</p>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Event Title"
                    placeholder="e.g. Elena & Marcus Summer Wedding"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    error={formErrors.title}
                    required
                  />

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Event Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {VALID_EVENT_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setEventType(type)}
                          className={`p-3 rounded-xl border text-xs font-bold text-left capitalize transition-all ${
                            eventType === type
                              ? "border-brand-600 bg-brand-50 text-brand-900 shadow-sm ring-1 ring-brand-500"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Event Date"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      error={formErrors.eventDate}
                      required
                    />

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1.5">
                        Timezone
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="UTC">UTC (Universal Coordinated Time)</option>
                        <option value="America/New_York">Eastern Time (US / Canada)</option>
                        <option value="America/Chicago">Central Time (US / Canada)</option>
                        <option value="America/Denver">Mountain Time (US / Canada)</option>
                        <option value="America/Los_Angeles">Pacific Time (US / Canada)</option>
                        <option value="Europe/London">London (GMT / BST)</option>
                        <option value="Europe/Paris">Paris, Berlin, Rome (CET)</option>
                        <option value="Asia/Kolkata">India Standard Time (IST)</option>
                        <option value="Asia/Tokyo">Tokyo, Japan (JST)</option>
                        <option value="Australia/Sydney">Sydney, Australia (AEST)</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Location / Venue Name & City"
                    placeholder="e.g. The Glasshouse, New York, NY"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    error={formErrors.location}
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="button" onClick={handleNext} size="md">
                    Continue to Budget & Guests &rarr;
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Scale & Budget */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-navy-900 mb-1">Step 2: Guest Count & Budget</h2>
                  <p className="text-xs text-slate-500">Estimate the scale so we can calculate per-guest expenditure.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Estimated Guest Count"
                    type="number"
                    min="1"
                    max="100000"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    error={formErrors.guestCount}
                    required
                  />

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {VALID_CURRENCIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Total Planned Budget"
                  type="number"
                  min="0"
                  step="100"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  error={formErrors.totalBudget}
                  required
                />

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Calculated Budget Per Guest:</span>
                  <span className="font-mono font-bold text-brand-700 text-sm">
                    {currency} {guestCount > 0 ? (totalBudget / guestCount).toFixed(2) : "0.00"} / guest
                  </span>
                </div>

                <Input
                  label="Theme / Visual Aesthetic (Optional)"
                  placeholder="e.g. Modern Minimalist, Rustic Barn, Cyberpunk Neon"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                />

                <div className="pt-4 flex items-center justify-between">
                  <Button type="button" variant="outline" onClick={handleBack} size="md">
                    &larr; Back
                  </Button>
                  <Button type="button" onClick={handleNext} size="md">
                    Continue to Preferences &rarr;
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Preferences, Requirements & Review */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-navy-900 mb-1">Step 3: Requirements & Preferences</h2>
                  <p className="text-xs text-slate-500">Dietary needs, accessibility accommodations, and specific notes.</p>
                </div>

                {/* Dietary Tags */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">
                    Dietary Requirements
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="e.g. Vegan, Halal, Gluten-Free"
                      value={dietaryInput}
                      onChange={(e) => setDietaryInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDietary(); } }}
                      className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <Button type="button" size="sm" variant="outline" onClick={addDietary}>
                      Add Tag
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dietaryOptions.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-800 text-xs font-medium"
                      >
                        {item}
                        <button type="button" onClick={() => removeDietary(item)} className="text-brand-400 hover:text-brand-900">
                          &times;
                        </button>
                      </span>
                    ))}
                    {dietaryOptions.length === 0 && (
                      <span className="text-xs text-slate-400 italic">No dietary constraints added</span>
                    )}
                  </div>
                </div>

                {/* Accessibility Tags */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">
                    Accessibility Accommodations
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="e.g. Wheelchair Ramp, Hearing Loop, Ground Floor Only"
                      value={accessibilityInput}
                      onChange={(e) => setAccessibilityInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAccessibility(); } }}
                      className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <Button type="button" size="sm" variant="outline" onClick={addAccessibility}>
                      Add Tag
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {accessibilityOptions.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium"
                      >
                        {item}
                        <button type="button" onClick={() => removeAccessibility(item)} className="text-emerald-400 hover:text-emerald-900">
                          &times;
                        </button>
                      </span>
                    ))}
                    {accessibilityOptions.length === 0 && (
                      <span className="text-xs text-slate-400 italic">No accessibility accommodations specified</span>
                    )}
                  </div>
                </div>

                {/* Additional Instructions */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">
                    Special Instructions & Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide any additional context or priorities for this event..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Summary Card */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2 text-xs">
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                    <span>Review Plan Overview</span>
                  </div>
                  <p className="text-indigo-900">
                    <strong>{title}</strong> ({eventType}) on <strong>{eventDate || "TBD"}</strong> in {location || "TBD"}.
                  </p>
                  <p className="text-indigo-800">
                    Targeting <strong>{guestCount} guests</strong> with a total budget of{" "}
                    <strong>{currency} {Number(totalBudget).toLocaleString()}</strong>.
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <Button type="button" variant="outline" onClick={handleBack} size="md">
                    &larr; Back
                  </Button>
                  <Button type="submit" size="md" isLoading={isSubmitting} className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Create & Save Event</span>
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>
      </main>
    </div>
  );
}
