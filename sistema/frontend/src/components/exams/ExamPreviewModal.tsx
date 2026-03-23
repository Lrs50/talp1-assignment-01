import { type Exam } from "../../api/exams";
import { type Question } from "../../api/questions";

interface Props {
  exam: Exam;
  questions: Question[];
  onGenerate: () => void;
  onCancel: () => void;
}

const MODE_LABEL: Record<string, string> = {
  letters: "Letters (A, B, C…)",
  powers_of_2: "Powers of 2",
};

export function ExamPreviewModal({ exam, questions, onGenerate, onCancel }: Props) {
  const examQuestions = questions.filter(q => exam.questionIds.includes(q.id));

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(17, 17, 16, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 24,
    }}>
      <div style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: 28,
        width: "100%",
        maxWidth: 600,
        maxHeight: "80vh",
        overflow: "auto",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, letterSpacing: "-0.01em" }}>
            Review Exam Before Generating
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            {exam.title}
          </p>
        </div>

        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Answer Mode
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "0.9rem", fontWeight: 600 }}>
                {MODE_LABEL[exam.answerMode] ?? exam.answerMode}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Total Questions
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "0.9rem", fontWeight: 600 }}>
                {examQuestions.length}
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 12px", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Questions in this exam
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {examQuestions.map((q, idx) => (
              <div key={q.id} style={{
                padding: "10px 12px",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
              }}>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  <strong>{idx + 1}.</strong> {q.statement}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  {q.alternatives.length} alternative{q.alternatives.length !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
          <button 
            onClick={onGenerate}
            className="btn-primary"
            style={{ flex: 1 }}
          >
            Continue to Generate
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
