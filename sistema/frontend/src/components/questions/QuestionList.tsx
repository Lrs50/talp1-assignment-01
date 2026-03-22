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
        <p style={{ fontSize: "0.83rem", marginTop: 4 }}>
          Create your first question to start building exams.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {questions.map((q) => {
        const correctCount = q.alternatives.filter((a) => a.isCorrect).length;
        const hasAlternatives = q.alternatives.length > 0;
        return (
          <div key={q.id} className="card" style={{ padding: "14px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "0.93rem", lineHeight: 1.4, color: "var(--color-text)" }}>
                  {q.statement}
                </p>
                <p style={{ margin: "5px 0 0", fontSize: "0.78rem", color: hasAlternatives ? "var(--color-text-subtle)" : "var(--color-danger)" }}>
                  {hasAlternatives
                    ? `${q.alternatives.length} alternative${q.alternatives.length !== 1 ? "s" : ""} · ${correctCount} correct`
                    : "No alternatives — add some before using in an exam"}
                </p>
              </div>
              <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                <button onClick={() => onEdit(q)} style={{ fontSize: "0.82rem" }}>Edit</button>
                <button onClick={() => onDelete(q.id)} className="btn-danger" style={{ fontSize: "0.82rem" }}>Delete</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
