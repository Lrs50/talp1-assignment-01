import { Given, When, Then } from "@cucumber/cucumber";
import assert from "assert";

const BASE = "http://localhost:3001";

interface StudentGrade {
  studentName: string;
  studentCpf: string;
  totalScore: number;
  maxScore: number;
  questionGrades: Array<{ score: number }>;
}

let answerKeyLines: string[];
let studentResponseLines: string[];
let grades: StudentGrade[];
let examId: number;
let correctionMode: string;
let isPowersOfTwo = false;

async function ensureExamExists(mode: string): Promise<number> {
  const qRes = await fetch(`${BASE}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ statement: "Test question" }),
  });
  const q = (await qRes.json()) as { id: number };
  await fetch(`${BASE}/questions/${q.id}/alternatives`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description: "A", isCorrect: true }),
  });
  const eRes = await fetch(`${BASE}/exams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Correction Test Exam", answerMode: mode, questionIds: [q.id] }),
  });
  const exam = (await eRes.json()) as { id: number };
  return exam.id;
}

Given("an answer key with version {int} answers {string}", async function (version: number, answers: string) {
  answerKeyLines = ["versionNumber," + answers.split(",").map((_, i) => `q${i + 1}`).join(",")];
  answerKeyLines.push(`${version},${answers}`);

  // Detect mode from answer key content
  isPowersOfTwo = /^\d+$/.test(answers.trim()) && !answers.includes(",");
  const mode = isPowersOfTwo ? "powers_of_2" : "letters";
  examId = await ensureExamExists(mode);
  studentResponseLines = [];
});

Given(
  "student {string} CPF {string} version {int} answered {string}",
  function (name: string, cpf: string, version: number, answers: string) {
    if (studentResponseLines.length === 0) {
      const qCount = answers.split(",").length;
      const headers = ["studentName", "studentCpf", "versionNumber", ...Array.from({ length: qCount }, (_, i) => `q${i + 1}`)];
      studentResponseLines.push(headers.join(","));
    }
    studentResponseLines.push(`${name},${cpf},${version},${answers}`);
  }
);

When("I correct the exam in {string} mode", async function (mode: string) {
  correctionMode = mode;
  const res = await fetch(`${BASE}/correction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examId,
      answerKey: answerKeyLines.join("\n"),
      studentResponses: studentResponseLines.join("\n"),
      mode,
    }),
  });
  assert.ok(res.ok, `Correction failed: ${res.status} ${await res.text()}`);
  grades = (await res.json()) as StudentGrade[];
});

When("I correct the exam in {string} mode for powers_of_2", async function (mode: string) {
  correctionMode = mode;
  const res = await fetch(`${BASE}/correction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examId,
      answerKey: answerKeyLines.join("\n"),
      studentResponses: studentResponseLines.join("\n"),
      mode,
    }),
  });
  assert.ok(res.ok, `Correction failed: ${res.status} ${await res.text()}`);
  grades = (await res.json()) as StudentGrade[];
});

function findStudent(name: string): StudentGrade {
  const grade = grades.find((g) => g.studentName === name);
  assert.ok(grade, `Student ${name} not found in grades`);
  return grade;
}

Then("{string}'s total score is {float} out of {int}", function (name: string, score: number, maxScore: number) {
  const grade = findStudent(name);
  assert.ok(Math.abs(grade.totalScore - score) < 0.001, `Expected ${score}, got ${grade.totalScore}`);
  assert.strictEqual(grade.maxScore, maxScore);
});

Then("the grade report contains {int} students", function (count: number) {
  assert.strictEqual(grades.length, count);
});
