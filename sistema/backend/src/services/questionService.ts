import * as questionRepository from "../repositories/questionRepository";
import { Question, Alternative } from "../models";

export function listQuestions(): Question[] {
  return questionRepository.findAllQuestions();
}

export function getQuestion(id: number): Question {
  const question = questionRepository.findQuestionById(id);
  if (!question) throw new Error(`Question ${id} not found`);
  return question;
}

export function createQuestion(statement: string): Question {
  if (!statement.trim()) throw new Error("Statement is required");
  return questionRepository.createQuestion(statement.trim());
}

export function updateQuestion(id: number, statement: string): Question {
  if (!statement.trim()) throw new Error("Statement is required");
  const updated = questionRepository.updateQuestion(id, statement.trim());
  if (!updated) throw new Error(`Question ${id} not found`);
  return questionRepository.findQuestionById(id)!;
}

export function deleteQuestion(id: number): void {
  const question = questionRepository.findQuestionById(id);
  if (!question) throw new Error(`Question ${id} not found`);
  if (questionRepository.isQuestionUsedByExam(id)) {
    throw new Error(`Question ${id} cannot be deleted because it is used by an exam`);
  }
  questionRepository.deleteQuestion(id);
}

export function addAlternative(
  questionId: number,
  description: string,
  isCorrect: boolean
): Alternative {
  const question = questionRepository.findQuestionById(questionId);
  if (!question) throw new Error(`Question ${questionId} not found`);
  if (!description.trim()) throw new Error("Description is required");
  return questionRepository.addAlternative(
    questionId,
    description.trim(),
    isCorrect
  );
}

export function updateAlternative(
  questionId: number,
  alternativeId: number,
  description: string,
  isCorrect: boolean
): void {
  const question = questionRepository.findQuestionById(questionId);
  if (!question) throw new Error(`Question ${questionId} not found`);
  if (!description.trim()) throw new Error("Description is required");
  const updated = questionRepository.updateAlternative(
    questionId,
    alternativeId,
    description.trim(),
    isCorrect
  );
  if (!updated) throw new Error(`Alternative ${alternativeId} not found`);
}

export function deleteAlternative(
  questionId: number,
  alternativeId: number
): void {
  const question = questionRepository.findQuestionById(questionId);
  if (!question) throw new Error(`Question ${questionId} not found`);
  const deleted = questionRepository.deleteAlternative(
    questionId,
    alternativeId
  );
  if (!deleted) throw new Error(`Alternative ${alternativeId} not found`);
}
