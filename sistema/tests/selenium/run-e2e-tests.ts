import { createDriver, clearAllData } from "./setup";
import { testCreateQuestion } from "./test-create-question";
import { testCreateExam } from "./test-create-exam";
import { testCorrectExam } from "./test-correct-exam";

/**
 * End-to-end test suite runner
 * Runs tests in order:
 * 1. Create Question
 * 2. Create Exam
 * 3. Correct Exam
 */
async function runAllTests(): Promise<void> {
  const driver = await createDriver();

  try {
    console.log("=".repeat(60));
    console.log("E2E Test Suite: Kotae System");
    console.log("=".repeat(60));
    console.log("");

    // Clear data before starting
    console.log("Clearing test data...");
    await clearAllData();
    console.log("✓ Data cleared\n");

    // Test 1: Create Question
    try {
      await testCreateQuestion(driver);
    } catch (err) {
      console.error("✗ Test Create Question FAILED:", err);
      // Don't throw, continue to next test
    }

    console.log("");

    // Test 2: Create Exam
    try {
      await testCreateExam(driver);
    } catch (err) {
      console.error("✗ Test Create Exam FAILED:", err);
    }

    console.log("");

    // Test 3: Correct Exam
    try {
      await testCorrectExam(driver);
    } catch (err) {
      console.error("✗ Test Correct Exam FAILED:", err);
    }

    console.log("");
    console.log("=".repeat(60));
    console.log("E2E Test Suite Complete");
    console.log("=".repeat(60));
  } finally {
    await driver.quit();
  }
}

// Run tests
runAllTests().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
