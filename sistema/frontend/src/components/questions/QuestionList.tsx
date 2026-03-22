import { type Question } from "../../api/questions";

interface Props {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (id: number) => void;
}

export function QuestionList({ questions, onEdit, onDelete }: Props) {
  if (questions.length === 0) {
    return (
      <div className="empty-state">
        <p>No questions yet.</p>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-subtle)" }}>
          Create your first question to start building exams.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {questions.map((q) => {
        const correctCount = q.alternatives.filter((a) => a.isCorrect).length;
        return (
          <div key={q.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem", lineHeight: 1.4 }}>
                  {q.statement}
                </p>
                <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  {q.alternatives.length === 0
                    ? "No alternatives — add some before using in an exam"
                    : `${q.alternatives.length} alternative${q.alternatives.length !== 1 ? "s" : ""} · ${correctCount} correct`}
                </p>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => onEdit(q)}>Edit</button>
                <button onClick={() => onDelete(q.id)} className="btn-danger">Delete</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
