import { WebDriver } from "selenium-webdriver";
import { navigateTo, waitForElement } from "./setup";

/**
 * Test: Create a question via the UI
 * - Navigate to Questions page
 * - Fill in question statement
 * - Add alternatives (mark some as correct)
 * - Verify question appears in list
 */
export async function testCreateQuestion(driver: WebDriver): Promise<void> {
  console.log("Starting: Test Create Question...");

  // Navigate to Questions page
  await navigateTo(driver, "/#questions");
  await waitForElement(driver, 'input[placeholder*="What"]'); // Question input field

  // Fill in question statement
  const questionInput = await driver.findElement({
    css: 'input[placeholder*="What"]',
  });
  const questionText = `Test Question - What is 2 + 2? (${Date.now()})`;
  await questionInput.clear();
  await questionInput.sendKeys(questionText);

  // Add first alternative (correct)
  const altInput = await driver.findElement({
    css: 'input[placeholder*="description"]',
  });
  await altInput.sendKeys("4");

  const isCorrectCheckbox = await driver.findElement({
    css: 'input[type="checkbox"]',
  });
  await isCorrectCheckbox.click();

  // Add alternative button
  const addAltButton = await driver.findElement({
    xpath: "//button[contains(text(), 'Add')]",
  });
  await addAltButton.click();

  // Wait for alternative to be added
  await driver.sleep(300);

  // Add second alternative (incorrect)
  const altInput2 = await driver.findElement({
    css: 'input[placeholder*="description"]',
  });
  await altInput2.sendKeys("5");
  await addAltButton.click();

  // Wait and then create question
  await driver.sleep(300);
  const createButton = await driver.findElement({
    xpath: "//button[contains(text(), 'Create question')]",
  });
  await createButton.click();

  // Wait for question to appear in list
  await waitForElement(driver, 'input[placeholder*="Search"]', 3000);
  await driver.sleep(500);

  // Verify question is in the list
  const searchInput = await driver.findElement({
    css: 'input[placeholder*="Search"]',
  });
  await searchInput.sendKeys(questionText);

  // Check that question appears
  const questionElements = await driver.findElements({
    xpath: `//*[contains(text(), '${questionText}')]`,
  });

  if (questionElements.length === 0) {
    throw new Error("Question not found in list after creation");
  }

  console.log("✓ Test Create Question PASSED");
}
