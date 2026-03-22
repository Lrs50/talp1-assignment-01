import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import questionController from "./controllers/questionController";
import examController from "./controllers/examController";
import generateController from "./controllers/generateController";
import correctionController from "./controllers/correctionController";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use("/questions", questionController);
app.use("/exams", examController);
app.use("/exams", generateController);
app.use("/correction", correctionController);

// Centralized error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.message);
  const status = err.message.includes("not found") ? 404 : 400;
  res.status(status).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
