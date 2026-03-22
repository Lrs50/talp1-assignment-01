import {
  StudentResponse,
  CorrectionMode,
  StudentGrade,
  QuestionGrade,
} from "../models";
import {
  parseAnswerKeyCsv,
  parseStudentResponseCsv,
} from "../utils/csvParser";
import * as correctionsRepository from "../repositories/correctionsRepository";

function scoreStrictLetters(
  studentAnswer: string,
  correctAnswer: string
): number {
  return studentAnswer.trim().toUpperCase() === correctAnswer.trim().toUpperCase() ? 1 : 0;
}

function scorePartialPowersOfTwo(
  studentAnswer: string,
  correctAnswer: string
): number {
  const studentSum = parseInt(studentAnswer, 10) || 0;
  const correctSum = parseInt(correctAnswer, 10) || 0;

  if (correctSum === 0) return studentSum === 0 ? 1 : 0;

  // Count correct bits
  let correctBits = 0;
  let totalCorrectBits = 0;
  let totalBits = 0;

  for (let bit = 0; bit < 16; bit++) {
    const mask = 1 << bit;
    const inCorrect = (correctSum & mask) !== 0;
    const inStudent = (studentSum & mask) !== 0;

    if (inCorrect) totalCorrectBits++;
    if (inStudent) totalBits++;
    if (inCorrect && inStudent) correctBits++;
  }

  // Partial: ratio of correctly selected alternatives
  return totalCorrectBits > 0 ? correctBits / totalCorrectBits : 0;
}

function scoreQuestion(
  studentAnswer: string,
  correctAnswer: string,
  mode: CorrectionMode,
  answerMode: "letters" | "powers_of_2"
): number {
  if (mode === "strict") {
    return scoreStrictLetters(studentAnswer, correctAnswer);
  }

  // Partial correction
  if (answerMode === "letters") {
    return scoreStrictLetters(studentAnswer, correctAnswer);
  } else {
    return scorePartialPowersOfTwo(studentAnswer, correctAnswer);
  }
}

export function correctExam(
  answerKeyCsvText: string,
  studentResponsesCsvText: string,
  mode: CorrectionMode,
  answerMode: "letters" | "powers_of_2"
): StudentGrade[] {
  const answerKey = parseAnswerKeyCsv(answerKeyCsvText);
  const studentResponses = parseStudentResponseCsv(studentResponsesCsvText);

  return studentResponses.map((student) => {
    const correctAnswers = answerKey.get(student.versionNumber);
    if (!correctAnswers) {
      throw new Error(
        `No answer key found for version ${student.versionNumber}`
      );
    }

    const questionGrades: QuestionGrade[] = correctAnswers.map(
      (correct, index) => {
        const studentAnswer = student.answers[index] ?? "";
        const score = scoreQuestion(studentAnswer, correct, mode, answerMode);
        return { questionIndex: index + 1, score, maxScore: 1 };
      }
    );

    const totalScore = questionGrades.reduce((sum, g) => sum + g.score, 0);
    const maxScore = questionGrades.length;

    return {
      studentName: student.studentName,
      studentCpf: student.studentCpf,
      questionGrades,
      totalScore,
      maxScore,
    };
  });
}

export interface CorrectionWithId extends StudentGrade {
  correctionId: number;
}

export function correctExamAndSave(
  examId: number,
  answerKeyCsvText: string,
  studentResponsesCsvText: string,
  mode: CorrectionMode,
  answerMode: "letters" | "powers_of_2"
): CorrectionWithId[] {
  // Perform the correction
  const grades = correctExam(answerKeyCsvText, studentResponsesCsvText, mode, answerMode);
  
  // Save to database
  const record = correctionsRepository.saveCorrectionRecord(
    examId,
    answerKeyCsvText,
    studentResponsesCsvText,
    mode,
    JSON.stringify(grades)
  );
  
  // Return grades with correction ID
  return grades.map(grade => ({
    ...grade,
    correctionId: record.id
  }));
}
