import PDFDocument from "pdfkit";
import { ExamVersion, ExamHeader, AnswerMode } from "../models";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function getLetter(index: number): string {
  return LETTERS[index] ?? String(index + 1);
}

function getPowerOfTwo(index: number): number {
  return Math.pow(2, index);
}

/**
 * Generates a PDF buffer for a single exam version.
 */
export function generateExamPdf(
  version: ExamVersion,
  header: ExamHeader,
  answerMode: AnswerMode
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Header
    doc.fontSize(14).font("Helvetica-Bold").text(header.course, { align: "center" });
    doc.fontSize(11).font("Helvetica").text(`Professor: ${header.professor}`, { align: "center" });
    doc.text(`Date: ${header.date}`, { align: "center" });
    doc.moveDown();

    // Student info area
    doc.fontSize(11).text("Name: ________________________________________________");
    doc.moveDown(0.5);
    doc.text("CPF: ___________________________");
    doc.moveDown(1.5);

    // Questions
    version.questions.forEach(({ question, shuffledAlternatives }, qIndex) => {
      doc.fontSize(11).font("Helvetica-Bold").text(`${qIndex + 1}. ${question.statement}`);
      doc.moveDown(0.3);

      if (answerMode === "letters") {
        doc.font("Helvetica").fontSize(10);
        shuffledAlternatives.forEach((alt, altIndex) => {
          doc.text(`   ${getLetter(altIndex)}) ${alt.description}`);
        });
        doc.moveDown(0.3);
        const letterOptions = shuffledAlternatives.map((_, i) => getLetter(i)).join("   ");
        doc.text(`   Answer: [ ${letterOptions} ]`);
      } else {
        doc.font("Helvetica").fontSize(10);
        shuffledAlternatives.forEach((alt, altIndex) => {
          const power = getPowerOfTwo(altIndex);
          doc.text(`   (${power}) ${alt.description}`);
        });
        doc.moveDown(0.3);
        doc.text("   Sum: ________");
      }

      doc.moveDown(1);
    });

    // Footer with version number
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          `Version: ${version.versionNumber}`,
          50,
          doc.page.height - 40,
          { align: "right" }
        );
    }

    doc.end();
  });
}
