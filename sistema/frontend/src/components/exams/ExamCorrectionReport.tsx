import type { CorrectionRecord, StudentGrade } from "../../api/correction";
import { generateCorrectionReportPdf } from "../../api/exams";
import { useState } from "react";
import { ScoreDistributionChart } from "./ScoreDistributionChart";

interface Props {
  correction: CorrectionRecord;
  onClose: () => void;
  onEdit?: (correctionId: number, newName: string) => Promise<void>;
  onDelete?: (correctionId: number) => Promise<void>;
}

function getLetterGrade(percentage: number): string {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B";
  if (percentage >= 70) return "C";
  if (percentage >= 60) return "D";
  return "F";
}

export function ExamCorrectionReport({ correction, onClose, onEdit, onDelete }: Props) {
  const grades: StudentGrade[] = correction.results;
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(correction.name || "");
  const [isDeleting, setIsDeleting] = useState(false);

  if (grades.length === 0) {
    return (
      <div
        style={{
          padding: 24,
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          textAlign: "center",
          color: "var(--color-text-muted)",
        }}
      >
        <p>No grades in this correction</p>
      </div>
    );
  }

  // Calculate statistics
  const scores = grades.map((g) => g.totalScore);
  const maxScore = grades[0].maxScore;
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const sorted = [...scores].sort((a, b) => a - b);
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  const stdDev = Math.sqrt(
    scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length
  );

  // Calculate question difficulty
  const questionDifficulty = grades[0].questionGrades.map((_, qIdx) => {
    let correctCount = 0;
    grades.forEach((grade) => {
      if (grade.questionGrades[qIdx].score === grade.questionGrades[qIdx].maxScore) {
        correctCount++;
      }
    });
    return {
      questionIndex: qIdx + 1,
      correctCount,
      percentage: (correctCount / grades.length) * 100,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: "0 0 8px", fontSize: "1.25rem", fontWeight: 600 }}>
            Correction Report
          </h2>
          {isEditing ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Correction name..."
                style={{
                  padding: "4px 8px",
                  fontSize: "0.9rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={async () => {
                  if (onEdit) {
                    try {
                      await onEdit(correction.id, editName);
                      setIsEditing(false);
                    } catch (err) {
                      console.error("Error updating correction:", err);
                      alert("Failed to update correction");
                    }
                  }
                }}
                style={{ padding: "4px 12px", fontSize: "0.85rem" }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(correction.name || "");
                }}
                style={{ padding: "4px 12px", fontSize: "0.85rem" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
              {correction.name ? `${correction.name} · ` : ""}
              {new Date(correction.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })} · Mode: {correction.correction_mode}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                title="Edit correction name"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  if (!isDeleting) {
                    setIsDeleting(true);
                    return;
                  }
                  if (onDelete) {
                    try {
                      await onDelete(correction.id);
                      onClose();
                    } catch (err) {
                      console.error("Error deleting correction:", err);
                      alert("Failed to delete correction");
                      setIsDeleting(false);
                    }
                  }
                }}
                style={{
                  padding: "6px 12px",
                  fontSize: "0.85rem",
                  background: isDeleting ? "var(--color-danger)" : "transparent",
                  color: isDeleting ? "white" : "var(--color-text)",
                }}
                title={isDeleting ? "Click again to confirm deletion" : "Delete correction"}
              >
                {isDeleting ? "Confirm Delete" : "Delete"}
              </button>
            </>
          )}
          <button 
            onClick={async () => {
              try {
                const blob = await generateCorrectionReportPdf(correction.id);
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `correction_${correction.id}.pdf`;
                link.click();
                URL.revokeObjectURL(url);
              } catch (err) {
                console.error("Error exporting PDF:", err);
                alert("Failed to export PDF. Check console for details.");
              }
            }}
            style={{ padding: "6px 12px", fontSize: "0.85rem" }}
          >
            Export PDF
          </button>
          <button onClick={onClose} style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
            Close
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 16,
        }}
      >
        <div
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: 16,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              marginBottom: 8,
            }}
          >
            Students
          </p>
          <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>
            {grades.length}
          </p>
        </div>

        <div
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: 16,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              marginBottom: 8,
            }}
          >
            Average
          </p>
          <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>
            {average.toFixed(1)} / {maxScore}
          </p>
        </div>

        <div
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: 16,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              marginBottom: 8,
            }}
          >
            Median
          </p>
          <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>
            {median.toFixed(1)} / {maxScore}
          </p>
        </div>

        <div
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: 16,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              marginBottom: 8,
            }}
          >
            Std Dev
          </p>
          <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>
            {stdDev.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Score Distribution */}
      <ScoreDistributionChart grades={grades} />

      {/* Question Difficulty Analysis */}
      <div>
        <h3 style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 600 }}>
          Questions by Difficulty (% correct)
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
            gap: 8,
          }}
        >
          {questionDifficulty.map((q) => (
            <div
              key={q.questionIndex}
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: 12,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}
              >
                Q{q.questionIndex}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: q.percentage >= 75 ? "var(--color-accent)" : "var(--color-text)",
                }}
              >
                {q.percentage.toFixed(0)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Student Scores Table */}
      <div>
        <h3 style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 600 }}>
          Student Scores
        </h3>
        <div
          style={{
            overflowX: "auto",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.85rem",
            }}
          >
            <thead>
              <tr style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: "0.02em",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: "0.02em",
                    color: "var(--color-text-muted)",
                  }}
                >
                  CPF
                </th>
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: "0.02em",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Score
                </th>
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: "0.02em",
                    color: "var(--color-text-muted)",
                  }}
                >
                  %
                </th>
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "center",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: "0.02em",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Grade
                </th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, idx) => {
                const percentage = (grade.totalScore / grade.maxScore) * 100;
                const letterGrade = getLetterGrade(percentage);
                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom:
                        idx < grades.length - 1 ? "1px solid var(--color-border)" : "none",
                      background: idx % 2 === 0 ? "transparent" : "transparent",
                    }}
                  >
                    <td style={{ padding: "10px 12px" }}>
                      <strong>{grade.studentName}</strong>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                      {grade.studentCpf}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace" }}>
                      {grade.totalScore.toFixed(1)} / {grade.maxScore}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>
                      {percentage.toFixed(1)}%
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        textAlign: "center",
                        fontWeight: 600,
                        color: letterGrade === "F" ? "var(--color-danger)" : "var(--color-text)",
                      }}
                    >
                      {letterGrade}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export CSV */}
      <div>
        <button
          onClick={() => {
            const csv = [
              ["Name", "CPF", "Score", "Max", "Percentage", "Grade"].join(","),
              ...grades.map((grade) => {
                const percentage = (grade.totalScore / grade.maxScore) * 100;
                const letterGrade = getLetterGrade(percentage);
                return [
                  `"${grade.studentName}"`,
                  grade.studentCpf,
                  grade.totalScore,
                  grade.maxScore,
                  percentage.toFixed(1),
                  letterGrade,
                ].join(",");
              }),
            ].join("\n");

            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `correction_report_${new Date().toISOString().split("T")[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);
          }}
          className="btn-primary"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}
