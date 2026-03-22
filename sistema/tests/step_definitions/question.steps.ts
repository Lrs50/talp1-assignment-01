import { Given, When, Then, Before } from "@cucumber/cucumber";
import assert from "assert";

const BASE = "http://localhost:3001";

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

let createdQuestionId: number;
let createdAlternativeId: number;
let lastError: string | null;
let questionList: unknown[];

// Clean database before each scenario via a test helper endpoint
// (we use direct DELETE all for simplicity; backend does not expose this,
//  so tests rely on a fresh DB or we clean up within scenarios)

Given("the system has no questions", async function () {
  const res = await api("GET", "/questions");
  const questions = (await res.json()) as Array<{ id: number }>;
  for (const q of questions) {
    await api("DELETE", `/questions/${q.id}`);
  }
});

When("I create a question with statement {string}", async function (statement: string) {
  lastError = null;
  const res = await api("POST", "/questions", { statement });
  const body = await res.json();
  if (res.ok) {
    createdQuestionId = (body as { id: number }).id;
  } else {
    lastError = (body as { error: string }).error;
  }
});

When("I try to create a question with an empty statement", async function () {
  lastError = null;
  const res = await api("POST", "/questions", { statement: "" });
  const body = await res.json();
  if (!res.ok) lastError = (body as { error: string }).error;
});

Then("the question list contains {int} question(s)", async function (count: number) {
  const res = await api("GET", "/questions");
  questionList = await res.json() as unknown[];
  assert.strictEqual(questionList.length, count);
});

Then("the question statement is {string}", async function (expected: string) {
  const res = await api("GET", "/questions");
  const questions = (await res.json()) as Array<{ id: number; statement: string }>;
  const question = questions.find((q) => q.id === createdQuestionId);
  assert.ok(question, "Question not found");
  assert.strictEqual(question.statement, expected);
});

Given("there is a question with statement {string}", async function (statement: string) {
  const res = await api("POST", "/questions", { statement });
  const body = await res.json();
  createdQuestionId = (body as { id: number }).id;
});

When("I update the question statement to {string}", async function (statement: string) {
  await api("PUT", `/questions/${createdQuestionId}`, { statement });
});

When("I delete the question", async function () {
  await api("DELETE", `/questions/${createdQuestionId}`);
});

When("I add an alternative with description {string} marked as correct", async function (description: string) {
  const res = await api("POST", `/questions/${createdQuestionId}/alternatives`, {
    description,
    isCorrect: true,
  });
  const body = await res.json();
  createdAlternativeId = (body as { id: number }).id;
});

Then("the question has {int} alternative(s)", async function (count: number) {
  const res = await api("GET", "/questions");
  const questions = (await res.json()) as Array<{ id: number; alternatives: unknown[] }>;
  const question = questions.find((q) => q.id === createdQuestionId);
  assert.ok(question, "Question not found");
  assert.strictEqual(question.alternatives.length, count);
});

Then("the alternative description is {string}", async function (expected: string) {
  const res = await api("GET", "/questions");
  type AltWithDesc = { id: number; description: string };
  type QuestionWithAlts = { id: number; alternatives: AltWithDesc[] };
  const questions = (await res.json()) as QuestionWithAlts[];
  const question = questions.find((q) => q.id === createdQuestionId);
  assert.ok(question);
  const alt = question.alternatives.find((a) => a.id === createdAlternativeId);
  assert.ok(alt, "Alternative not found");
  assert.strictEqual(alt.description, expected);
});

Then("the alternative is marked as correct", async function () {
  const res = await api("GET", "/questions");
  type AltWithCorrect = { id: number; isCorrect: boolean };
  type QuestionWithAlts = { id: number; alternatives: AltWithCorrect[] };
  const questions = (await res.json()) as QuestionWithAlts[];
  const question = questions.find((q) => q.id === createdQuestionId);
  assert.ok(question);
  const alt = question.alternatives.find((a) => a.id === createdAlternativeId);
  assert.ok(alt, "Alternative not found");
  assert.strictEqual(alt.isCorrect, true);
});

Given("there is a question with an alternative {string} marked as incorrect", async function (description: string) {
  const qRes = await api("POST", "/questions", { statement: "Test question" });
  createdQuestionId = ((await qRes.json()) as { id: number }).id;
  const aRes = await api("POST", `/questions/${createdQuestionId}/alternatives`, {
    description,
    isCorrect: false,
  });
  createdAlternativeId = ((await aRes.json()) as { id: number }).id;
});

When("I update the alternative description to {string} and mark it as correct", async function (description: string) {
  await api("PUT", `/questions/${createdQuestionId}/alternatives/${createdAlternativeId}`, {
    description,
    isCorrect: true,
  });
});

Given("there is a question with an alternative {string}", async function (description: string) {
  const qRes = await api("POST", "/questions", { statement: "Test question" });
  createdQuestionId = ((await qRes.json()) as { id: number }).id;
  const aRes = await api("POST", `/questions/${createdQuestionId}/alternatives`, {
    description,
    isCorrect: false,
  });
  createdAlternativeId = ((await aRes.json()) as { id: number }).id;
});

When("I delete the alternative", async function () {
  await api("DELETE", `/questions/${createdQuestionId}/alternatives/${createdAlternativeId}`);
});

Then("I receive an error", function () {
  assert.ok(lastError, "Expected an error but got none");
});
