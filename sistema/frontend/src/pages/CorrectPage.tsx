import { useEffect, useState } from "react";
import { Exam, fetchExams } from "../api/exams";
import { StudentGrade, CorrectionMode, correctExam } from "../api/correction";
import { CorrectionUpload } from "../components/correction/CorrectionUpload";
import { GradeTable } from "../components/correction/GradeTable";

export function CorrectPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [error, setError] = useState("");

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
    try {
      const result = await correctExam(examId, answerKey, studentResponses, mode);
      setGrades(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Correction failed");
    }
  }

  return (
    <div>
      <h2>Exam Correction</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <CorrectionUpload exams={exams} onCorrect={handleCorrect} />
      {grades.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3>Grade Report</h3>
          <GradeTable grades={grades} />
        </div>
      )}
    </div>
  );
}
