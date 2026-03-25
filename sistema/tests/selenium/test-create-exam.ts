import { WebDriver } from "selenium-webdriver";
import { navigateTo, waitForElement } from "./setup";

/**
 * Test: Create an exam via the UI
 * - Navigate to Exams page
 * - Click "New Exam"
 * - Fill in title and answer mode
 * - Search and select questions
 * - Verify exam is created and appears in list
 */
export async function testCreateExam(driver: WebDriver): Promise<void> {
  console.log("Starting: Test Create Exam...");

  // Navigate to Exams page
  await navigateTo(driver, "/#exams");
  await waitForElement(driver, 'input[placeholder*="title"]', 3000);

  // Fill in exam title
  const titleInput = await driver.findElement({
    css: 'input[placeholder*="title"]',
  });
  const examTitle = `Test Exam - ${Date.now()}`;
  await titleInput.sendKeys(examTitle);

  // Select answer mode (default is letters, keep it)
  // Answer mode select should be visible

  // Wait a bit for questions to load
  await driver.sleep(500);

  // Search for questions in the question list
  const searchInput = await driver.findElement({
    css: 'input[placeholder*="Search by question"]',
  });

  if (searchInput) {
    await searchInput.sendKeys("Test Question");
  }

  // Wait for questions to be filtered
  await driver.sleep(300);

  // Select first checkbox (a question)
  const checkboxes = await driver.findElements({
    css: 'input[type="checkbox"]',
  });

  if (checkboxes.length > 0) {
    await checkboxes[0].click();
  } else {
    throw new Error("No questions available to select");
  }

  // Wait and then create exam
  await driver.sleep(300);
  const createButton = await driver.findElement({
    xpath: "//button[contains(text(), 'Create exam')]",
  });
  await createButton.click();

  // Wait for confirmation and redirect
  await driver.sleep(1000);

  // Verify exam appears in list
  const examListElements = await driver.findElements({
    xpath: `//*[contains(text(), '${examTitle}')]`,
  });

  if (examListElements.length === 0) {
    throw new Error("Exam not found in list after creation");
  }

  console.log("✓ Test Create Exam PASSED");
}
