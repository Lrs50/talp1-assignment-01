import request from "./client";

export type AnswerMode = "letters" | "powers_of_2";

export interface Exam {
  id: number;
  title: string;
  answerMode: AnswerMode;
  questionIds: number[];
}

export interface ExamHeader {
  course: string;
  professor: string;
  date: string;
}

export function fetchExams(): Promise<Exam[]> {
  return request<Exam[]>("/exams");
}

export function createExam(
  title: string,
  answerMode: AnswerMode,
  questionIds: number[]
): Promise<Exam> {
  return request<Exam>("/exams", {
    method: "POST",
    body: JSON.stringify({ title, answerMode, questionIds }),
  });
}

export function updateExam(
  id: number,
  title: string,
  answerMode: AnswerMode,
  questionIds: number[]
): Promise<Exam> {
  return request<Exam>(`/exams/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title, answerMode, questionIds }),
  });
}

export function deleteExam(id: number): Promise<void> {
  return request<void>(`/exams/${id}`, { method: "DELETE" });
}

export async function generateExam(
  examId: number,
  versions: number,
  header: ExamHeader
): Promise<void> {
  const response = await fetch(`http://localhost:3001/exams/${examId}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ versions, header }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error ?? response.statusText);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `exam_${examId}_versions.zip`;
  link.click();
  URL.revokeObjectURL(url);
}

export function getPdfPreviewUrl(examId: number): string {
  return `http://localhost:3001/exams/${examId}/pdf-preview`;
}
