import type { EventType, EventStatus } from "@/types";

export interface EventInputData {
  title: string;
  event_type: EventType;
  event_date: string; // ISO date string (YYYY-MM-DD or ISO timestamp)
  timezone?: string;
  location: string;
  guest_count: number;
  total_budget: number;
  currency: string;
  theme?: string;
  preferences?: {
    dietary_requirements?: string[];
    accessibility_requirements?: string[];
    style_notes?: string;
    special_instructions?: string;
  };
  status?: EventStatus;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export const VALID_EVENT_TYPES: EventType[] = [
  "wedding",
  "birthday",
  "anniversary",
  "corporate",
  "community",
  "other",
];

export const VALID_CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"];

export function validateEventInput(raw: unknown): ValidationResult<EventInputData> {
  const errors: ValidationError[] = [];

  if (!raw || typeof raw !== "object") {
    return {
      success: false,
      errors: [{ field: "root", message: "Request payload must be an object" }],
    };
  }

  const input = raw as Record<string, unknown>;

  // Title validation
  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (!title) {
    errors.push({ field: "title", message: "Event title is required" });
  } else if (title.length < 3) {
    errors.push({ field: "title", message: "Title must be at least 3 characters" });
  } else if (title.length > 120) {
    errors.push({ field: "title", message: "Title cannot exceed 120 characters" });
  }

  // Event Type validation
  const event_type = input.event_type as EventType;
  if (!event_type || !VALID_EVENT_TYPES.includes(event_type)) {
    errors.push({
      field: "event_type",
      message: `Invalid event type. Must be one of: ${VALID_EVENT_TYPES.join(", ")}`,
    });
  }

  // Date validation
  const event_date = typeof input.event_date === "string" ? input.event_date.trim() : "";
  if (!event_date) {
    errors.push({ field: "event_date", message: "Event date is required" });
  } else {
    const parsedDate = new Date(event_date);
    if (isNaN(parsedDate.getTime())) {
      errors.push({ field: "event_date", message: "Invalid date format. Use YYYY-MM-DD" });
    }
  }

  // Location validation
  const location = typeof input.location === "string" ? input.location.trim() : "";
  if (!location) {
    errors.push({ field: "location", message: "Location/venue is required" });
  } else if (location.length > 200) {
    errors.push({ field: "location", message: "Location cannot exceed 200 characters" });
  }

  // Guest count validation
  const guest_count = typeof input.guest_count === "number" 
    ? input.guest_count 
    : parseInt(String(input.guest_count || 0), 10);
  if (isNaN(guest_count) || guest_count < 1) {
    errors.push({ field: "guest_count", message: "Guest count must be at least 1" });
  } else if (guest_count > 100000) {
    errors.push({ field: "guest_count", message: "Guest count cannot exceed 100,000" });
  }

  // Total budget validation
  const total_budget = typeof input.total_budget === "number"
    ? input.total_budget
    : parseFloat(String(input.total_budget || 0));
  if (isNaN(total_budget) || total_budget < 0) {
    errors.push({ field: "total_budget", message: "Total budget must be a positive number" });
  } else if (total_budget > 100000000) {
    errors.push({ field: "total_budget", message: "Budget exceeds maximum supported amount" });
  }

  // Currency validation
  const currency = typeof input.currency === "string" ? input.currency.toUpperCase().trim() : "USD";
  if (!VALID_CURRENCIES.includes(currency)) {
    errors.push({
      field: "currency",
      message: `Unsupported currency. Allowed: ${VALID_CURRENCIES.join(", ")}`,
    });
  }

  // Optional fields sanitization
  const theme = typeof input.theme === "string" ? input.theme.trim() : undefined;
  const timezone = typeof input.timezone === "string" && input.timezone.trim() ? input.timezone.trim() : "UTC";
  
  let preferences: EventInputData["preferences"] = undefined;
  if (input.preferences && typeof input.preferences === "object") {
    const p = input.preferences as Record<string, unknown>;
    preferences = {
      dietary_requirements: Array.isArray(p.dietary_requirements)
        ? p.dietary_requirements.filter((item): item is string => typeof item === "string")
        : undefined,
      accessibility_requirements: Array.isArray(p.accessibility_requirements)
        ? p.accessibility_requirements.filter((item): item is string => typeof item === "string")
        : undefined,
      style_notes: typeof p.style_notes === "string" ? p.style_notes.trim() : undefined,
      special_instructions: typeof p.special_instructions === "string" ? p.special_instructions.trim() : undefined,
    };
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      title,
      event_type,
      event_date,
      timezone,
      location,
      guest_count,
      total_budget,
      currency,
      theme,
      preferences,
      status: "draft",
    },
  };
}
