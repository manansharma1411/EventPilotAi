import { validateEventInput } from "@/lib/validation/event";

/**
 * Event validation and security verification suite
 */
export function runValidationTests() {
  const results: { test: string; passed: boolean; details?: string }[] = [];

  // Test 1: Valid event payload
  const validPayload = {
    title: "Annual Tech Conference 2026",
    event_type: "corporate",
    event_date: "2026-11-15",
    location: "Grand Hyatt San Francisco",
    guest_count: 500,
    total_budget: 75000,
    currency: "USD",
  };
  const res1 = validateEventInput(validPayload);
  results.push({
    test: "Valid event payload passes validation",
    passed: res1.success === true && res1.data?.title === validPayload.title,
  });

  // Test 2: Reject empty title
  const invalidTitle = { ...validPayload, title: "" };
  const res2 = validateEventInput(invalidTitle);
  results.push({
    test: "Rejects empty event title",
    passed: res2.success === false && res2.errors?.some((e) => e.field === "title") === true,
  });

  // Test 3: Reject negative budget
  const negativeBudget = { ...validPayload, total_budget: -500 };
  const res3 = validateEventInput(negativeBudget);
  results.push({
    test: "Rejects negative budget amount",
    passed: res3.success === false && res3.errors?.some((e) => e.field === "total_budget") === true,
  });

  // Test 4: Reject invalid event type
  const badType = { ...validPayload, event_type: "invalid_type" };
  const res4 = validateEventInput(badType);
  results.push({
    test: "Rejects unauthorized event_type",
    passed: res4.success === false && res4.errors?.some((e) => e.field === "event_type") === true,
  });

  // Test 5: Reject invalid date format
  const badDate = { ...validPayload, event_date: "not-a-date" };
  const res5 = validateEventInput(badDate);
  results.push({
    test: "Rejects malformed date strings",
    passed: res5.success === false && res5.errors?.some((e) => e.field === "event_date") === true,
  });

  // Test 6: Zero or negative guest count
  const zeroGuests = { ...validPayload, guest_count: 0 };
  const res6 = validateEventInput(zeroGuests);
  results.push({
    test: "Rejects zero guest count",
    passed: res6.success === false && res6.errors?.some((e) => e.field === "guest_count") === true,
  });

  return results;
}
