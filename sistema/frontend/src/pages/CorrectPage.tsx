import { useEffect, useState } from "react";
import { type Exam, fetchExams } from "../api/exams";
import { type StudentGrade, type CorrectionMode, correctExam } from "../api/correction";
import { CorrectionUpload } from "../components/correction/CorrectionUpload";
import { GradeTable } from "../components/correction/GradeTable";

export function CorrectPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchExams()
      .then(setExams)
      .catch(() => setError("Failed to load exams"));
  }, []);

  async function handleCorrect(
    examId: number,
    answerKey: string,
    studentResponses: string,
    mode: CorrectionMode
  ) {
    setError("");
    setSuccess(false);
    try {
      const result = await correctExam(examId, answerKey, studentResponses, mode);
      setGrades(result);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Correction failed");
    }
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h2>Exam Correction</h2>
          <p style={{ margin: "2px 0 0", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Upload or paste CSV files to grade student responses against an answer key.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <CorrectionUpload exams={exams} onCorrect={handleCorrect} />

      {success && grades.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            Correction complete — {grades.length} student{grades.length !== 1 ? "s" : ""} graded.
          </div>
          <GradeTable grades={grades} />
        </div>
      )}
    </div>
  );
}
