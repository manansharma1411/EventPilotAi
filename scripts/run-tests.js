// EventPilot AI - Unified Test Runner
const path = require("path");
const jiti = require("jiti")(process.cwd(), {
  alias: {
    "@": path.resolve(__dirname, "../src"),
  },
});

console.log("=================================================");
console.log("  EVENTPILOT AI - AUTOMATED QA AUDIT SUITE");
console.log("=================================================\n");

let allPassed = true;
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function reportSuite(suiteName, results) {
  console.log(`--- [SUITE] ${suiteName} ---`);
  for (const r of results) {
    totalTests++;
    const name = r.test || r.testName || "Unknown Test";
    if (r.passed) {
      passedTests++;
      console.log(`  [PASS] ${name}`);
    } else {
      failedTests++;
      allPassed = false;
      console.error(`  [FAIL] ${name}: ${r.details || r.message || "Failed"}`);
    }
  }
  console.log("");
}

try {
  // 1. Validation Tests
  const { runValidationTests } = jiti("./src/lib/validation/event.test.ts");
  reportSuite("Event Input Validation & Security", runValidationTests());

  // 2. AI Planning Engine Tests
  const { runAiPlanningTests } = jiti("./src/lib/ai/ai.test.ts");
  reportSuite("AI Engine & Gemini Mocking", runAiPlanningTests());

  // 3. Smart Budget & Timeline Calculations
  const { runPhase6Tests } = jiti("./src/lib/budget/budget.test.ts");
  reportSuite("Financial Arithmetic & Timeline Math", runPhase6Tests());

  // 4. Copilot & Vendor Management Tests
  const { runPhase7Tests } = jiti("./src/lib/copilot/copilot.test.ts");
  reportSuite("AI Copilot Revision Engine & Vendor Logic", runPhase7Tests());

  console.log("=================================================");
  console.log(`TOTAL AUDIT TESTS: ${totalTests}`);
  console.log(`PASSED: ${passedTests}`);
  console.log(`FAILED: ${failedTests}`);
  console.log("=================================================");

  if (!allPassed) {
    process.exit(1);
  }
} catch (error) {
  console.error("FATAL: Test runner crashed with error:", error);
  process.exit(1);
}
