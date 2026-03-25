import { WebDriver } from "selenium-webdriver";
import { navigateTo, waitForElement } from "./setup";

/**
 * Test: Create a question via the UI with alternatives
 * - Navigate to Questions page
 * - Click "+ New Question"
 * - Enter question statement
 * - Click Create (transitions to QuestionForm)
 * - Add alternatives in QuestionForm
 * - Verify question appears in list
 */
export async function testCreateQuestion(driver: WebDriver): Promise<void> {
  console.log("Starting: Test Create Question...");

  // Navigate to Questions page
  await navigateTo(driver, "/#questions");
  
  // Click "+ New Question" button
  await waitForElement(driver, "button", 3000);
  const buttons = await driver.findElements({ css: "button" });
  let newQuestionBtn = null;
  for (const btn of buttons) {
    const text = await btn.getText();
    if (text.includes("New Question")) {
      newQuestionBtn = btn;
      break;
    }
  }
  
  if (!newQuestionBtn) {
    throw new Error("Could not find '+ New Question' button");
  }
  
  await newQuestionBtn.click();
  await driver.sleep(500);
  
  // Fill in question statement
  await waitForElement(driver, 'input[placeholder*="Enter the question"]', 3000);
  const questionInput = await driver.findElement({
    css: 'input[placeholder*="Enter the question"]',
  });
  const questionText = `Test Question (${Date.now()})`;
  await questionInput.sendKeys(questionText);

  // Click Create button to save and transition to QuestionForm
  const createQuestionBtn = await driver.findElement({
    xpath: "//button[contains(text(), 'Create')][not(contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'exam'))]",
  });
  await createQuestionBtn.click();
  await driver.sleep(1000);

  // In QuestionForm, click "+ Add" button for alternatives
  await waitForElement(driver, "button", 3000);
  const allButtons = await driver.findElements({ css: "button" });
  let addAltBtn = null;
  for (const btn of allButtons) {
    const text = await btn.getText();
    if (text === "+ Add") {
      addAltBtn = btn;
      break;
    }
  }

  if (addAltBtn) {
    await addAltBtn.click();
    await driver.sleep(500);
  }

  // Fill in alternative text
  await waitForElement(driver, 'input[placeholder*="Alternative"]', 3000);
  const altInput = await driver.findElement({
    css: 'input[placeholder*="Alternative"]',
  });
  await altInput.sendKeys("Answer A");

  // Check "Correct answer" checkbox
  const checkboxes = await driver.findElements({ css: 'input[type="checkbox"]' });
  if (checkboxes.length > 0) {
    await checkboxes[0].click();
  }

  // Find the AlternativeForm section (should have "Alternative text" input)
  // and click Save button within approximately the same area
  await driver.sleep(200);
  
  // Look for the Save button that comes after the AlternativeForm input
  // Alternative approach: Find by looking for the button within the form that has the alt input
  const alternativeInputs = await driver.findElements({ css: 'input[placeholder*="Alternative"]' });
  if (alternativeInputs.length === 0) {
    throw new Error("Alternative text input not found");
  }
  
  // Get the parent form and find the Save button within it
  const altFormInput = alternativeInputs[0];
  const altFormElement = await altFormInput.findElement({ xpath: "ancestor::form" });
  
  // Find all buttons in this form
  const formButtons = await altFormElement.findElements({ css: 'button' });
  console.log(`Found ${formButtons.length} buttons in AlternativeForm`);
  
  let saveAltBtn = null;
  for (const btn of formButtons) {
    const text = await btn.getText();
    console.log(`Alt form button: "${text.trim()}"`);
    if (text.trim() === "Save") {
      saveAltBtn = btn;
      break;
    }
  }
  
  if (!saveAltBtn) {
    throw new Error("Could not find 'Save' button in AlternativeForm");
  }
  
  console.log("Found and clicking Save button in AlternativeForm");
  await saveAltBtn.click();
  await driver.sleep(1500);

  // After saving alternative, the form should close and we should still be on QuestionForm
  // which has a Cancel button to go back to the questions list
  await waitForElement(driver, 'button', 3000);

  // Now find the Cancel button from the QuestionForm
  // The QuestionForm's Cancel button is in the statement editor section
  const questionStatementInputs = await driver.findElements({ css: 'input[placeholder*="Question statement"]' });
  if (questionStatementInputs.length > 0) {
    const statementInput = questionStatementInputs[0];
    const statementForm = await statementInput.findElement({ xpath: "ancestor::form" });
    const statementFormButtons = await statementForm.findElements({ css: 'button' });
    
    console.log(`Found ${statementFormButtons.length} buttons in statement section`);
    
    let cancelBtn = null;
    for (const btn of statementFormButtons) {
      const text = await btn.getText();
      console.log(`Statement button: "${text.trim()}"`);
      if (text.trim() === "Cancel") {
        cancelBtn = btn;
        break;
      }
    }
    
    if (!cancelBtn) {
      throw new Error("Could not find 'Cancel' button in QuestionForm");
    }
    
    console.log("Found and clicking Cancel button");
    await cancelBtn.click();
  } else {
    throw new Error("Could not find question statement input");
  }
  
  await driver.sleep(500);

  // Verify question in list
  await waitForElement(driver, 'input[placeholder*="Search"]', 3000);
  const searchInput = await driver.findElement({
    css: 'input[placeholder*="Search"]',
  });
  await searchInput.sendKeys("Test Question");
  await driver.sleep(300);

  const questionElements = await driver.findElements({
    xpath: `//*[contains(text(), 'Test Question')]`,
  });

  if (questionElements.length === 0) {
    throw new Error("Question not found in list after creation");
  }

  console.log("✓ Test Create Question PASSED");
}
