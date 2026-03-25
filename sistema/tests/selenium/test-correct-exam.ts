import { WebDriver } from "selenium-webdriver";
import { navigateTo, waitForElement } from "./setup";

/**
 * Test: Correct an exam via the UI
 * - Navigate to Correction page
 * - Select an exam
 * - Upload answer key and student responses (CSV format)
 * - Verify correction results display
 */
export async function testCorrectExam(driver: WebDriver): Promise<void> {
  console.log("Starting: Test Correct Exam...");

  // Navigate to Correction page
  await navigateTo(driver, "/#correct");
  await waitForElement(driver, 'select', 3000);

  // Select an exam from the dropdown
  const examSelect = await driver.findElement({ css: "select" });
  // Get available options
  const options = await examSelect.findElements({ css: "option" });

  if (options.length <= 1) {
    throw new Error("No exams available for correction testing");
  }

  // Select the second option (first non-placeholder option)
  await options[1].click();

  // Wait for correction form to load
  await driver.sleep(500);

  // Fill in correction mode (should be visible as radio or select)
  const strictRadio = await driver.findElements({
    xpath: "//input[@type='radio' and @value='strict']",
  });
  if (strictRadio.length > 0) {
    await strictRadio[0].click();
  }

  // Fill in answer key (simple CSV for testing)
  const answerKeyInput = await driver.findElement({
    xpath: "//textarea[1]",
  });
  // Simple answer key: if 1 question, "1" column with value "A"
  await answerKeyInput.sendKeys("1\nA");

  // Wait and fill in student responses
  await driver.sleep(200);
  const studentInput = await driver.findElement({
    xpath: "//textarea[2]",
  });
  await studentInput.sendKeys("Student Name,12345678901\n1,A");

  // Submit correction
  await driver.sleep(300);
  const submitButton = await driver.findElement({
    xpath: "//button[contains(text(), 'Correct')]",
  });
  await submitButton.click();

  // Wait for results to display
  await waitForElement(driver, 'table', 5000);
  await driver.sleep(500);

  // Verify results appear
  const resultElements = await driver.findElements({
    xpath: "//*[contains(text(), 'Score')]",
  });

  if (resultElements.length === 0) {
    throw new Error("Correction results not displayed");
  }

  console.log("✓ Test Correct Exam PASSED");
}
