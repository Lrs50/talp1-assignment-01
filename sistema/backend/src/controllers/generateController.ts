import { Router, Request, Response } from "express";
import { generateExamPackage } from "../services/generateService";

const router = Router();

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
