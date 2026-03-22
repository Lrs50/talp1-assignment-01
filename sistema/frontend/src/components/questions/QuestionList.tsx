import { Question } from "../../api/questions";

interface Props {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (id: number) => void;
}

export function QuestionList({ questions, onEdit, onDelete }: Props) {
  if (questions.length === 0) {
    return <p>No questions yet. Create one below.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {questions.map((q) => (
        <li
          key={q.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>{q.statement}</p>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#555" }}>
                {q.alternatives.length} alternative(s)
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onEdit(q)}>Edit</button>
              <button onClick={() => onDelete(q.id)}>Delete</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
