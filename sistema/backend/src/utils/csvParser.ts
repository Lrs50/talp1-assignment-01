import { StudentResponse } from "../models";

/**
 * Parses a student response CSV.
 * Expected format:
 *   studentName,studentCpf,versionNumber,q1,q2,...
 */
export function parseStudentResponseCsv(csvText: string): StudentResponse[] {
  const lines = csvText
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "");
  if (lines.length < 2) return [];

  const [headerLine, ...dataLines] = lines;
  const headers = headerLine.split(",").map((h) => h.trim());

  const fixedColumns = ["studentName", "studentCpf", "versionNumber"];
  fixedColumns.forEach((col) => {
    if (!headers.includes(col)) {
      throw new Error(`CSV missing required column: ${col}`);
    }
  });

  return dataLines.map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });

    const answers = headers
      .filter((h) => h.startsWith("q"))
      .sort()
      .map((h) => row[h] ?? "");

    return {
      studentName: row["studentName"],
      studentCpf: row["studentCpf"],
      versionNumber: parseInt(row["versionNumber"], 10),
      answers,
    };
  });
}

/**
 * Parses an answer key CSV.
 * Expected format:
 *   versionNumber,q1,q2,...
 * Returns a map of versionNumber → array of correct answers.
 */
export function parseAnswerKeyCsv(csvText: string): Map<number, string[]> {
  const lines = csvText
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "");
  if (lines.length < 2) return new Map();

  const [headerLine, ...dataLines] = lines;
  const headers = headerLine.split(",").map((h) => h.trim());

  const result = new Map<number, string[]>();

  for (const line of dataLines) {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });

    const versionNumber = parseInt(row["versionNumber"], 10);
    const answers = headers
      .filter((h) => h.startsWith("q"))
      .sort()
      .map((h) => row[h] ?? "");

    result.set(versionNumber, answers);
  }

  return result;
}
