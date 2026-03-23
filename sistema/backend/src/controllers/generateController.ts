import { Router, Request, Response } from "express";
import { generateExamPackage, generateSampleExamPdf } from "../services/generateService";

const router = Router();

router.get("/:id/pdf-preview", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const examId = parseInt(req.params.id, 10);
    
    // Use default header values for preview
    const header = {
      course: "Preview",
      professor: "Sample",
      date: new Date().toISOString().split('T')[0],
    };

    const pdfBuffer = await generateSampleExamPdf(examId, header);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="exam_preview_${examId}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Error generating PDF preview";
    console.error("[PDF Preview] Error:", errorMsg);
    res.status(400).json({ error: errorMsg });
  }
});

router.post("/:id/generate", async (req: Request<{ id: string }>, res: Response) => {
  const examId = parseInt(req.params.id, 10);
  const { versions, header } = req.body;

  if (!versions || versions < 1) {
    res.status(400).json({ error: "versions must be a positive number" });
    return;
  }
  if (!header || !header.course || !header.professor || !header.date) {
    res.status(400).json({ error: "header must include course, professor, and date" });
    return;
  }

  const { zipStream } = await generateExamPackage(examId, versions, header);

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="exam_${examId}_versions.zip"`
  );

  zipStream.pipe(res);
});

export default router;
