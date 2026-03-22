import { useState } from "react";
import { type Exam, type AnswerMode } from "../../api/exams";
import { type Question } from "../../api/questions";

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
    <div className="card" style={{ marginBottom: 16 }}>
      <p style={{ margin: "0 0 16px", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
        {exam ? "EDIT EXAM" : "NEW EXAM"}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Midterm — Computer Science"
            required
          />
        </div>

        <div className="form-group">
          <label>Answer Mode</label>
          <select
            value={answerMode}
            onChange={(e) => setAnswerMode(e.target.value as AnswerMode)}
          >
            <option value="letters">Letters (A, B, C…) — single correct answer per question</option>
            <option value="powers_of_2">Powers of 2 — multiple correct answers, sum-based scoring</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            Questions
            {selectedIds.length > 0 && (
              <span style={{
                marginLeft: 8,
                fontWeight: 400,
                textTransform: "none",
                letterSpacing: 0,
                color: "var(--color-primary)",
              }}>
                {selectedIds.length} selected
              </span>
            )}
          </label>
          {availableQuestions.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>
              No questions available. Go to the Questions tab to create some first.
            </p>
          ) : (
            <div style={{
              maxHeight: 220,
              overflowY: "auto",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
            }}>
              {availableQuestions.map((q, index) => {
                const checked = selectedIds.includes(q.id);
                return (
                  <label
                    key={q.id}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      padding: "10px 12px",
                      borderBottom: index < availableQuestions.length - 1 ? "1px solid var(--color-border)" : "none",
                      background: checked ? "#eff6ff" : "transparent",
                      cursor: "pointer",
                      textTransform: "none",
                      letterSpacing: 0,
                      fontWeight: 400,
                      fontSize: "0.9rem",
                      color: "var(--color-text)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleQuestion(q.id)}
                      style={{ marginTop: 2, width: "auto", padding: 0, flexShrink: 0 }}
                    />
                    <span style={{ lineHeight: 1.4 }}>
                      {q.statement}
                      <span style={{ display: "block", fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                        {q.alternatives.length} alternative{q.alternatives.length !== 1 ? "s" : ""}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" className="btn-primary" disabled={selectedIds.length === 0}>
            {exam ? "Save changes" : "Create exam"}
          </button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
