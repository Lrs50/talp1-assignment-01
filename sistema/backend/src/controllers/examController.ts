import { Router, Request, Response } from "express";
import * as examService from "../services/examService";
import { AnswerMode } from "../models";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const exams = examService.listExams();
  res.json(exams);
});

router.post("/", (req: Request, res: Response) => {
  const { title, answerMode, questionIds } = req.body;
  const exam = examService.createExam(title, answerMode as AnswerMode, questionIds);
  res.status(201).json(exam);
});

router.put("/:id", (req: Request<{ id: string }>, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { title, answerMode, questionIds } = req.body;
  const exam = examService.updateExam(id, title, answerMode as AnswerMode, questionIds);
  res.json(exam);
});

router.delete("/:id", (req: Request<{ id: string }>, res: Response) => {
  const id = parseInt(req.params.id, 10);
  examService.deleteExam(id);
  res.status(204).send();
});

export default router;
