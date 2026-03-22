import request from "./client";

export type CorrectionMode = "strict" | "partial";

export interface QuestionGrade {
  questionIndex: number;
  score: number;
  maxScore: number;
}

export interface StudentGrade {
  studentName: string;
  studentCpf: string;
  questionGrades: QuestionGrade[];
  totalScore: number;
  maxScore: number;
}

export function correctExam(
  examId: number,
  answerKey: string,
  studentResponses: string,
  mode: CorrectionMode
): Promise<StudentGrade[]> {
  return request<StudentGrade[]>("/correction", {
    method: "POST",
    body: JSON.stringify({ examId, answerKey, studentResponses, mode }),
  });
}
