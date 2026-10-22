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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EventRecord, TaskRecord, BudgetItemRecord, EventVendorRecord } from "@/types";

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
  const [, setBudgetItems] = useState<BudgetItemRecord[]>([]);
  const [eventVendors, setEventVendors] = useState<EventVendorRecord[]>([]);

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

  // Fetch event data
  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await fetch(`/api/events/${eventId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load event.");
      }

      setEvent(data.event);
      setTasks(data.tasks || []);
      setBudgetItems(data.budget_items || []);
      setEventVendors(data.event_vendors || []);

      // Populate edit states
      setEditTitle(data.event.title);
      setEditLocation(data.event.location);
      setEditDate(data.event.event_date);
      setEditGuestCount(data.event.guest_count);
      setEditBudget(Number(data.event.total_budget));
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
        // Rollback
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
              { id: "budget", label: "Budget & Ledger", icon: DollarSign },
              { id: "timeline", label: "Timeline & Run-of-Show", icon: Clock },
              { id: "tasks", label: `Tasks (${completedTasksCount}/${tasks.length})`, icon: ListTodo },
              { id: "vendors", label: `Vendors (${eventVendors.length})`, icon: ShoppingBag },
              { id: "ai_planner", label: "AI Blueprint Generator", icon: Bot },
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
          </div>
        )}

        {/* TAB 2: BUDGET */}
        {activeTab === "budget" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-navy-900">Budget Ledger & Line Items</h2>
                <p className="text-xs text-slate-500">Track budgeted estimates against actual vendor commitments.</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Total Cap:</span>
                <p className="text-lg font-extrabold text-navy-900 font-mono">
                  {event.currency} {Number(event.total_budget).toLocaleString()}
                </p>
              </div>
            </div>

            <Card className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-navy-900">Smart Budget Splits Coming in Phase 5</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                The Gemini AI Engine in Phase 5 will automatically generate category splits (Venue, Catering, Photography, Entertainment) optimized for your total budget of {event.currency} {Number(event.total_budget).toLocaleString()}.
              </p>
            </Card>
          </div>
        )}

        {/* TAB 3: TIMELINE */}
        {activeTab === "timeline" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-navy-900">Minute-by-Minute Run of Show</h2>
              <p className="text-xs text-slate-500">Schedule vendor arrival, milestone announcements, and event flow.</p>
            </div>

            <Card className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-navy-900">Timeline Generation Ready for Phase 5</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Dynamic itinerary schedules tailored to your event type ({event.event_type}) will be synthesized with conflict detection in the upcoming AI Generation phase.
              </p>
            </Card>
          </div>
        )}

        {/* TAB 4: TASKS */}
        {activeTab === "tasks" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-navy-900">Event Action Items</h2>
                <p className="text-xs text-slate-500">
                  {completedTasksCount} of {tasks.length} tasks completed ({progressPercent}%)
                </p>
              </div>

              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="flex gap-2 w-full sm:w-auto">
                <Input
                  placeholder="New task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full sm:w-64"
                />
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as "low" | "medium" | "high")}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-navy-900"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <Button type="submit" size="sm" isLoading={isAddingTask} className="gap-1 flex-shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </Button>
              </form>
            </div>

            {/* Task List */}
            <div className="space-y-2">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  onClick={() => handleToggleTask(task)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:shadow-subtle transition-all"
                >
                  <div className="flex items-center gap-3">
                    {task.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`text-xs font-semibold ${task.status === "completed" ? "line-through text-slate-400" : "text-navy-900"}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{task.description}</p>
                      )}
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    task.priority === "high" ? "bg-rose-50 text-rose-700" : task.priority === "medium" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    {task.priority}
                  </span>
                </Card>
              ))}

              {tasks.length === 0 && (
                <Card className="p-8 text-center text-slate-400 text-xs">
                  No tasks added yet. Create your first task above.
                </Card>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: VENDORS */}
        {activeTab === "vendors" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-navy-900">Vendors & Partners</h2>
              <p className="text-xs text-slate-500">Curate and contact service providers for catering, music, and photography.</p>
            </div>

            <Card className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-navy-900">Vendor Matching Ready for Phase 6</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Smart vendor recommendations based on {event.location} and category budget limits will be linked in the Vendor Curation phase.
              </p>
            </Card>
          </div>
        )}

        {/* TAB 6: AI PLANNER */}
        {activeTab === "ai_planner" && (
          <Card className="p-10 text-center space-y-4 bg-gradient-to-br from-white to-brand-50/50 border-brand-200">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Bot className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-navy-900">GenAI Blueprint Generator</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Phase 5 will activate Google Gemini 2.5 Flash to automatically assemble a bespoke celebration package: full budget breakdowns, contingency allocations, run-of-show timeline, and vendor checklists.
            </p>
            <div className="pt-2">
              <Badge variant="indigo" size="md">
                Phase 5: Gemini API Integration Next
              </Badge>
            </div>
          </Card>
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
