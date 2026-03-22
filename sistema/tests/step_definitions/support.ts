/**
 * Cucumber World setup.
 * Tests run against the backend HTTP API — no direct DB access needed here.
 */
import { setWorldConstructor, World, Before } from "@cucumber/cucumber";

const BASE = "http://localhost:3001";

async function deleteAll(path: string) {
  const res = await fetch(`${BASE}${path}`);
  const items = (await res.json()) as Array<{ id: number }>;
  for (const item of items) {
    await fetch(`${BASE}${path}/${item.id}`, { method: "DELETE" });
  }
}

// Wipe all data before each scenario. Exams must be deleted first to satisfy
// the FK RESTRICT constraint on exam_questions.question_id.
Before(async function () {
  await deleteAll("/exams");
  await deleteAll("/questions");
});

export class ExamWorld extends World {
  lastError: string | null = null;
}

setWorldConstructor(ExamWorld);
