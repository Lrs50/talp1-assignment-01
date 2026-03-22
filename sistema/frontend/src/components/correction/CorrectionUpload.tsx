import { useState, useEffect } from "react";
import { type CorrectionMode } from "../../api/correction";
import { type Exam } from "../../api/exams";

interface Props {
  exams: Exam[];
  onCorrect: (examId: number, answerKey: string, studentResponses: string, mode: CorrectionMode) => void;
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function CorrectionUpload({ exams, onCorrect }: Props) {
  const [examId, setExamId] = useState<number | "">(exams[0]?.id ?? "");
  const [mode, setMode] = useState<CorrectionMode>("strict");

  useEffect(() => {
    if (examId === "" && exams.length > 0) {
      setExamId(exams[0].id);
    }
  }, [exams]);
  const [answerKeyText, setAnswerKeyText] = useState("");
  const [studentResponsesText, setStudentResponsesText] = useState("");

  async function handleAnswerKeyFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAnswerKeyText(await readFileAsText(file));
  }

  async function handleStudentResponseFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setStudentResponsesText(await readFileAsText(file));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!examId || !answerKeyText.trim() || !studentResponsesText.trim()) return;
    onCorrect(examId as number, answerKeyText, studentResponsesText, mode);
  }

  if (exams.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--color-text-muted)" }}>
        <p style={{ margin: 0 }}>No exams found. Create an exam first before correcting responses.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-label">Settings</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Exam</label>
            <select
              value={examId}
              onChange={(e) => setExamId(parseInt(e.target.value, 10))}
              required
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label>Correction Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as CorrectionMode)}
            >
              <option value="strict">Strict — exact match required</option>
              <option value="partial">Partial — proportional score (powers of 2)</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="section-label">Answer Key CSV</div>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleAnswerKeyFile}
            style={{ marginBottom: 10, width: "100%" }}
          />
          <textarea
            value={answerKeyText}
            onChange={(e) => setAnswerKeyText(e.target.value)}
            placeholder="Or paste CSV here…"
            rows={5}
            style={{ width: "100%", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}
          />
          <div className="hint-box" style={{ marginTop: 8 }}>
            <strong>Expected format:</strong><br />
            versionNumber,q1,q2,q3<br />
            1,A,C,B<br />
            2,B,A,C
          </div>
        </div>

        <div className="card">
          <div className="section-label">Student Responses CSV</div>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleStudentResponseFile}
            style={{ marginBottom: 10, width: "100%" }}
          />
          <textarea
            value={studentResponsesText}
            onChange={(e) => setStudentResponsesText(e.target.value)}
            placeholder="Or paste CSV here…"
            rows={5}
            style={{ width: "100%", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}
          />
          <div className="hint-box" style={{ marginTop: 8 }}>
            <strong>Expected format:</strong><br />
            studentName,studentCpf,versionNumber,q1,q2,q3<br />
            Alice,111.222.333-44,1,A,C,B<br />
            Bob,555.666.777-88,2,A,B,C
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={!examId || !answerKeyText.trim() || !studentResponsesText.trim()}
        style={{ padding: "10px 24px" }}
      >
        Correct Exam
      </button>
    </form>
  );
}
