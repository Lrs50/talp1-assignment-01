import { Router, Request, Response } from "express";
import * as questionService from "../services/questionService";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const questions = questionService.listQuestions();
  res.json(questions);
});

router.post("/", (req: Request, res: Response) => {
  const { statement } = req.body;
  const question = questionService.createQuestion(statement);
  res.status(201).json(question);
});

router.put("/:id", (req: Request<{ id: string }>, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { statement } = req.body;
  const question = questionService.updateQuestion(id, statement);
  res.json(question);
});

router.delete("/:id", (req: Request<{ id: string }>, res: Response) => {
  const id = parseInt(req.params.id, 10);
  questionService.deleteQuestion(id);
  res.status(204).send();
});

router.post("/:id/alternatives", (req: Request<{ id: string }>, res: Response) => {
  const questionId = parseInt(req.params.id, 10);
  const { description, isCorrect } = req.body;
  const alternative = questionService.addAlternative(
    questionId,
    description,
    Boolean(isCorrect)
  );
  res.status(201).json(alternative);
});

router.put(
  "/:id/alternatives/:altId",
  (req: Request<{ id: string; altId: string }>, res: Response) => {
    const questionId = parseInt(req.params.id, 10);
    const alternativeId = parseInt(req.params.altId, 10);
    const { description, isCorrect } = req.body;
    questionService.updateAlternative(
      questionId,
      alternativeId,
      description,
      Boolean(isCorrect)
    );
    res.status(204).send();
  }
);

router.delete(
  "/:id/alternatives/:altId",
  (req: Request<{ id: string; altId: string }>, res: Response) => {
    const questionId = parseInt(req.params.id, 10);
    const alternativeId = parseInt(req.params.altId, 10);
    questionService.deleteAlternative(questionId, alternativeId);
    res.status(204).send();
  }
);

export default router;
