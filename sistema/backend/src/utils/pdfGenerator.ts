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

    // Student info area at the end
    doc.moveDown(1);
    doc.fontSize(11).text("Name: ________________________________________________");
    doc.moveDown(0.5);
    doc.text("CPF: ___________________________");
    doc.moveDown(1.5);

    // Add version info at the end of content (not on separate page)
    doc.moveDown(2);
    doc.fontSize(8).font("Helvetica").text(`Version: ${version.versionNumber}`, { align: "right" });

    doc.end();
  });
}
