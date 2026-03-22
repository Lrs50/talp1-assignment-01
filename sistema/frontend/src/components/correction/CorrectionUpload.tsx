import { useState } from "react";
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

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Exam</label>
        <select
          value={examId}
          onChange={(e) => setExamId(parseInt(e.target.value, 10))}
          style={{ padding: "4px 8px" }}
          required
        >
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.title}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Correction Mode</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as CorrectionMode)}
          style={{ padding: "4px 8px" }}
        >
          <option value="strict">Strict</option>
          <option value="partial">Partial</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Answer Key CSV</label>
        <input type="file" accept=".csv,text/csv" onChange={handleAnswerKeyFile} style={{ marginBottom: 6 }} />
        <textarea
          value={answerKeyText}
          onChange={(e) => setAnswerKeyText(e.target.value)}
          placeholder="Or paste answer key CSV here…"
          rows={4}
          style={{ width: "100%", padding: "4px 8px", fontFamily: "monospace" }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Student Responses CSV</label>
        <input type="file" accept=".csv,text/csv" onChange={handleStudentResponseFile} style={{ marginBottom: 6 }} />
        <textarea
          value={studentResponsesText}
          onChange={(e) => setStudentResponsesText(e.target.value)}
          placeholder="Or paste student responses CSV here…"
          rows={4}
          style={{ width: "100%", padding: "4px 8px", fontFamily: "monospace" }}
        />
      </div>

      <button type="submit">Correct Exam</button>
    </form>
  );
}
