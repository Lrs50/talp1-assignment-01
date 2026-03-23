import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(__dirname, "../../data/exam.db");

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      statement TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alternatives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      is_correct INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      answer_mode TEXT NOT NULL CHECK(answer_mode IN ('letters', 'powers_of_2'))
    );

    CREATE TABLE IF NOT EXISTS exam_questions (
      exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
      question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
      position INTEGER NOT NULL,
      PRIMARY KEY (exam_id, question_id)
    );

    CREATE TABLE IF NOT EXISTS corrections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      name TEXT,
      answer_key TEXT NOT NULL,
      student_responses TEXT NOT NULL,
      correction_mode TEXT NOT NULL CHECK(correction_mode IN ('strict', 'partial')),
      results_json TEXT NOT NULL
    );
  `);
  
  // Migration: Add name column if it doesn't exist (for existing databases)
  try {
    const result = db.prepare("PRAGMA table_info(corrections)").all() as Array<{ name: string }>;
    const hasNameColumn = result.some((col: any) => col.name === "name");
    if (!hasNameColumn) {
      db.exec(`ALTER TABLE corrections ADD COLUMN name TEXT;`);
    }
  } catch (err) {
    // Table might not exist yet or other error, ignore
  }
}
