// ==============================================================================
// EventPilot AI - Core TypeScript Types & Database Contracts
// ==============================================================================

export type EventCategory =
  | "wedding"
  | "birthday"
  | "corporate"
  | "conference"
  | "anniversary"
  | "gala"
  | "community"
  | "other"
  | "social";

export type EventType = EventCategory;

export type EventStatus = "planning" | "confirmed" | "in_progress" | "completed" | "archived";

// 1. Profile Entity (1-to-1 with auth.users)
export interface ProfileRecord {
  id: string;
  display_name: string | null;
  email?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

// 2. Event Entity
export interface EventRecord {
  id: string;
  user_id: string;
  title: string;
  event_type: string;
  event_date: string;
  timezone: string;
  location: string;
  guest_count: number;
  total_budget: number;
  currency: string;
  theme: string | null;
  preferences: Record<string, unknown>;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

// 3. Budget Item Entity (Exact numeric amounts)
export interface BudgetItemRecord {
  id: string;
  event_id: string;
  category: string;
  description: string;
  estimated_cost: number;
  actual_cost: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

// 4. Task Entity (Run-of-show & logistics)
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked" | "todo";

export interface TaskRecord {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dependencies: string[];
  created_at: string;
  updated_at: string;
}

// 5. Vendor Entity
export type VendorVerificationStatus = "unverified" | "verified" | "featured";

export interface VendorRecord {
  id: string;
  name: string;
  category: string;
  location: string;
  contact_info: Record<string, unknown>;
  source: string;
  verification_status: VendorVerificationStatus;
  is_public: boolean;
  created_by?: string | null;
  created_at: string;
}

// 6. Event Vendor Junction
export type EventVendorSelectionStatus =
  | "inquired"
  | "shortlisted"
  | "quoted"
  | "contract_signed"
  | "declined";

export interface EventVendorRecord {
  id: string;
  event_id: string;
  vendor_id: string;
  quoted_price: number;
  currency: string;
  selection_status: EventVendorSelectionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vendor?: VendorRecord;
}

// 7. Event Plan Version Entity
export interface EventPlanVersionRecord {
  id: string;
  event_id: string;
  version_number: number;
  plan_snapshot: Record<string, unknown>;
  change_summary: string;
  created_at: string;
}

// System Health API Response
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
