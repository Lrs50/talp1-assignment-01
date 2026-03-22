export interface Alternative {
  id: number;
  questionId: number;
  description: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  statement: string;
  alternatives: Alternative[];
}

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

export interface ExamVersion {
  versionNumber: number;
  examId: number;
  questions: Array<{
    question: Question;
    shuffledAlternatives: Alternative[];
  }>;
}

export interface StudentResponse {
  studentName: string;
  studentCpf: string;
  versionNumber: number;
  answers: string[];
}

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
