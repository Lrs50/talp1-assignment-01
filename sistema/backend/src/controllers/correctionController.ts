import { Router, Request, Response, NextFunction } from "express";
import { correctExamAndSave, generateCorrectionReportPdf } from "../services/correctionService";
import { CorrectionMode } from "../models";
import * as examRepository from "../repositories/examRepository";
import * as correctionsRepository from "../repositories/correctionsRepository";

const router = Router();

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { answerKey, studentResponses, mode, examId, name } = req.body;

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

    const grades = correctExamAndSave(
      parseInt(examId, 10),
      answerKey,
      studentResponses,
      mode as CorrectionMode,
      exam.answerMode,
      name
    );

    res.json(grades);
  } catch (err) {
    next(err);
  }
});

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const corrections = correctionsRepository.getAllCorrections();
    
    // Enrich with exam info
    const enriched = corrections.map(c => ({
      ...c,
      results: JSON.parse(c.results_json)
    }));
    
    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

router.get("/exam/:examId", (req: Request<{ examId: string }>, res: Response, next: NextFunction) => {
  try {
    const examId = parseInt(req.params.examId, 10);
    const corrections = correctionsRepository.getCorrectionsByExamId(examId);
    
    // Enrich with parsed results
    const enriched = corrections.map(c => ({
      ...c,
      results: JSON.parse(c.results_json)
    }));
    
    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const correctionId = parseInt(req.params.id, 10);
    const correction = correctionsRepository.getCorrectionById(correctionId);
    
    if (!correction) {
      res.status(404).json({ error: `Correction ${correctionId} not found` });
      return;
    }
    
    const enriched = {
      ...correction,
      results: JSON.parse(correction.results_json)
    };
    
    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/report-pdf", async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const correctionId = parseInt(req.params.id, 10);
    const correction = correctionsRepository.getCorrectionById(correctionId);
    
    if (!correction) {
      res.status(404).json({ error: `Correction ${correctionId} not found` });
      return;
    }

    const grades = JSON.parse(correction.results_json);
    const pdf = await generateCorrectionReportPdf(
      correction.name || "Correction Report",
      correction.created_at,
      correction.correction_mode,
      grades
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="correction_${correctionId}.pdf"`);
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});

export default router;
