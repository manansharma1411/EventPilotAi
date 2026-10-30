// ==============================================================================
// EventPilot AI - Gemini API Modular Prompts
// Structured instructions for event generation & revisions
// ==============================================================================

import type { EventRecord } from "@/types";

export function buildEventPlanSystemPrompt(): string {
  return `You are EventPilot AI, an elite event planner, financial controller, and logistics architect.
Your mission is to formulate an exceptionally detailed, creative, realistic, and operationally rigorous celebration plan.

STRICT OPERATIONAL GUIDELINES:
1. NEVER fabricate real vendors, phone numbers, real-time availability, or guaranteed prices.
2. Clearly distinguish between creative estimates and verified facts.
3. Every budget item is an estimate and must have an allocation percentage.
4. Tasks must have realistic relative deadlines (e.g. negative days relative to event date).
5. All outputs MUST strictly conform to the required JSON schema without markdown wrappers, code blocks, or preamble. Return RAW JSON ONLY.`;
}

export function buildEventPlanUserPrompt(event: EventRecord): string {
  const preferences = event.preferences || {};
  const dietary = Array.isArray(preferences.dietary_requirements) ? preferences.dietary_requirements.join(", ") : "None specified";
  const accessibility = Array.isArray(preferences.accessibility_requirements) ? preferences.accessibility_requirements.join(", ") : "None specified";
  const specialInstructions = typeof preferences.special_instructions === "string" ? preferences.special_instructions : "None";

  return `Formulate an event blueprint with the following parameters:

EVENT SPECIFICATIONS:
- Title: "${event.title}"
- Event Category: "${event.event_type}"
- Event Date: ${event.event_date} (Timezone: ${event.timezone || "UTC"})
- Venue / City: "${event.location}"
- Expected Guests: ${event.guest_count}
- Approved Budget: ${event.currency} ${Number(event.total_budget).toLocaleString()} (${event.currency})
- Theme Preference: "${event.theme || "Not specified, create an imaginative theme"}"
- Dietary Constraints: ${dietary}
- Accessibility Accommodations: ${accessibility}
- User Instructions: ${specialInstructions}

EXPECTED OUTPUT FORMAT (Return valid JSON strictly matching this structure):
{
  "event_summary": "Comprehensive 2-4 sentence executive summary of the celebration experience.",
  "theme_and_rationale": {
    "theme_name": "Evocative theme name",
    "rationale": "Strategic explanation of why this aesthetic fits the occasion and guest count.",
    "color_palette": ["#Hex or Color Name 1", "Color 2", "Color 3", "Color 4"],
    "decor_ideas": ["Specific decor concept 1", "Specific decor concept 2", "Specific decor concept 3"]
  },
  "personalized_ideas": [
    "Personalized touch 1",
    "Personalized touch 2",
    "Personalized touch 3"
  ],
  "budget_categories": [
    {
      "category": "Venue & Facilities",
      "description": "Rental fee, security, basic cleaning",
      "percentage": 35
    },
    {
      "category": "Catering & Beverages",
      "description": "Menu for ${event.guest_count} guests including dietary options",
      "percentage": 30
    },
    {
      "category": "Photography & Video",
      "description": "Coverage of ceremony, reception, and staged portraits",
      "percentage": 12
    },
    {
      "category": "Entertainment & Audio",
      "description": "Sound system, DJ or acoustic musicians",
      "percentage": 10
    },
    {
      "category": "Decor, Floral & Stationery",
      "description": "Centerpieces, signage, lighting, invitations",
      "percentage": 8
    },
    {
      "category": "Contingency & Incidentals",
      "description": "Emergency buffer for unforeseen logistical expenses",
      "percentage": 5
    }
  ],
  "task_checklist": [
    {
      "title": "Secure and book primary venue",
      "description": "Review contracts, confirm capacity for ${event.guest_count} guests, and place deposit.",
      "priority": "urgent",
      "days_relative_to_event": -90,
      "category": "Venue"
    },
    {
      "title": "Finalize catering menu and dietary choices",
      "description": "Account for ${dietary} requirements.",
      "priority": "high",
      "days_relative_to_event": -45,
      "category": "Catering"
    },
    {
      "title": "Send formal invitations and track RSVPs",
      "description": "Collect exact headcounts and accessibility requirements.",
      "priority": "high",
      "days_relative_to_event": -30,
      "category": "Guests"
    },
    {
      "title": "Conduct final vendor walkthrough",
      "description": "Confirm load-in schedules and run-of-show cues.",
      "priority": "medium",
      "days_relative_to_event": -7,
      "category": "Logistics"
    },
    {
      "title": "Day-of execution and vendor check-in",
      "description": "Oversee setup, sound check, and initial guest arrivals.",
      "priority": "urgent",
      "days_relative_to_event": 0,
      "category": "Execution"
    }
  ],
  "vendor_categories_needed": [
    {
      "category": "Catering",
      "necessity": "essential",
      "estimated_cost_range": "30-40% of overall budget",
      "suggested_questions": ["What is your policy on last-minute headcount adjustments?", "How do you handle dietary allergies?"]
    },
    {
      "category": "Event Photographer",
      "necessity": "essential",
      "estimated_cost_range": "10-15% of overall budget",
      "suggested_questions": ["What is your turnaround time for the digital gallery?", "Do you provide raw footage?"]
    }
  ],
  "suggested_activities": [
    {
      "time_or_milestone": "18:00",
      "activity_name": "Guest Arrival & Welcome Cocktail",
      "description": "Light ambient music and welcoming signature drinks.",
      "duration_minutes": 60
    },
    {
      "time_or_milestone": "19:00",
      "activity_name": "Main Dinner & Key Speeches",
      "description": "Curated dinner service with structured milestone toasts.",
      "duration_minutes": 90
    }
  ],
  "planning_assumptions": [
    "Venue provides basic tables and power infrastructure.",
    "Guest attendance is estimated at approximately ${event.guest_count} attendees."
  ],
  "risks_and_missing_info": {
    "identified_risks": [
      "Weather changes if outdoor spaces are used without tent backups.",
      "Vendor delivery delays during peak holiday traffic."
    ],
    "missing_information": [
      "Exact venue load-in time restrictions.",
      "Specific sound ordinances or curfew restrictions."
    ],
    "recommendations": [
      "Ensure all vendor agreements specify backup provisions.",
      "Maintain a 5% contingency reserve in the budget."
    ]
  }
}`;
}

export function buildRevisePlanPrompt(existingPlanJson: string, userInstruction: string): string {
  return `You are EventPilot AI. You have an existing event plan snapshot.
The user wants to apply the following adjustment or instruction:
"${userInstruction}"

EXISTING PLAN:
${existingPlanJson}

INSTRUCTIONS:
1. Preserve all valid unchanged aspects of the existing plan.
2. Update the theme, budget allocations, or tasks affected by the user's instruction.
3. Return the COMPLETE updated JSON adhering strictly to the same schema. Return RAW JSON ONLY.`;
}
