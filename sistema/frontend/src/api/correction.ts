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

export interface CorrectionRecord {
  id: number;
  exam_id: number;
  created_at: string;
  name: string | null;
  answer_key: string;
  student_responses: string;
  correction_mode: string;
  results: StudentGrade[];
}

export function correctExam(
  examId: number,
  answerKey: string,
  studentResponses: string,
  mode: CorrectionMode,
  name?: string
): Promise<StudentGrade[]> {
  return request<StudentGrade[]>("/correction", {
    method: "POST",
    body: JSON.stringify({ examId, answerKey, studentResponses, mode, name }),
  });
}

export function getCorrectionsByExamId(examId: number): Promise<CorrectionRecord[]> {
  return request<CorrectionRecord[]>(`/correction/exam/${examId}`, {
    method: "GET",
  });
}

export function getAllCorrections(): Promise<CorrectionRecord[]> {
  return request<CorrectionRecord[]>("/correction", {
    method: "GET",
  });
}
