// EventPilot AI - Core Domain Types

export type EventCategory =
  | "wedding"
  | "birthday"
  | "corporate"
  | "conference"
  | "anniversary"
  | "gala"
  | "social";

export type EventStatus = "planning" | "confirmed" | "completed" | "archived";

export interface EventItem {
  id: string;
  userId?: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  location: string;
  estimatedBudget: number;
  actualSpend: number;
  guestCount: number;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItem {
  id: string;
  eventId: string;
  category: string;
  name: string;
  allocatedAmount: number;
  actualAmount: number;
  isPaid: boolean;
  notes?: string;
}

export interface GuestItem {
  id: string;
  eventId: string;
  fullName: string;
  email?: string;
  rsvpStatus: "attending" | "declined" | "pending";
  dietaryRestrictions?: string;
  plusOnes: number;
  tableAssignment?: string;
}

export interface TimelineScheduleItem {
  id: string;
  eventId: string;
  time: string;
  title: string;
  description: string;
  responsiblePerson?: string;
}

export interface SystemHealthResponse {
  status: "ok" | "error";
  app: string;
  tagline: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  services: {
    supabase: "configured" | "pending_keys";
    gemini: "configured" | "pending_keys";
  };
}
