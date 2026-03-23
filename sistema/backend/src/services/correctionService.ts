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
import PDFDocument from "pdfkit";
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

  // Jaccard Index: |intersection| / |union|
  // Penalizes both missing bits AND extra incorrect bits selected
  let correctBits = 0;
  let unionBits = 0;

  for (let bit = 0; bit < 16; bit++) {
    const mask = 1 << bit;
    const inCorrect = (correctSum & mask) !== 0;
    const inStudent = (studentSum & mask) !== 0;

    // Count bits in union (either correct OR student selected)
    if (inCorrect || inStudent) unionBits++;
    // Count bits in intersection (both correct AND student selected)
    if (inCorrect && inStudent) correctBits++;
  }

  return unionBits > 0 ? correctBits / unionBits : 0;
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
  answerMode: "letters" | "powers_of_2",
  name?: string
): CorrectionWithId[] {
  // Perform the correction
  const grades = correctExam(answerKeyCsvText, studentResponsesCsvText, mode, answerMode);
  
  // Save to database
  const record = correctionsRepository.saveCorrectionRecord(
    examId,
    answerKeyCsvText,
    studentResponsesCsvText,
    mode,
    JSON.stringify(grades),
    name
  );
  
  // Return grades with correction ID
  return grades.map(grade => ({
    ...grade,
    correctionId: record.id
  }));
}

export function generateCorrectionReportPdf(
  correctionName: string,
  creationDate: string,
  mode: string,
  grades: StudentGrade[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Header
    doc.fontSize(14).font("Helvetica-Bold").text(correctionName || "Correction Report", { align: "center" });
    doc.fontSize(10).font("Helvetica").text(`Date: ${new Date(creationDate).toLocaleDateString()}`, { align: "center" });
    doc.text(`Mode: ${mode}`, { align: "center" });
    doc.moveDown(1.5);

    // Summary stats
    if (grades.length === 0) {
      doc.text("No results to display");
      doc.end();
      return;
    }

    const scores = grades.map(g => (g.totalScore / g.maxScore) * 100);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;

    doc.fontSize(11).font("Helvetica-Bold").text("Summary");
    doc.fontSize(10).font("Helvetica");
    doc.text(`Total Students: ${grades.length}`);
    doc.text(`Average Score: ${average.toFixed(1)}%`);
    doc.moveDown(1);

    // Student scores table
    doc.fontSize(11).font("Helvetica-Bold").text("Student Results");
    doc.moveDown(0.5);

    grades.forEach(grade => {
      const percentage = (grade.totalScore / grade.maxScore) * 100;
      const line = `${grade.studentName} - ${grade.totalScore}/${grade.maxScore} (${percentage.toFixed(1)}%)`;
      doc.fontSize(10).font("Helvetica").text(line);
    });

    doc.end();
  });
}
