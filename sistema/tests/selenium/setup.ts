import { Builder, WebDriver } from "selenium-webdriver";

/**
 * Setup and teardown for Selenium WebDriver tests.
 * Configured to run against local dev server (localhost:3000).
 */

const FRONTEND_BASE_URL = "http://localhost:3000";
const BACKEND_BASE_URL = "http://localhost:3001";

/**
 * Create and return a WebDriver instance
 */
export async function createDriver(): Promise<WebDriver> {
  return new Builder()
    .forBrowser("chrome")
    .build();
}

/**
 * Navigate to frontend page
 */
export async function navigateTo(driver: WebDriver, path: string = "/"): Promise<void> {
  const url = path.startsWith("http") ? path : `${FRONTEND_BASE_URL}${path}`;
  await driver.get(url);
  // Wait a bit for page to load
  await driver.sleep(500);
}

/**
 * Wait for element to be present
 */
export async function waitForElement(
  driver: WebDriver,
  selector: string,
  timeoutMs: number = 5000
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    try {
      await driver.findElement({ css: selector });
      return;
    } catch {
      await driver.sleep(100);
    }
  }
  throw new Error(`Element not found: ${selector}`);
}

/**
 * Clear all data via backend API (for test isolation)
 */
export async function clearAllData(): Promise<void> {
  try {
    // Get all exams
    const examsRes = await fetch(`${BACKEND_BASE_URL}/exams`);
    const exams = (await examsRes.json()) as Array<{ id: number }>;
    for (const exam of exams) {
      await fetch(`${BACKEND_BASE_URL}/exams/${exam.id}`, { method: "DELETE" });
    }

    // Get all questions
    const questionsRes = await fetch(`${BACKEND_BASE_URL}/questions`);
    const questions = (await questionsRes.json()) as Array<{ id: number }>;
    for (const q of questions) {
      await fetch(`${BACKEND_BASE_URL}/questions/${q.id}`, { method: "DELETE" });
    }
  } catch (err) {
    console.warn("Could not clear data:", err);
  }
}
