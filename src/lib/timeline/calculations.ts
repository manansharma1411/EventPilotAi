// ==============================================================================
// EventPilot AI - Deterministic Timeline & Date Calculations
// Handles countdowns, timezones, task deadlines, and overdue detection
// ==============================================================================

import type { TaskRecord } from "@/types";

export interface CountdownInfo {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
  isToday: boolean;
  formattedTarget: string;
}

export interface TaskDeadlineAnalysis {
  isOverdue: boolean;
  daysUntilDue: number | null;
  formattedDue: string;
  isUrgentSoon: boolean; // within 3 days
}

/**
 * Calculates countdown from now to the event date taking timezone into account
 */
export function calculateEventCountdown(eventDateStr: string, timezone: string = "UTC"): CountdownInfo {
  if (!eventDateStr) {
    return { days: 0, hours: 0, minutes: 0, isPast: false, isToday: false, formattedTarget: "TBD" };
  }

  // Treat event date at 09:00 AM event-local time or start of day
  const targetDate = new Date(`${eventDateStr}T09:00:00Z`);
  const now = new Date();

  const diffMs = targetDate.getTime() - now.getTime();
  const isPast = diffMs < -86400000; // Passed yesterday or earlier
  const isToday = diffMs >= -86400000 && diffMs <= 86400000;

  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const formattedTarget = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: timezone === "UTC" ? "UTC" : timezone,
  }).format(targetDate);

  return {
    days: isPast ? 0 : days,
    hours: isPast ? 0 : hours,
    minutes: isPast ? 0 : minutes,
    isPast,
    isToday,
    formattedTarget,
  };
}

/**
 * Analyzes deadline status for a task
 */
export function analyzeTaskDeadline(dueAtIso: string | null): TaskDeadlineAnalysis {
  if (!dueAtIso) {
    return { isOverdue: false, daysUntilDue: null, formattedDue: "No deadline", isUrgentSoon: false };
  }

  const dueDate = new Date(dueAtIso);
  if (isNaN(dueDate.getTime())) {
    return { isOverdue: false, daysUntilDue: null, formattedDue: "Invalid date", isUrgentSoon: false };
  }

  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isOverdue = diffDays < 0;
  const isUrgentSoon = diffDays >= 0 && diffDays <= 3;

  const formattedDue = dueDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    isOverdue,
    daysUntilDue: diffDays,
    formattedDue,
    isUrgentSoon,
  };
}

/**
 * Recalculates relative task deadlines when an event date changes
 */
export function recalculateTaskDeadlinesForNewEventDate(
  oldEventDateStr: string,
  newEventDateStr: string,
  tasks: TaskRecord[]
): { id: string; due_at: string | null }[] {
  const oldEvent = new Date(oldEventDateStr);
  const newEvent = new Date(newEventDateStr);

  if (isNaN(oldEvent.getTime()) || isNaN(newEvent.getTime())) {
    return tasks.map((t) => ({ id: t.id, due_at: t.due_at }));
  }

  const dayShift = Math.round((newEvent.getTime() - oldEvent.getTime()) / (1000 * 60 * 60 * 24));

  return tasks.map((task) => {
    if (!task.due_at) return { id: task.id, due_at: null };
    const taskDate = new Date(task.due_at);
    if (isNaN(taskDate.getTime())) return { id: task.id, due_at: null };

    taskDate.setDate(taskDate.getDate() + dayShift);
    return { id: task.id, due_at: taskDate.toISOString() };
  });
}
