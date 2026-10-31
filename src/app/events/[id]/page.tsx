"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  DollarSign,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit3,
  Bot,
  Layers,
  ShoppingBag,
  ListTodo,
  PieChart,
  ShieldAlert,
  Save,
  X,
  AlertCircle,
  RefreshCw,
  Send,
  Lightbulb,
  AlertTriangle,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EventRecord, TaskRecord, BudgetItemRecord, EventVendorRecord } from "@/types";
import type { GeneratedEventPlan } from "@/lib/ai/schemas";
import { SmartBudgetWorkspace } from "@/components/SmartBudgetWorkspace";
import { InteractiveTaskWorkspace } from "@/components/InteractiveTaskWorkspace";
import { InteractiveTimelineWorkspace } from "@/components/InteractiveTimelineWorkspace";
import { AICopilotPanel } from "@/components/AICopilotPanel";
import { VendorWorkspace } from "@/components/VendorWorkspace";

interface WorkspaceProps {
  params: Promise<{ id: string }>;
}

export default function EventWorkspacePage({ params }: WorkspaceProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data state
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItemRecord[]>([]);
  const [eventVendors, setEventVendors] = useState<EventVendorRecord[]>([]);

  // AI Plan State
  const [aiPlan, setAiPlan] = useState<GeneratedEventPlan | null>(null);
  const [planVersion, setPlanVersion] = useState<number>(0);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planGenError, setPlanGenError] = useState<string | null>(null);
  const [revisionInstruction, setRevisionInstruction] = useState("");
  const [isRevising, setIsRevising] = useState(false);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<"overview" | "budget" | "timeline" | "tasks" | "vendors" | "ai_planner">("overview");

  // Edit Event State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editGuestCount, setEditGuestCount] = useState<number>(0);
  const [editBudget, setEditBudget] = useState<number>(0);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // New Task State
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch event data and latest plan
  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [eventRes, planRes] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch(`/api/events/${eventId}/plan`),
      ]);

      const eventData = await eventRes.json();
      if (!eventRes.ok) throw new Error(eventData.error || "Failed to load event.");

      setEvent(eventData.event);
      setTasks(eventData.tasks || []);
      setBudgetItems(eventData.budget_items || []);
      setEventVendors(eventData.event_vendors || []);

      if (planRes.ok) {
        const planData = await planRes.json();
        if (planData.latestPlan) {
          setAiPlan(planData.latestPlan);
          setPlanVersion(planData.versionNumber || 1);
        }
      }

      // Populate edit states
      setEditTitle(eventData.event.title);
      setEditLocation(eventData.event.location);
      setEditDate(eventData.event.event_date);
      setEditGuestCount(eventData.event.guest_count);
      setEditBudget(Number(eventData.event.total_budget));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error loading event workspace";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  // Handle AI Plan Generation
  const handleGeneratePlan = async () => {
    try {
      setIsGeneratingPlan(true);
      setPlanGenError(null);

      const res = await fetch(`/api/events/${eventId}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to synthesize event blueprint");
      }

      setAiPlan(data.plan);
      setPlanVersion(data.version);
      // Refresh event items (tasks and budget were synchronized to the DB)
      fetchEvent();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error during AI generation";
      setPlanGenError(msg);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Handle AI Plan Revision
  const handleRevisePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionInstruction.trim()) return;

    try {
      setIsRevising(true);
      setPlanGenError(null);

      const res = await fetch(`/api/events/${eventId}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isRevision: true,
          userInstruction: revisionInstruction.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to apply plan revision");
      }

      setAiPlan(data.plan);
      setPlanVersion(data.version);
      setRevisionInstruction("");
      fetchEvent();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error revising plan";
      setPlanGenError(msg);
    } finally {
      setIsRevising(false);
    }
  };

  // Handle Edit Submit
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    try {
      setIsSavingEdit(true);
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          event_type: event.event_type,
          event_date: editDate,
          timezone: event.timezone,
          location: editLocation,
          guest_count: Number(editGuestCount),
          total_budget: Number(editBudget),
          currency: event.currency,
          theme: event.theme,
          preferences: event.preferences,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setEvent(data.event);
      setIsEditing(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Delete Event
  const handleDeleteEvent = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete event");
      setIsDeleting(false);
    }
  };

  // Handle Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setIsAddingTask(true);
      const res = await fetch(`/api/events/${eventId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          priority: newTaskPriority,
          status: "todo",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add task");

      setTasks([...tasks, data.task]);
      setNewTaskTitle("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsAddingTask(false);
    }
  };

  // Handle Toggle Task Status
  const handleToggleTask = async (task: TaskRecord) => {
    const nextStatus: TaskRecord["status"] = task.status === "completed" ? "todo" : "completed";

    // Optimistic local update
    const previousTasks = [...tasks];
    setTasks(
      tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      const res = await fetch(`/api/events/${eventId}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          status: nextStatus,
        }),
      });

      if (!res.ok) {
        setTasks(previousTasks);
        alert("Failed to update task status");
      }
    } catch {
      setTasks(previousTasks);
      alert("Network error updating task");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warmth-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading celebration workspace...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !event) {
    return (
      <div className="min-h-screen bg-warmth-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-navy-900">Event Not Found or Access Denied</h2>
          <p className="text-xs text-slate-600">{errorMessage || "You do not have permission to view this event."}</p>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button size="sm">Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const completedTasksCount = tasks.filter((t) => t.status === "completed").length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-warmth-50 text-navy-900 pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-navy-900 tracking-tight leading-tight line-clamp-1">
                  {event.title}
                </h1>
                <Badge variant="indigo" size="sm" className="capitalize hidden sm:inline-flex">
                  {event.event_type}
                </Badge>
                {planVersion > 0 && (
                  <Badge variant="indigo" size="sm">
                    AI Blueprint v{planVersion}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>{event.event_date}</span>
                <span>&bull;</span>
                <span>{event.location}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-1 text-slate-700"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Details</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="gap-1 text-rose-600 hover:bg-rose-50 hover:border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
          <nav className="flex space-x-6 overflow-x-auto text-xs font-semibold py-2">
            {[
              { id: "overview", label: "Overview", icon: Layers },
              { id: "ai_planner", label: "AI Blueprint Generator", icon: Bot },
              { id: "budget", label: `Budget Ledger (${budgetItems.length})`, icon: DollarSign },
              { id: "timeline", label: "Run-of-Show Itinerary", icon: Clock },
              { id: "tasks", label: `Tasks (${completedTasksCount}/${tasks.length})`, icon: ListTodo },
              { id: "vendors", label: `Vendors (${eventVendors.length})`, icon: ShoppingBag },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-1.5 py-1.5 border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? "border-brand-600 text-brand-700"
                      : "border-transparent text-slate-500 hover:text-navy-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4">
                <span className="text-[11px] font-medium text-slate-500">Total Budget</span>
                <p className="text-xl font-extrabold text-navy-900 mt-1 font-mono">
                  {event.currency} {Number(event.total_budget).toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400">Approved allocation</span>
              </Card>

              <Card className="p-4">
                <span className="text-[11px] font-medium text-slate-500">Guest Count</span>
                <p className="text-xl font-extrabold text-navy-900 mt-1">
                  {event.guest_count}
                </p>
                <span className="text-[10px] text-slate-400">
                  ~{event.currency} {event.guest_count > 0 ? (Number(event.total_budget) / event.guest_count).toFixed(0) : 0} per guest
                </span>
              </Card>

              <Card className="p-4">
                <span className="text-[11px] font-medium text-slate-500">Checklist Progress</span>
                <p className="text-xl font-extrabold text-brand-600 mt-1">
                  {progressPercent}%
                </p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-brand-600 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>
              </Card>

              <Card className="p-4">
                <span className="text-[11px] font-medium text-slate-500">Event Date</span>
                <p className="text-sm font-bold text-navy-900 mt-1">
                  {event.event_date}
                </p>
                <span className="text-[10px] text-slate-400">{event.timezone}</span>
              </Card>
            </div>

            {/* AI Summary Highlight Banner if Generated */}
            {aiPlan && (
              <Card className="p-6 bg-gradient-to-r from-brand-50/60 to-indigo-50/60 border-brand-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-600" />
                    <h3 className="text-sm font-bold text-navy-900">AI Celebration Blueprint Summary</h3>
                  </div>
                  <Badge variant="indigo" size="sm">Version {planVersion}</Badge>
                </div>
                <p className="text-xs text-navy-800 leading-relaxed font-medium">
                  {aiPlan.event_summary}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[11px] text-slate-500 font-semibold self-center">Palette:</span>
                  {aiPlan.theme_and_rationale.color_palette.map((color) => (
                    <span key={color} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-700 shadow-sm">
                      {color}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Event Specific Preferences Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>Style, Theme & Logistics</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Theme / Aesthetic:</span>
                    <span className="font-semibold text-navy-900">{event.theme || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Location:</span>
                    <span className="font-semibold text-navy-900">{event.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Dietary Accommodations:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Array.isArray(event.preferences?.dietary_requirements) && (event.preferences.dietary_requirements as string[]).length > 0 ? (
                        (event.preferences.dietary_requirements as string[]).map((d: string) => (
                          <span key={d} className="px-2 py-0.5 rounded bg-brand-50 text-brand-800 text-[11px]">
                            {d}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">None logged</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Accessibility Needs:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Array.isArray(event.preferences?.accessibility_requirements) && (event.preferences.accessibility_requirements as string[]).length > 0 ? (
                        (event.preferences.accessibility_requirements as string[]).map((a: string) => (
                          <span key={a} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px]">
                            {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">None logged</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tasks Quick Peek */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-brand-600" />
                    <span>Immediate Action Items</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab("tasks")}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="space-y-2">
                  {tasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task)}
                      className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white flex items-center gap-3 cursor-pointer transition-colors"
                    >
                      {task.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      )}
                      <span className={`text-xs flex-1 ${task.status === "completed" ? "line-through text-slate-400" : "text-navy-900 font-medium"}`}>
                        {task.title}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        task.priority === "high" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}

                  {tasks.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-4">No tasks logged yet</p>
                  )}
                </div>
              </Card>
            </div>
            {/* AI Copilot Panel */}
            <AICopilotPanel event={event} onChangesApplied={fetchEvent} />
          </div>
        )}
        {/* TAB: AI PLANNER ENGINE */}
        {activeTab === "ai_planner" && (
          <div className="space-y-8">
            {/* Header Action Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-brand-600" />
                  <span>GenAI Event Planning Engine</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Powered by Google Gemini 2.5 Flash. Formulates bespoke budget allocations, run-of-show itineraries, and risk registers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleGeneratePlan}
                  isLoading={isGeneratingPlan}
                  size="md"
                  className="gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{aiPlan ? "Re-Generate Full Plan" : "Generate AI Plan"}</span>
                </Button>
              </div>
            </div>

            {/* Error Notification */}
            {planGenError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3 shadow-subtle">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Generation Error</p>
                  <p>{planGenError}</p>
                  {planGenError.includes("GEMINI_API_KEY") && (
                    <p className="text-[11px] text-rose-700 font-mono mt-1">
                      Tip: Obtain a free key from Google AI Studio and place it in .env.local as GEMINI_API_KEY.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* If No Plan Yet: Empty State */}
            {!aiPlan && !isGeneratingPlan && (
              <Card className="p-10 text-center space-y-4 bg-gradient-to-br from-white to-brand-50/40 border-dashed border-2 border-brand-200">
                <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <Bot className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-navy-900">No AI Blueprint Formulated Yet</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Synthesize an intelligent celebration package tailored to <strong>{event.title}</strong> with exact per-guest budget splits, risk assessments, and logistical milestone schedules.
                </p>
                <div className="pt-2">
                  <Button onClick={handleGeneratePlan} size="lg" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Blueprint with Gemini</span>
                  </Button>
                </div>
              </Card>
            )}

            {/* Loading Skeleton */}
            {isGeneratingPlan && (
              <Card className="p-12 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <h3 className="text-sm font-bold text-navy-900">Synthesizing Celebration Blueprint...</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Gemini 2.5 Flash is calculating category splits, estimating vendor requirements, and constructing your run-of-show timeline.
                </p>
              </Card>
            )}

            {/* Generated Plan Details */}
            {aiPlan && !isGeneratingPlan && (
              <div className="space-y-6">
                {/* 1. Theme, Rationale & Ideas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6 space-y-3">
                    <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-600" />
                      <span>{aiPlan.theme_and_rationale.theme_name}</span>
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {aiPlan.theme_and_rationale.rationale}
                    </p>
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-navy-900 block mb-1.5">Color Palette:</span>
                      <div className="flex flex-wrap gap-2">
                        {aiPlan.theme_and_rationale.color_palette.map((c) => (
                          <span key={c} className="px-2.5 py-1 rounded-lg bg-slate-100 text-navy-900 text-xs font-mono font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-navy-900 block mb-1">Decor Concepts:</span>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                        {aiPlan.theme_and_rationale.decor_ideas.map((idea, i) => (
                          <li key={i}>{idea}</li>
                        ))}
                      </ul>
                    </div>
                  </Card>

                  <Card className="p-6 space-y-3">
                    <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Personalized Celebration Touches</span>
                    </h3>
                    <ul className="text-xs text-slate-600 space-y-2">
                      {aiPlan.personalized_ideas.map((idea, idx) => (
                        <li key={idx} className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100/80 leading-relaxed">
                          {idea}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>

                {/* 2. Risks, Missing Info & Assumptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6 space-y-3">
                    <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Identified Risks & Contingencies</span>
                    </h3>
                    <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                      {aiPlan.risks_and_missing_info.identified_risks.map((risk, idx) => (
                        <li key={idx}>{risk}</li>
                      ))}
                    </ul>
                    {aiPlan.risks_and_missing_info.recommendations.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-navy-900 block mb-1">AI Recommendations:</span>
                        <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                          {aiPlan.risks_and_missing_info.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>

                  <Card className="p-6 space-y-3">
                    <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-600" />
                      <span>Planning Assumptions & Questions</span>
                    </h3>
                    <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                      {aiPlan.planning_assumptions.map((assump, idx) => (
                        <li key={idx}>{assump}</li>
                      ))}
                    </ul>
                    {aiPlan.risks_and_missing_info.missing_information.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-navy-900 block mb-1">Information Needed from Venue/Client:</span>
                        <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                          {aiPlan.risks_and_missing_info.missing_information.map((info, idx) => (
                            <li key={idx}>{info}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                </div>

                {/* 3. Interactive Plan Revision Form */}
                <Card className="p-6 space-y-3 bg-white border-brand-200">
                  <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-brand-600" />
                    <span>Instruct AI to Revise Blueprint</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Need to change the vibe, decrease the catering budget, or adjust for outdoor rain contingencies? Tell Gemini below:
                  </p>
                  <form onSubmit={handleRevisePlan} className="flex gap-2">
                    <Input
                      placeholder="e.g. Shift 5% of catering budget into live acoustic music, and add a cocktail hour..."
                      value={revisionInstruction}
                      onChange={(e) => setRevisionInstruction(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="md" isLoading={isRevising} className="gap-1.5 flex-shrink-0">
                      <Send className="w-4 h-4" />
                      <span>Revise</span>
                    </Button>
                  </form>
                </Card>

                {/* Disclaimer */}
                <p className="text-[11px] text-slate-400 text-center italic">
                  {aiPlan.metadata.unverified_estimates_disclaimer}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SMART BUDGET */}
        {activeTab === "budget" && (
          <SmartBudgetWorkspace
            eventId={event.id}
            totalBudget={Number(event.total_budget)}
            currency={event.currency}
            items={budgetItems}
            onItemsChange={fetchEvent}
          />
        )}

        {/* TAB 3: TIMELINE (Run-of-show & Deadlines) */}
        {activeTab === "timeline" && (
          <InteractiveTimelineWorkspace
            eventDate={event.event_date}
            timezone={event.timezone || "UTC"}
            tasks={tasks}
            itinerary={aiPlan?.suggested_activities || []}
            onNavigateToTasks={() => setActiveTab("tasks")}
          />
        )}

        {/* TAB 4: TASKS */}
        {activeTab === "tasks" && (
          <InteractiveTaskWorkspace
            eventId={event.id}
            tasks={tasks}
            onTasksChange={fetchEvent}
          />
        )}

        {/* TAB 5: VENDORS */}
        {activeTab === "vendors" && (
          <VendorWorkspace
            event={event}
            eventVendors={eventVendors}
            onVendorsChange={fetchEvent}
          />
        )}
      </main>

      {/* EDIT EVENT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-navy-900">Edit Event Parameters</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-navy-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <Input
                label="Event Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
              <Input
                label="Location / Venue"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Event Date"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                />
                <Input
                  label="Guest Count"
                  type="number"
                  min="1"
                  value={editGuestCount}
                  onChange={(e) => setEditGuestCount(Number(e.target.value))}
                  required
                />
              </div>
              <Input
                label="Total Budget"
                type="number"
                min="0"
                value={editBudget}
                onChange={(e) => setEditBudget(Number(e.target.value))}
                required
              />

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSavingEdit} className="gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-navy-900">Delete &ldquo;{event.title}&rdquo;?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This action cannot be undone. All linked tasks, budget items, and vendor notes will be permanently removed from your Supabase database.
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Keep Event
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleDeleteEvent}
                isLoading={isDeleting}
              >
                Yes, Delete Event
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
