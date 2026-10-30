"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Flag,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateEventCountdown, analyzeTaskDeadline } from "@/lib/timeline/calculations";
import type { TaskRecord } from "@/types";
import type { ActivityScheduleItem } from "@/lib/ai/schemas";

interface InteractiveTimelineWorkspaceProps {
  eventDate: string;
  timezone: string;
  tasks: TaskRecord[];
  itinerary: ActivityScheduleItem[];
  onNavigateToTasks?: () => void;
}

export function InteractiveTimelineWorkspace({
  eventDate,
  timezone,
  tasks,
  itinerary,
  onNavigateToTasks,
}: InteractiveTimelineWorkspaceProps) {
  const countdown = calculateEventCountdown(eventDate, timezone);

  // Group tasks into timeline phases: Overdue, Next 7 Days, Next 30 Days, Future Milestones, Completed
  const overdueTasks = tasks.filter((t) => t.status !== "completed" && analyzeTaskDeadline(t.due_at).isOverdue);
  const urgentUpcoming = tasks.filter((t) => {
    if (t.status === "completed") return false;
    const d = analyzeTaskDeadline(t.due_at);
    return !d.isOverdue && d.daysUntilDue !== null && d.daysUntilDue <= 7;
  });
  const upcomingMonth = tasks.filter((t) => {
    if (t.status === "completed") return false;
    const d = analyzeTaskDeadline(t.due_at);
    return !d.isOverdue && d.daysUntilDue !== null && d.daysUntilDue > 7 && d.daysUntilDue <= 30;
  });
  const futureMilestones = tasks.filter((t) => {
    if (t.status === "completed") return false;
    const d = analyzeTaskDeadline(t.due_at);
    return !d.isOverdue && (d.daysUntilDue === null || d.daysUntilDue > 30);
  });

  return (
    <div className="space-y-8">
      {/* 1. CELEBRATION COUNTDOWN HERO BANNER */}
      <Card className="p-6 bg-gradient-to-r from-brand-900 via-indigo-900 to-navy-950 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-brand-200 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Event Date: {countdown.formattedTarget} ({timezone})</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {countdown.isPast
                ? "Celebration Completed"
                : countdown.isToday
                ? "Today is Celebration Day! 🎉"
                : "Celebration Launch Countdown"}
            </h3>
            <p className="text-xs text-slate-300 max-w-md">
              Synchronized to your event local timezone with milestone deadline conflict tracking.
            </p>
          </div>

          {/* Countdown Clock Display */}
          {!countdown.isPast && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl min-w-[72px]">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono block">
                  {countdown.days}
                </span>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Days</span>
              </div>
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl min-w-[72px]">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono block">
                  {countdown.hours}
                </span>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Hours</span>
              </div>
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl min-w-[72px]">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono block">
                  {countdown.minutes}
                </span>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Mins</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 2. OVERDUE ALERT IF APPLICABLE */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-3 shadow-subtle">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Attention Needed: {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? "s" : ""}</p>
              <p className="text-rose-700 mt-0.5">
                Some milestones have passed their target deadline relative to the event date. Reschedule or mark complete.
              </p>
            </div>
          </div>
          {onNavigateToTasks && (
            <button
              onClick={onNavigateToTasks}
              className="text-xs font-bold text-rose-800 underline hover:text-rose-950 flex-shrink-0"
            >
              Review Tasks &rarr;
            </button>
          )}
        </div>
      )}

      {/* 3. RUN-OF-SHOW DAY ITINERARY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Event Day Run-of-Show Schedule</span>
            </h3>
            <p className="text-xs text-slate-500">Step-by-step cue sheet for the celebration date.</p>
          </div>
        </div>

        {itinerary && itinerary.length > 0 ? (
          <div className="space-y-3">
            {itinerary.map((item, idx) => (
              <Card key={idx} className="p-4 flex items-start gap-4 hover:shadow-subtle transition-all">
                <div className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 font-mono text-xs font-bold whitespace-nowrap">
                  {item.time_or_milestone}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-navy-900">{item.activity_name}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.duration_minutes} minutes
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-navy-900">No Run-of-Show Itinerary Generated</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Use the AI Blueprint Generator to automatically formulate a minute-by-minute schedule tailored to your event type.
            </p>
          </Card>
        )}
      </div>

      {/* 4. CHRONOLOGICAL MILESTONE PHASES */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <Flag className="w-4 h-4 text-indigo-600" />
            <span>Milestones & Upcoming Deadlines</span>
          </h3>
          <p className="text-xs text-slate-500">Chronological roadmap leading up to the celebration date.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Phase 1: Urgent (Next 7 Days) */}
          <Card className="p-5 space-y-3 border-amber-200 bg-amber-50/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Next 7 Days ({urgentUpcoming.length})</span>
              </span>
              <Badge variant="outline" size="sm">Urgent</Badge>
            </div>
            <div className="space-y-2">
              {urgentUpcoming.map((t) => (
                <div key={t.id} className="p-2.5 rounded-xl bg-white border border-amber-100 space-y-1">
                  <p className="text-xs font-semibold text-navy-900">{t.title}</p>
                  <span className="text-[10px] text-amber-700 font-mono block">
                    {analyzeTaskDeadline(t.due_at).formattedDue}
                  </span>
                </div>
              ))}
              {urgentUpcoming.length === 0 && (
                <p className="text-xs text-slate-400 italic py-2">No tasks due within 7 days</p>
              )}
            </div>
          </Card>

          {/* Phase 2: Next 30 Days */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span>Next 30 Days ({upcomingMonth.length})</span>
              </span>
              <Badge variant="indigo" size="sm">Medium</Badge>
            </div>
            <div className="space-y-2">
              {upcomingMonth.map((t) => (
                <div key={t.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-xs font-semibold text-navy-900">{t.title}</p>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {analyzeTaskDeadline(t.due_at).formattedDue}
                  </span>
                </div>
              ))}
              {upcomingMonth.length === 0 && (
                <p className="text-xs text-slate-400 italic py-2">No tasks due in next 30 days</p>
              )}
            </div>
          </Card>

          {/* Phase 3: Future Milestones */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-slate-500" />
                <span>Future Milestones ({futureMilestones.length})</span>
              </span>
              <Badge variant="outline" size="sm">Planned</Badge>
            </div>
            <div className="space-y-2">
              {futureMilestones.map((t) => (
                <div key={t.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-xs font-semibold text-navy-900">{t.title}</p>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {analyzeTaskDeadline(t.due_at).formattedDue}
                  </span>
                </div>
              ))}
              {futureMilestones.length === 0 && (
                <p className="text-xs text-slate-400 italic py-2">No future milestones</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
