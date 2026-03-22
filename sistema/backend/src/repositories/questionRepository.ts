import { getDatabase } from "./database";
import { Question, Alternative } from "../models";

interface QuestionRow {
  id: number;
  statement: string;
}

interface AlternativeRow {
  id: number;
  question_id: number;
  description: string;
  is_correct: number;
}

function toAlternative(row: AlternativeRow): Alternative {
  return {
    id: row.id,
    questionId: row.question_id,
    description: row.description,
    isCorrect: row.is_correct === 1,
  };
}

function fetchAlternativesForQuestion(questionId: number): Alternative[] {
  const db = getDatabase();
  const rows = db
    .prepare("SELECT * FROM alternatives WHERE question_id = ? ORDER BY id")
    .all(questionId) as AlternativeRow[];
  return rows.map(toAlternative);
}

export function findAllQuestions(): Question[] {
  const db = getDatabase();
  const rows = db
    .prepare("SELECT * FROM questions ORDER BY id")
    .all() as QuestionRow[];
  return rows.map((row) => ({
    id: row.id,
    statement: row.statement,
    alternatives: fetchAlternativesForQuestion(row.id),
  }));
}

export function findQuestionById(id: number): Question | undefined {
  const db = getDatabase();
  const row = db
    .prepare("SELECT * FROM questions WHERE id = ?")
    .get(id) as QuestionRow | undefined;
  if (!row) return undefined;
  return {
    id: row.id,
    statement: row.statement,
    alternatives: fetchAlternativesForQuestion(row.id),
  };
}

export function createQuestion(statement: string): Question {
  const db = getDatabase();
  const result = db
    .prepare("INSERT INTO questions (statement) VALUES (?)")
    .run(statement);
  return {
    id: result.lastInsertRowid as number,
    statement,
    alternatives: [],
  };
}

export function updateQuestion(id: number, statement: string): boolean {
  const db = getDatabase();
  const result = db
    .prepare("UPDATE questions SET statement = ? WHERE id = ?")
    .run(statement, id);
  return result.changes > 0;
}

export function deleteQuestion(id: number): boolean {
  const db = getDatabase();
  const result = db.prepare("DELETE FROM questions WHERE id = ?").run(id);
  return result.changes > 0;
}

export function addAlternative(
  questionId: number,
  description: string,
  isCorrect: boolean
): Alternative {
  const db = getDatabase();
  const result = db
    .prepare(
      "INSERT INTO alternatives (question_id, description, is_correct) VALUES (?, ?, ?)"
    )
    .run(questionId, description, isCorrect ? 1 : 0);
  return {
    id: result.lastInsertRowid as number,
    questionId,
    description,
    isCorrect,
  };
}

export function updateAlternative(
  questionId: number,
  alternativeId: number,
  description: string,
  isCorrect: boolean
): boolean {
  const db = getDatabase();
  const result = db
    .prepare(
      "UPDATE alternatives SET description = ?, is_correct = ? WHERE id = ? AND question_id = ?"
    )
    .run(description, isCorrect ? 1 : 0, alternativeId, questionId);
  return result.changes > 0;
}

export function deleteAlternative(
  questionId: number,
  alternativeId: number
): boolean {
  const db = getDatabase();
  const result = db
    .prepare("DELETE FROM alternatives WHERE id = ? AND question_id = ?")
    .run(alternativeId, questionId);
  return result.changes > 0;
}
