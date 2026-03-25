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
  await waitForElement(driver, 'select', 5000);
  await driver.sleep(1000);

  // Select an exam from the dropdown
  const examSelect = await driver.findElement({ css: "select" });
  // Get available options
  const options = await examSelect.findElements({ css: "option" });
  
  console.log(`Found ${options.length} options in exam dropdown`);
  for (let i = 0; i < options.length; i++) {
    const text = await options[i].getText();
    const value = await options[i].getAttribute('value');
    console.log(`  Option ${i}: text="${text}", value="${value}"`);
  }

  let selectedOptionIndex = -1;
  // Look for first non-empty option
  for (let i = 0; i < options.length; i++) {
    const text = await options[i].getText();
    const value = await options[i].getAttribute('value');
    // Skip placeholder options (empty value or text)
    if (value && value.trim() && text.trim()) {
      selectedOptionIndex = i;
      console.log(`Selecting option ${i}: "${text}"`);
      break;
    }
  }

  if (selectedOptionIndex === -1) {
    throw new Error("No exams available for correction testing");
  }

  // Select the option
  await options[selectedOptionIndex].click();

  // Wait for correction form to load
  await driver.sleep(800);

  // Note: Correction mode is a select dropdown, not radio buttons
  // Select "strict" mode from the dropdown
  const modeSelects = await driver.findElements({ css: 'select' });
  console.log(`Found ${modeSelects.length} select dropdowns`);
  if (modeSelects.length >= 2) {
    // Second select is the mode select (first is exam select)
    const modeSelect = modeSelects[1];
    await modeSelect.click();
    const modeOptions = await modeSelect.findElements({ css: 'option' });
    if (modeOptions.length > 0) {
      await modeOptions[0].click(); // First option (strict)
      console.log("Set correction mode to strict");
    }
  }

  await driver.sleep(500);

  // Fill in answer key using placeholder selector
  const answerKeyInputs = await driver.findElements({
    xpath: "//textarea[@placeholder='Or paste CSV here…']",
  });
  if (answerKeyInputs.length === 0) {
    throw new Error("Answer key textarea not found");
  }
  const answerKeyInput = answerKeyInputs[0];
  // Answer key format: versionNumber, then question answers
  // The exam has 1 question, so: versionNumber,q1
  // Header line: versionNumber,q1
  // Data line: version,answer
  await answerKeyInput.clear();
  await answerKeyInput.sendKeys("versionNumber,q1\n1,A");
  console.log("Filled in answer key");

  // Wait and fill in student responses  
  await driver.sleep(200);
  const studentInputs = await driver.findElements({
    xpath: "//textarea[@placeholder='Or paste CSV here…']",
  });
  if (studentInputs.length < 2) {
    throw new Error("Student responses textarea not found");
  }
  const studentInput = studentInputs[1];
  // Student responses format: headers first, then data
  // Headers: studentName,studentCpf,versionNumber,q1,...
  // Data: name,cpf,version,answers...
  await studentInput.clear();
  await studentInput.sendKeys("studentName,studentCpf,versionNumber,q1\nTest Student,12345678901,1,A");
  console.log("Filled in student responses");

  // Submit correction - try submitting the form directly
  await driver.sleep(500);
  const forms = await driver.findElements({ css: 'form' });
  console.log(`Found ${forms.length} forms on page`);
  
  if (forms.length > 0) {
    // Submit the form
    const form = forms[forms.length - 1]; // Likely the correction form is the last one
    console.log("Submitting correction form");
    await form.submit();
  } else {
    // Fallback: find and click the Correct button
    const submitButtons = await driver.findElements({
      xpath: "//button[contains(text(), 'Correct')]",
    });
    if (submitButtons.length === 0) {
      throw new Error("Correct Exam button not found");
    }
    console.log(`Found ${submitButtons.length} buttons with 'Correct' text`);
    const submitButton = submitButtons[0];
    console.log("Clicking Correct Exam button");
    await submitButton.click();
  }

  // Wait for API response and results to render
  await driver.sleep(8000);
  
  // Check page content for any visible text
  const pageBody = await driver.findElement({ css: 'body' }).getText();
  console.log("Page content sample:", pageBody.substring(0, 300));
  
  // Check for error messages that would indicate failure
  const errorAlerts = await driver.findElements({
    xpath: "//*[contains(@class, 'alert-error')]",
  });
  
  if (errorAlerts.length > 0) {
    const errorText = await errorAlerts[0].getText();
    console.log(`API Error found: ${errorText}`);
    throw new Error(`Correction failed with error: ${errorText}`);
  }
  
  // Verify results are displayed - look for the grade table
  const tables = await driver.findElements({ css: 'table' });
  console.log(`Found ${tables.length} tables`);
  
  if (tables.length === 0) {
    throw new Error("Correction results not displayed - table not found");
  }
  
  // Verify table contains expected information
  const tableText = await tables[0].getText();
  console.log("Grade table content sample:", tableText.substring(0, 200));
  
  // Verify the student's grade appears in the results
  const studentGradeElements = await driver.findElements({
    xpath: "//*[contains(text(), 'Test Student')]",
  });
  
  if (studentGradeElements.length === 0) {
    throw new Error("Student grade not found in results");
  }

  console.log("✓ Test Correct Exam PASSED - Results verified");
}
