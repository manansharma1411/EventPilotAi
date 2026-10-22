import Link from "next/link";
import { Sparkles, Plus, Calendar, ShieldCheck, LogOut, Database, CheckCircle2, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { EventRecord, TaskRecord } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  let user = null;
  let events: EventRecord[] = [];
  let tasks: TaskRecord[] = [];
  const isConfigured = Boolean(supabase);

  if (supabase) {
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      // Fetch user's events
      const { data: userEvents } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (userEvents) {
        events = userEvents as EventRecord[];
        
        // Fetch tasks for all user's events
        if (events.length > 0) {
          const eventIds = events.map((e) => e.id);
          const { data: userTasks } = await supabase
            .from("tasks")
            .select("*")
            .in("event_id", eventIds)
            .order("created_at", { ascending: false });

          if (userTasks) {
            tasks = userTasks as TaskRecord[];
          }
        }
      }
    }
  }

  // Calculate metrics
  const totalPlannedBudget = events.reduce((sum, e) => sum + Number(e.total_budget || 0), 0);
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const primaryCurrency = events.length > 0 ? events[0].currency : "USD";

  return (
    <div className="min-h-screen bg-warmth-50 text-navy-900 pb-20">
      {/* Dashboard Topbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-navy-900">EventPilot AI</span>
              <span className="text-xs text-slate-400 ml-2 hidden sm:inline">Workspace</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/events/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Create Event</span>
              </Button>
            </Link>

            {user ? (
              <form action="/api/auth/signout" method="POST">
                <Button variant="outline" size="sm" className="gap-1 text-slate-600">
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </form>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              {user ? `Welcome, ${user.user_metadata?.full_name || user.email?.split("@")[0]}` : "Celebration Hub"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Real-time PostgreSQL workspace with Row-Level Security for event blueprints & budgets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="indigo" size="sm">
              PostgreSQL RLS Active
            </Badge>
          </div>
        </div>

        {/* Database Configuration Status Notice */}
        {!isConfigured && (
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50/90 p-5 flex items-start gap-3.5 shadow-subtle">
            <Database className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-bold">Supabase Database Connection Pending</p>
              <p className="mt-1">
                Your database tables and RLS policies are prepared in <code className="font-mono text-amber-950 font-semibold">supabase/migrations/</code>.
                Provide <code className="font-mono text-amber-950 font-semibold">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono text-amber-950 font-semibold">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to enable full cloud persistence.
              </p>
            </div>
          </div>
        )}

        {/* 4-Stat Metric Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          <Card className="p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Active Events</span>
              <Calendar className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-2xl font-extrabold text-navy-900">
              {events.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {events.length === 0 ? "No active plans" : "Cloud synchronized"}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Planned Budget</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-navy-900 font-mono">
              {primaryCurrency} {totalPlannedBudget.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Across {events.length} event{events.length === 1 ? "" : "s"}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Tasks Completed</span>
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-navy-900">
              {completedTasks} / {tasks.length}
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-brand-600 h-full rounded-full" style={{ width: `${taskProgress}%` }} />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Session Security</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-navy-900">
              {user ? "Verified" : "Sandbox"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {user ? user.email : "Sign in to isolate data"}
            </p>
          </Card>
        </div>

        {/* Events Grid */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy-900">Managed Events</h2>
            <Link href="/events/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Create Event</span>
              </Button>
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-subtle">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy-900">
                No events saved in your account yet
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                Launch the event creation wizard to save your first celebration with custom budgets, timelines, and action items.
              </p>
              <div className="mt-6">
                <Link href="/events/new">
                  <Button size="md" className="gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Create Your First Event</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((evt) => (
                <Link key={evt.id} href={`/events/${evt.id}`}>
                  <Card className="h-full hover:shadow-card-hover hover:border-brand-200 transition-all flex flex-col justify-between group p-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="indigo" size="sm" className="capitalize">
                          {evt.event_type}
                        </Badge>
                        <span className="text-[11px] font-mono text-slate-400">
                          {evt.event_date}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-navy-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total Budget</span>
                        <span className="font-mono font-bold text-navy-900">
                          {evt.currency} {Number(evt.total_budget).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Guests</span>
                        <span className="font-semibold text-brand-600">{evt.guest_count}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
