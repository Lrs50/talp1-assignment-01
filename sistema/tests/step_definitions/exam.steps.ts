import { Given, When, Then } from "@cucumber/cucumber";
import assert from "assert";

const BASE = "http://localhost:3001";

async function api(method: string, path: string, body?: unknown) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

let createdExamId: number;
let createdQuestionId: number;
let lastError: string | null;

async function createTestQuestion(statement: string): Promise<number> {
  const res = await api("POST", "/questions", { statement });
  const body = await res.json();
  const qId = (body as { id: number }).id;
  await api("POST", `/questions/${qId}/alternatives`, {
    description: "Option A",
    isCorrect: true,
  });
  await api("POST", `/questions/${qId}/alternatives`, {
    description: "Option B",
    isCorrect: false,
  });
  return qId;
}

Given("there is a question {string} with alternatives", async function (statement: string) {
  createdQuestionId = await createTestQuestion(statement);
});

When(
  "I create an exam titled {string} with answer mode {string} and question {string}",
  async function (title: string, answerMode: string, _statement: string) {
    lastError = null;
    const res = await api("POST", "/exams", {
      title,
      answerMode,
      questionIds: [createdQuestionId],
    });
    const body = await res.json();
    if (res.ok) {
      createdExamId = (body as { id: number }).id;
    } else {
      lastError = (body as { error: string }).error;
    }
  }
);

When("I try to create an exam with no questions", async function () {
  lastError = null;
  const res = await api("POST", "/exams", {
    title: "No Questions Exam",
    answerMode: "letters",
    questionIds: [],
  });
  const body = await res.json();
  if (!res.ok) lastError = (body as { error: string }).error;
});

When("I try to create an exam with answer mode {string}", async function (answerMode: string) {
  lastError = null;
  const res = await api("POST", "/exams", {
    title: "Invalid Mode Exam",
    answerMode,
    questionIds: [createdQuestionId],
  });
  const body = await res.json();
  if (!res.ok) lastError = (body as { error: string }).error;
});

Then("the exam list contains {int} exam(s)", async function (count: number) {
  const res = await api("GET", "/exams");
  const exams = (await res.json()) as unknown[];
  assert.strictEqual(exams.length, count);
});

Then("the exam title is {string}", async function (expected: string) {
  const res = await api("GET", "/exams");
  const exams = (await res.json()) as Array<{ id: number; title: string }>;
  const exam = exams.find((e) => e.id === createdExamId);
  assert.ok(exam, "Exam not found");
  assert.strictEqual(exam.title, expected);
});

Then("the exam answer mode is {string}", async function (expected: string) {
  const res = await api("GET", "/exams");
  const exams = (await res.json()) as Array<{ id: number; answerMode: string }>;
  const exam = exams.find((e) => e.id === createdExamId);
  assert.ok(exam, "Exam not found");
  assert.strictEqual(exam.answerMode, expected);
});

Given("there is an exam titled {string}", async function (title: string) {
  const qId = await createTestQuestion("Sample question");
  const res = await api("POST", "/exams", {
    title,
    answerMode: "letters",
    questionIds: [qId],
  });
  const body = await res.json();
  createdExamId = (body as { id: number }).id;
  createdQuestionId = qId;
});

When("I update the exam title to {string}", async function (title: string) {
  await api("PUT", `/exams/${createdExamId}`, {
    title,
    answerMode: "letters",
    questionIds: [createdQuestionId],
  });
});

When("I delete the exam", async function () {
  await api("DELETE", `/exams/${createdExamId}`);
});
