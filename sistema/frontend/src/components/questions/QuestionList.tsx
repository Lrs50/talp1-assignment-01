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
        <p>No questions found.</p>
        <p style={{ fontSize: "0.85rem", marginTop: 4 }}>
          Try adjusting your search or create a new question.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {questions.map((q) => {
        const correctCount = q.alternatives.filter((a) => a.isCorrect).length;
        const hasAlternatives = q.alternatives.length > 0;
        return (
          <div key={q.id} className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.4, color: "var(--color-text)", fontWeight: 500 }}>
                  {q.statement}
                </p>
                <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center", fontSize: "0.8rem" }}>
                  <span style={{ color: hasAlternatives ? "var(--color-text-muted)" : "var(--color-danger)" }}>
                    {hasAlternatives
                      ? `${q.alternatives.length} alternative${q.alternatives.length !== 1 ? "s" : ""} • ${correctCount} correct`
                      : "No alternatives"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => onEdit(q)} style={{ fontSize: "0.82rem", padding: "6px 12px" }}>Edit</button>
                <button onClick={() => onDelete(q.id)} className="btn-danger" style={{ fontSize: "0.82rem", padding: "6px 12px" }}>Delete</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
