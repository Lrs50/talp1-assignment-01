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
  
  // Find and click the exam creation button
  await waitForElement(driver, "button", 3000);
  const buttons = await driver.findElements({ css: "button" });
  let newExamBtn = null;
  for (const btn of buttons) {
    const text = await btn.getText();
    if (text.includes("New") && !text.includes("Question")) {
      newExamBtn = btn;
      break;
    }
  }
  
  if (!newExamBtn) {
    throw new Error("Could not find exam creation button");
  }
  
  await newExamBtn.click();
  await driver.sleep(800);
  
  // Fill in exam title
  await waitForElement(driver, 'input[placeholder*="Midterm"]', 3000);
  const titleInput = await driver.findElement({
    css: 'input[placeholder*="Midterm"]',
  });
  const examTitle = `Test Exam (${Date.now()})`;
  await titleInput.sendKeys(examTitle);
  await driver.sleep(500);

  // Wait for questions to load and search field to appear
  await waitForElement(driver, 'input[placeholder*="Search by question"]', 5000);
  
  // Search for questions
  const searchInput = await driver.findElement({
    css: 'input[placeholder*="Search by question"]',
  });
  await searchInput.sendKeys("Test");
  await driver.sleep(500);

  // Select first available question checkbox
  const checkboxes = await driver.findElements({
    css: 'input[type="checkbox"]',
  });

  // Select last checkbox (should be a question, not answer mode)
  if (checkboxes.length > 1) {
    await checkboxes[checkboxes.length - 1].click();
  } else if (checkboxes.length === 1) {
    await checkboxes[0].click();
  } else {
    throw new Error("No questions available to select");
  }

  await driver.sleep(300);

  // Click Create exam button
  const createButton = await driver.findElement({
    xpath: "//button[contains(text(), 'Create exam')]",
  });
  await createButton.click();

  // Wait for confirmation and redirect
  await driver.sleep(1000);

  // Verify exam appears in list
  const examListElements = await driver.findElements({
    xpath: `//*[contains(text(), '${examTitle.substring(0, 15)}')]`,
  });

  if (examListElements.length === 0) {
    throw new Error("Exam not found in list after creation");
  }

  console.log("✓ Test Create Exam PASSED");
}
