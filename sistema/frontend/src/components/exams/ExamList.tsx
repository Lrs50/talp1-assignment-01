import { type Exam } from "../../api/exams";

interface Props {
  exams: Exam[];
  correctionCounts: Map<number, number>;
  onEdit: (exam: Exam) => void;
  onDelete: (id: number) => void;
  onGenerate: (exam: Exam) => void;
}

const MODE_LABEL: Record<string, string> = {
  letters: "Letters (A, B, C…)",
  powers_of_2: "Powers of 2",
};

export function ExamList({ exams, onEdit, onDelete, onGenerate }: Props) {
  if (exams.length === 0) {
    return (
      <div className="empty-state">
        <p>No exams yet.</p>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-subtle)" }}>
          Create an exam by selecting questions from your question bank.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {exams.map((exam) => {
        const correctionCount = correctionCounts?.get(exam.id) ?? 0;
        const hasCorrections = correctionCount > 0;
        
        return (
        <div 
          key={exam.id} 
          className="card"
          style={!hasCorrections ? {
            opacity: 0.6,
            color: "var(--color-text-muted)",
          } : undefined}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem", color: "var(--color-text)" }}>{exam.title}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
                <span className={`badge ${exam.answerMode === "letters" ? "badge-letters" : "badge-powers"}`}>
                  {MODE_LABEL[exam.answerMode] ?? exam.answerMode}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  {exam.questionIds.length} question{exam.questionIds.length !== 1 ? "s" : ""}
                </span>
                {hasCorrections && (
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    {correctionCount} correction{correctionCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {!hasCorrections && (
                <p style={{ margin: "8px 0 0", fontSize: "0.8rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                  No corrections yet
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button className="btn-primary" onClick={() => onGenerate(exam)}>Generate PDF</button>
              <button onClick={() => onEdit(exam)}>Edit</button>
              <button onClick={() => onDelete(exam.id)} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}
