import { getDatabase } from "./database";
import { Exam, AnswerMode } from "../models";

interface ExamRow {
  id: number;
  title: string;
  answer_mode: AnswerMode;
}

interface ExamQuestionRow {
  question_id: number;
}

function fetchQuestionIds(examId: number): number[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      "SELECT question_id FROM exam_questions WHERE exam_id = ? ORDER BY position"
    )
    .all(examId) as ExamQuestionRow[];
  return rows.map((r) => r.question_id);
}

function toExam(row: ExamRow): Exam {
  return {
    id: row.id,
    title: row.title,
    answerMode: row.answer_mode,
    questionIds: fetchQuestionIds(row.id),
  };
}

export function findAllExams(): Exam[] {
  const db = getDatabase();
  const rows = db
    .prepare("SELECT * FROM exams ORDER BY id")
    .all() as ExamRow[];
  return rows.map(toExam);
}

export function findExamById(id: number): Exam | undefined {
  const db = getDatabase();
  const row = db
    .prepare("SELECT * FROM exams WHERE id = ?")
    .get(id) as ExamRow | undefined;
  if (!row) return undefined;
  return toExam(row);
}

export function createExam(
  title: string,
  answerMode: AnswerMode,
  questionIds: number[]
): Exam {
  const db = getDatabase();
  const insertExam = db.prepare(
    "INSERT INTO exams (title, answer_mode) VALUES (?, ?)"
  );
  const insertQuestion = db.prepare(
    "INSERT INTO exam_questions (exam_id, question_id, position) VALUES (?, ?, ?)"
  );

  const transaction = db.transaction(() => {
    const result = insertExam.run(title, answerMode);
    const examId = result.lastInsertRowid as number;
    questionIds.forEach((qId, index) => {
      insertQuestion.run(examId, qId, index);
    });
    return examId;
  });

  const examId = transaction();
  return { id: examId, title, answerMode, questionIds };
}

export function updateExam(
  id: number,
  title: string,
  answerMode: AnswerMode,
  questionIds: number[]
): boolean {
  const db = getDatabase();
  const updateExamStmt = db.prepare(
    "UPDATE exams SET title = ?, answer_mode = ? WHERE id = ?"
  );
  const deleteQuestions = db.prepare(
    "DELETE FROM exam_questions WHERE exam_id = ?"
  );
  const insertQuestion = db.prepare(
    "INSERT INTO exam_questions (exam_id, question_id, position) VALUES (?, ?, ?)"
  );

  const transaction = db.transaction(() => {
    const result = updateExamStmt.run(title, answerMode, id);
    if (result.changes === 0) return false;
    deleteQuestions.run(id);
    questionIds.forEach((qId, index) => {
      insertQuestion.run(id, qId, index);
    });
    return true;
  });

  return transaction();
}

export function deleteExam(id: number): boolean {
  const db = getDatabase();
  const result = db.prepare("DELETE FROM exams WHERE id = ?").run(id);
  return result.changes > 0;
}
