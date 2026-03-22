import { Given, When, Then } from "@cucumber/cucumber";
import assert from "assert";
import AdmZip from "adm-zip";

const BASE = "http://localhost:3001";

async function api(method: string, path: string, body?: unknown) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

let zipBuffer: Buffer;
let examId: number;
let versionCount: number;

const DEFAULT_HEADER = {
  course: "Computer Science",
  professor: "Prof. Smith",
  date: "2026-03-21",
};

async function createExamWithQuestions(
  title: string,
  questionCount: number,
  answerMode: string
): Promise<number> {
  const questionIds: number[] = [];
  for (let i = 0; i < questionCount; i++) {
    const qRes = await api("POST", "/questions", { statement: `Question ${i + 1}` });
    const q = (await qRes.json()) as { id: number };
    await api("POST", `/questions/${q.id}/alternatives`, { description: "A", isCorrect: true });
    await api("POST", `/questions/${q.id}/alternatives`, { description: "B", isCorrect: false });
    questionIds.push(q.id);
  }
  const eRes = await api("POST", "/exams", { title, answerMode, questionIds });
  const exam = (await eRes.json()) as { id: number };
  return exam.id;
}

Given(
  "there is an exam {string} with {int} questions and answer mode {string}",
  async function (title: string, count: number, answerMode: string) {
    examId = await createExamWithQuestions(title, count, answerMode);
  }
);

Given(
  "there is an exam with answer mode {string} and {int} question with {int} alternatives",
  async function (answerMode: string, _qCount: number, altCount: number) {
    const qRes = await api("POST", "/questions", { statement: "Single question" });
    const q = (await qRes.json()) as { id: number };
    for (let i = 0; i < altCount; i++) {
      await api("POST", `/questions/${q.id}/alternatives`, {
        description: `Option ${i}`,
        isCorrect: i === 0,
      });
    }
    const eRes = await api("POST", "/exams", {
      title: "Test Exam",
      answerMode,
      questionIds: [q.id],
    });
    examId = ((await eRes.json()) as { id: number }).id;
  }
);

Given(
  "there is an exam with answer mode {string} and {int} question with correct alternatives at positions {int} and {int}",
  async function (answerMode: string, _qCount: number, pos1: number, pos2: number) {
    const qRes = await api("POST", "/questions", { statement: "Multi-correct question" });
    const q = (await qRes.json()) as { id: number };
    for (let i = 0; i < 3; i++) {
      await api("POST", `/questions/${q.id}/alternatives`, {
        description: `Option ${i}`,
        isCorrect: i === pos1 || i === pos2,
      });
    }
    const eRes = await api("POST", "/exams", {
      title: "Powers Exam",
      answerMode,
      questionIds: [q.id],
    });
    examId = ((await eRes.json()) as { id: number }).id;
  }
);

When(
  "I generate {int} versions of the exam with header info",
  async function (versions: number) {
    versionCount = versions;
    const res = await fetch(`${BASE}/exams/${examId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versions, header: DEFAULT_HEADER }),
    });
    assert.ok(res.ok, `Generation failed: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    zipBuffer = Buffer.from(arrayBuffer);
  }
);

When("I generate {int} version of the exam", async function (versions: number) {
  versionCount = versions;
  const res = await fetch(`${BASE}/exams/${examId}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ versions, header: DEFAULT_HEADER }),
  });
  assert.ok(res.ok, `Generation failed: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  zipBuffer = Buffer.from(arrayBuffer);
});

Then("I receive a ZIP file", function () {
  assert.ok(zipBuffer && zipBuffer.length > 0, "Expected a non-empty ZIP buffer");
});

Then("the ZIP contains {int} PDF files", function (count: number) {
  const zip = new AdmZip(zipBuffer);
  const pdfs = zip.getEntries().filter((e) => e.entryName.endsWith(".pdf"));
  assert.strictEqual(pdfs.length, count);
});

Then("the ZIP contains an answer key CSV", function () {
  const zip = new AdmZip(zipBuffer);
  const csv = zip.getEntries().find((e) => e.entryName === "answer_key.csv");
  assert.ok(csv, "answer_key.csv not found in ZIP");
});

Then("the answer key CSV has {int} data rows", function (count: number) {
  const zip = new AdmZip(zipBuffer);
  const csvEntry = zip.getEntry("answer_key.csv");
  assert.ok(csvEntry, "answer_key.csv not found");
  const content = csvEntry.getData().toString("utf-8");
  const lines = content.trim().split("\n").filter((l) => l.trim() !== "");
  // First line is header
  assert.strictEqual(lines.length - 1, count);
});

Then("the answer key answer is a single letter", function () {
  const zip = new AdmZip(zipBuffer);
  const csvEntry = zip.getEntry("answer_key.csv");
  assert.ok(csvEntry);
  const content = csvEntry.getData().toString("utf-8");
  const lines = content.trim().split("\n");
  const dataRow = lines[1];
  const answer = dataRow.split(",")[1].trim();
  assert.match(answer, /^[A-Z]$/, `Expected a single letter, got: ${answer}`);
});

Then("the answer key answer is a numeric sum", function () {
  const zip = new AdmZip(zipBuffer);
  const csvEntry = zip.getEntry("answer_key.csv");
  assert.ok(csvEntry);
  const content = csvEntry.getData().toString("utf-8");
  const lines = content.trim().split("\n");
  const dataRow = lines[1];
  const answer = dataRow.split(",")[1].trim();
  const num = parseInt(answer, 10);
  assert.ok(!isNaN(num) && num > 0, `Expected a positive numeric sum, got: ${answer}`);
});
