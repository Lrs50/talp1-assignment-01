import request from "./client";

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

export function fetchQuestions(): Promise<Question[]> {
  return request<Question[]>("/questions");
}

export function createQuestion(statement: string): Promise<Question> {
  return request<Question>("/questions", {
    method: "POST",
    body: JSON.stringify({ statement }),
  });
}

export function updateQuestion(id: number, statement: string): Promise<Question> {
  return request<Question>(`/questions/${id}`, {
    method: "PUT",
    body: JSON.stringify({ statement }),
  });
}

export function deleteQuestion(id: number): Promise<void> {
  return request<void>(`/questions/${id}`, { method: "DELETE" });
}

export function addAlternative(
  questionId: number,
  description: string,
  isCorrect: boolean
): Promise<Alternative> {
  return request<Alternative>(`/questions/${questionId}/alternatives`, {
    method: "POST",
    body: JSON.stringify({ description, isCorrect }),
  });
}

export function updateAlternative(
  questionId: number,
  altId: number,
  description: string,
  isCorrect: boolean
): Promise<void> {
  return request<void>(`/questions/${questionId}/alternatives/${altId}`, {
    method: "PUT",
    body: JSON.stringify({ description, isCorrect }),
  });
}

export function deleteAlternative(questionId: number, altId: number): Promise<void> {
  return request<void>(`/questions/${questionId}/alternatives/${altId}`, {
    method: "DELETE",
  });
}
