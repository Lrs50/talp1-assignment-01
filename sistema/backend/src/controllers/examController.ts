import { Router, Request, Response, NextFunction } from "express";
import * as examService from "../services/examService";
import { AnswerMode } from "../models";

const router = Router();

router.get("/", (_req: Request, res: Response, next: NextFunction) => {
  try {
    const exams = examService.listExams();
    res.json(exams);
  } catch (err) {
    next(err);
  }
});

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, answerMode, questionIds } = req.body;
    const exam = examService.createExam(title, answerMode as AnswerMode, questionIds);
    res.status(201).json(exam);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, answerMode, questionIds } = req.body;
    const exam = examService.updateExam(id, title, answerMode as AnswerMode, questionIds);
    res.json(exam);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    examService.deleteExam(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
