import archiver from "archiver";
import { PassThrough } from "stream";
import * as examRepository from "../repositories/examRepository";
import * as questionRepository from "../repositories/questionRepository";
import { ExamVersion, ExamHeader } from "../models";
import { shuffle } from "../utils/randomizer";
import { generateExamPdf } from "../utils/pdfGenerator";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function getLetter(index: number): string {
  return LETTERS[index] ?? String(index + 1);
}

function getPowerOfTwo(index: number): number {
  return Math.pow(2, index);
}

function buildVersions(examId: number, count: number): ExamVersion[] {
  const exam = examRepository.findExamById(examId);
  if (!exam) throw new Error(`Exam ${examId} not found`);

  const questions = exam.questionIds.map((qId) => {
    const q = questionRepository.findQuestionById(qId);
    if (!q) throw new Error(`Question ${qId} not found`);
    return q;
  });

  const versions: ExamVersion[] = [];

  for (let v = 1; v <= count; v++) {
    const shuffledQuestions = shuffle(questions);
    versions.push({
      versionNumber: v,
      examId,
      questions: shuffledQuestions.map((q) => ({
        question: q,
        shuffledAlternatives: shuffle(q.alternatives),
      })),
    });
  }

  return versions;
}

function buildAnswerKeyCsv(
  versions: ExamVersion[],
  answerMode: "letters" | "powers_of_2"
): string {
  if (versions.length === 0) return "";

  const questionCount = versions[0].questions.length;
  const questionHeaders = Array.from(
    { length: questionCount },
    (_, i) => `q${i + 1}`
  );
  const header = ["versionNumber", ...questionHeaders].join(",");

  const rows = versions.map((version) => {
    const answers = version.questions.map(({ shuffledAlternatives }) => {
      if (answerMode === "letters") {
        const correctIndex = shuffledAlternatives.findIndex((a) => a.isCorrect);
        return correctIndex >= 0 ? getLetter(correctIndex) : "";
      } else {
        let sum = 0;
        shuffledAlternatives.forEach((a, i) => {
          if (a.isCorrect) sum += getPowerOfTwo(i);
        });
        return String(sum);
      }
    });
    return [version.versionNumber, ...answers].join(",");
  });

  return [header, ...rows].join("\n");
}

export async function generateExamPackage(
  examId: number,
  versionCount: number,
  header: ExamHeader
): Promise<{ zipStream: PassThrough }> {
  const exam = examRepository.findExamById(examId);
  if (!exam) throw new Error(`Exam ${examId} not found`);

  const versions = buildVersions(examId, versionCount);
  const answerKeyCsv = buildAnswerKeyCsv(versions, exam.answerMode);

  const pdfs = await Promise.all(
    versions.map((v) => generateExamPdf(v, header, exam.answerMode))
  );

  const zipStream = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 6 } });

  archive.on("error", (err) => zipStream.destroy(err));
  archive.pipe(zipStream);

  pdfs.forEach((pdfBuffer, i) => {
    archive.append(pdfBuffer, { name: `exam_version_${i + 1}.pdf` });
  });

  archive.append(answerKeyCsv, { name: "answer_key.csv" });
  archive.finalize();

  return { zipStream };
}
