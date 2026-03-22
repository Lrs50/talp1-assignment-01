import { Router, Request, Response } from "express";
import { correctExam } from "../services/correctionService";
import { CorrectionMode } from "../models";
import * as examRepository from "../repositories/examRepository";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  const { answerKey, studentResponses, mode, examId } = req.body;

  if (!answerKey || !studentResponses) {
    res.status(400).json({ error: "answerKey and studentResponses are required" });
    return;
  }
  if (mode !== "strict" && mode !== "partial") {
    res.status(400).json({ error: "mode must be 'strict' or 'partial'" });
    return;
  }
  if (!examId) {
    res.status(400).json({ error: "examId is required to determine answer mode" });
    return;
  }

  const exam = examRepository.findExamById(parseInt(examId, 10));
  if (!exam) {
    res.status(404).json({ error: `Exam ${examId} not found` });
    return;
  }

  const grades = correctExam(
    answerKey,
    studentResponses,
    mode as CorrectionMode,
    exam.answerMode
  );

  res.json(grades);
});

export default router;
