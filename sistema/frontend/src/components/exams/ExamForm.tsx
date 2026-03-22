import { useState } from "react";
import { Exam, AnswerMode } from "../../api/exams";
import { Question } from "../../api/questions";

interface Props {
  exam?: Exam;
  availableQuestions: Question[];
  onSave: (title: string, answerMode: AnswerMode, questionIds: number[]) => void;
  onCancel: () => void;
}

export function ExamForm({ exam, availableQuestions, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(exam?.title ?? "");
  const [answerMode, setAnswerMode] = useState<AnswerMode>(exam?.answerMode ?? "letters");
  const [selectedIds, setSelectedIds] = useState<number[]>(exam?.questionIds ?? []);

  function toggleQuestion(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || selectedIds.length === 0) return;
    onSave(title.trim(), answerMode, selectedIds);
  }

  return (
    <form onSubmit={handleSubmit} style={{ border: "1px solid #ccc", borderRadius: 6, padding: 16, marginBottom: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Exam title"
          style={{ width: "100%", padding: "4px 8px" }}
          required
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Answer Mode</label>
        <select
          value={answerMode}
          onChange={(e) => setAnswerMode(e.target.value as AnswerMode)}
          style={{ padding: "4px 8px" }}
        >
          <option value="letters">Letters (A, B, C…)</option>
          <option value="powers_of_2">Powers of 2 (1, 2, 4…)</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Questions</label>
        {availableQuestions.length === 0 ? (
          <p style={{ color: "#888" }}>No questions available. Create questions first.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, maxHeight: 200, overflowY: "auto", border: "1px solid #eee", borderRadius: 4 }}>
            {availableQuestions.map((q) => (
              <li key={q.id} style={{ padding: "6px 8px", borderBottom: "1px solid #eee" }}>
                <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(q.id)}
                    onChange={() => toggleQuestion(q.id)}
                  />
                  {q.statement}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
