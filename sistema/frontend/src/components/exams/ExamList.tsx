import { type Exam } from "../../api/exams";

interface Props {
  exams: Exam[];
  correctionCounts: Map<number, number>;
  onEdit: (exam: Exam) => void;
  onDelete: (id: number) => void;
  onGenerate: (exam: Exam) => void;
  onViewCorrections: (examId: number) => void;
}

const MODE_LABEL: Record<string, string> = {
  letters: "Letters (A, B, C…)",
  powers_of_2: "Powers of 2",
};

export function ExamList({ exams, correctionCounts, onEdit, onDelete, onGenerate, onViewCorrections }: Props) {
  if (exams.length === 0) {
    return (
      <div className="empty-state">
        <p>No exams found.</p>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-subtle)" }}>
          Try adjusting your search or create a new exam.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {exams.map((exam) => {
        const correctionCount = correctionCounts?.get(exam.id) ?? 0;
        const hasCorrections = correctionCount > 0;
        
        return (
        <div 
          key={exam.id} 
          className="card"
          style={{ padding: "20px 24px" }}
        >
          {/* Header Section: Title + Mode */}
          <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--color-border-subtle)" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "var(--color-text)", letterSpacing: "-0.01em" }}>
              {exam.title}
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span className={`badge ${exam.answerMode === "letters" ? "badge-letters" : "badge-powers"}`}>
                {MODE_LABEL[exam.answerMode] ?? exam.answerMode}
              </span>
            </div>
          </div>

          {/* Metadata Section: Questions, Corrections */}
          <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--color-border-subtle)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  Questions
                </p>
                <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-text)", fontWeight: 600 }}>
                  {exam.questionIds.length}
                </p>
              </div>
              {hasCorrections && (
                <div>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                    Corrections
                  </p>
                  <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-text)", fontWeight: 600 }}>
                    {correctionCount}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions Section: Buttons */}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
            {hasCorrections && (
              <button onClick={() => onViewCorrections(exam.id)} style={{ fontSize: "0.85rem", padding: "8px 14px" }}>
                View Corrections
              </button>
            )}
            <button className="btn-primary" onClick={() => onGenerate(exam)} style={{ fontSize: "0.85rem", padding: "8px 14px" }}>
              Generate PDF
            </button>
            <button onClick={() => onEdit(exam)} style={{ fontSize: "0.85rem", padding: "8px 14px" }}>
              Edit
            </button>
            <button onClick={() => onDelete(exam.id)} className="btn-danger" style={{ fontSize: "0.85rem", padding: "8px 14px" }}>
              Delete
            </button>
          </div>
        </div>
        );
      })}
    </div>
  );
}
