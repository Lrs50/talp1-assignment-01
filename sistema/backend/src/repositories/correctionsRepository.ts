import { getDatabase } from "./database";

export interface CorrectionRecord {
  id: number;
  exam_id: number;
  created_at: string;
  name: string | null;
  answer_key: string;
  student_responses: string;
  correction_mode: string;
  results_json: string;
}

export function saveCorrectionRecord(
  examId: number,
  answerKey: string,
  studentResponses: string,
  correctionMode: string,
  resultsJson: string,
  name?: string
): CorrectionRecord {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO corrections (exam_id, answer_key, student_responses, correction_mode, results_json, name)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(examId, answerKey, studentResponses, correctionMode, resultsJson, name || null);
  
  // Query the inserted record to get the full data including created_at and id
  const selectStmt = db.prepare(`SELECT * FROM corrections WHERE id = ?`);
  const record = selectStmt.get(result.lastInsertRowid) as CorrectionRecord;
  return record;
}

export function getCorrectionsByExamId(examId: number): CorrectionRecord[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM corrections
    WHERE exam_id = ?
    ORDER BY created_at DESC
  `);
  return stmt.all(examId) as CorrectionRecord[];
}

export function getCorrectionById(correctionId: number): CorrectionRecord | null {
  const db = getDatabase();
  const stmt = db.prepare(`SELECT * FROM corrections WHERE id = ?`);
  return (stmt.get(correctionId) as CorrectionRecord) || null;
}

export function getAllCorrections(): CorrectionRecord[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM corrections
    ORDER BY created_at DESC
  `);
  return stmt.all() as CorrectionRecord[];
}

export function deleteCorrection(correctionId: number): boolean {
  const db = getDatabase();
  const stmt = db.prepare(`DELETE FROM corrections WHERE id = ?`);
  const result = stmt.run(correctionId);
  return result.changes > 0;
}

export function updateCorrectionName(correctionId: number, newName: string): CorrectionRecord | null {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE corrections
    SET name = ?
    WHERE id = ?
  `);
  const result = stmt.run(newName, correctionId);
  
  if (result.changes > 0) {
    return getCorrectionById(correctionId);
  }
  return null;
}
