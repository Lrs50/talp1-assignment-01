import * as examRepository from "../repositories/examRepository";
import * as questionRepository from "../repositories/questionRepository";
import { Exam, AnswerMode } from "../models";

export function listExams(): Exam[] {
  return examRepository.findAllExams();
}

export function getExam(id: number): Exam {
  const exam = examRepository.findExamById(id);
  if (!exam) throw new Error(`Exam ${id} not found`);
  return exam;
}

function validateExamInput(
  title: string,
  answerMode: string,
  questionIds: number[]
): void {
  if (!title.trim()) throw new Error("Title is required");
  if (answerMode !== "letters" && answerMode !== "powers_of_2") {
    throw new Error("answerMode must be 'letters' or 'powers_of_2'");
  }
  if (!questionIds || questionIds.length === 0) {
    throw new Error("Exam must have at least one question");
  }
  for (const qId of questionIds) {
    const question = questionRepository.findQuestionById(qId);
    if (!question) throw new Error(`Question ${qId} not found`);
  }
}

export function createExam(
  title: string,
  answerMode: AnswerMode,
  questionIds: number[]
): Exam {
  validateExamInput(title, answerMode, questionIds);
  return examRepository.createExam(title.trim(), answerMode, questionIds);
}

export function updateExam(
  id: number,
  title: string,
  answerMode: AnswerMode,
  questionIds: number[]
): Exam {
  validateExamInput(title, answerMode, questionIds);
  const updated = examRepository.updateExam(
    id,
    title.trim(),
    answerMode,
    questionIds
  );
  if (!updated) throw new Error(`Exam ${id} not found`);
  return examRepository.findExamById(id)!;
}

export function deleteExam(id: number): void {
  const deleted = examRepository.deleteExam(id);
  if (!deleted) throw new Error(`Exam ${id} not found`);
}
