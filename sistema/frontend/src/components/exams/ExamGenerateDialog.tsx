import { useState } from "react";
import { Exam, generateExam, ExamHeader } from "../../api/exams";

interface Props {
  exam: Exam;
  onClose: () => void;
}

export function ExamGenerateDialog({ exam, onClose }: Props) {
  const [versions, setVersions] = useState(1);
  const [course, setCourse] = useState("");
  const [professor, setProfessor] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!course.trim() || !professor.trim() || !date.trim()) return;
    setLoading(true);
    setError("");
    try {
      const header: ExamHeader = { course: course.trim(), professor: professor.trim(), date: date.trim() };
      await generateExam(exam.id, versions, header);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error generating exam");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
    }}>
      <div style={{ background: "white", borderRadius: 8, padding: 24, width: 400 }}>
        <h3 style={{ marginTop: 0 }}>Generate: {exam.title}</h3>
        <form onSubmit={handleGenerate}>
          <label style={{ display: "block", marginBottom: 4 }}>Number of versions</label>
          <input
            type="number"
            min={1}
            value={versions}
            onChange={(e) => setVersions(parseInt(e.target.value, 10))}
            style={{ width: "100%", marginBottom: 12, padding: "4px 8px" }}
            required
          />

          <label style={{ display: "block", marginBottom: 4 }}>Course</label>
          <input
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="Course name"
            style={{ width: "100%", marginBottom: 12, padding: "4px 8px" }}
            required
          />

          <label style={{ display: "block", marginBottom: 4 }}>Professor</label>
          <input
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            placeholder="Professor name"
            style={{ width: "100%", marginBottom: 12, padding: "4px 8px" }}
            required
          />

          <label style={{ display: "block", marginBottom: 4 }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: "100%", marginBottom: 16, padding: "4px 8px" }}
            required
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={loading}>
              {loading ? "Generating…" : "Download ZIP"}
            </button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
