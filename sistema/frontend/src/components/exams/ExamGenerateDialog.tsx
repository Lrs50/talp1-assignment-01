import { useState } from "react";
import { type Exam, generateExam, type ExamHeader } from "../../api/exams";

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
      const header: ExamHeader = {
        course: course.trim(),
        professor: professor.trim(),
        date: date.trim(),
      };
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
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 24,
    }}>
      <div style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        padding: 28,
        width: "100%",
        maxWidth: 440,
        boxShadow: "var(--shadow-md)",
      }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Generate Exam Versions</h3>
          <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            {exam.title}
          </p>
        </div>

        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label>Number of versions</label>
            <input
              type="number"
              min={1}
              max={20}
              value={versions}
              onChange={(e) => setVersions(parseInt(e.target.value, 10) || 1)}
              required
            />
            <p className="helper-text">Each version shuffles question and alternative order.</p>
          </div>

          <hr />

          <p style={{ margin: "0 0 12px", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Exam header (printed on each PDF)
          </p>

          <div className="form-group">
            <label>Course</label>
            <input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g. Introduction to Computer Science"
              required
            />
          </div>

          <div className="form-group">
            <label>Professor</label>
            <input
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              placeholder="e.g. Prof. Jane Smith"
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? "Generating…" : `Download ${versions} version${versions !== 1 ? "s" : ""} (ZIP)`}
            </button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
