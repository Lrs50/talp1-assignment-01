import { type Exam } from "../../api/exams";

interface Props {
  exams: Exam[];
  onEdit: (exam: Exam) => void;
  onDelete: (id: number) => void;
  onGenerate: (exam: Exam) => void;
}

export function ExamList({ exams, onEdit, onDelete, onGenerate }: Props) {
  if (exams.length === 0) {
    return <p>No exams yet. Create one below.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {exams.map((exam) => (
        <li
          key={exam.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: 0, fontWeight: "bold" }}>{exam.title}</p>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#555" }}>
                Mode: {exam.answerMode} · {exam.questionIds.length} question(s)
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onGenerate(exam)}>Generate</button>
              <button onClick={() => onEdit(exam)}>Edit</button>
              <button onClick={() => onDelete(exam.id)}>Delete</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
