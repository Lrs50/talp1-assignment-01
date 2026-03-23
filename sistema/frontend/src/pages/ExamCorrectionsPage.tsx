import { useEffect, useState } from "react";
import { getCorrectionsByExamId } from "../api/correction";
import type { CorrectionRecord } from "../api/correction";
import { fetchExams, type Exam } from "../api/exams";
import { ExamCorrectionReport } from "../components/exams/ExamCorrectionReport";

interface Props {
  examId: number;
  onClose: () => void;
}

export function ExamCorrectionsView({ examId, onClose }: Props) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [corrections, setCorrections] = useState<CorrectionRecord[]>([]);
  const [selectedCorrection, setSelectedCorrection] = useState<CorrectionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        // Fetch exam
        const exams = await fetchExams();
        const foundExam = exams.find((e) => e.id === examId);
        if (!foundExam) throw new Error("Exam not found");
        setExam(foundExam);

        // Fetch corrections
        const correctionsList = await getCorrectionsByExamId(examId);
        setCorrections(correctionsList);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load data";
        console.error("[ExamCorrectionsView] Error:", errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [examId]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 200,
          color: "var(--color-text-muted)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              border: "2px solid var(--color-border)",
              borderTopColor: "var(--color-primary)",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
          <p style={{ margin: 0 }}>Loading corrections…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 20,
          background: "var(--color-error-bg)",
          border: "1px solid var(--color-error-border)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-error-text)",
        }}
      >
        <p style={{ margin: "0 0 12px", fontWeight: 600 }}>Error Loading Corrections</p>
        <p style={{ margin: 0, fontSize: "0.9rem" }}>{error}</p>
        <button onClick={onClose} style={{ marginTop: 12 }} className="btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  if (selectedCorrection) {
    return (
      <ExamCorrectionReport
        correction={selectedCorrection}
        onClose={() => setSelectedCorrection(null)}
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: "0 0 8px", fontSize: "1.5rem", fontWeight: 600 }}>
            📊 {exam?.title}
          </h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
            {exam?.questionIds.length} questions · Mode: {exam?.answerMode}
          </p>
        </div>
        <button onClick={onClose} style={{ padding: "8px 16px" }}>
          Back to Exams
        </button>
      </div>

      {corrections.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            background: "var(--color-bg)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-muted)",
          }}
        >
          <p style={{ fontSize: "1rem", margin: "0 0 8px" }}>No corrections yet</p>
          <p style={{ fontSize: "0.85rem", margin: 0 }}>
            Start grading to see correction reports here
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {corrections.length} Correction{corrections.length !== 1 ? "s" : ""}
          </p>

          {corrections.map((correction) => {
            const date = new Date(correction.created_at);
            const dateStr = date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const studentCount = correction.results.length;
            const avgScore = (
              correction.results.reduce((sum, g) => sum + g.totalScore, 0) /
              correction.results.length /
              correction.results[0].maxScore
            ) * 100;

            return (
              <button
                key={correction.id}
                onClick={() => setSelectedCorrection(correction)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 16,
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(17, 17, 16, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "var(--color-text)",
                    }}
                  >
                    {correction.name || "Untitled Correction"}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.8rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {dateStr} · {correction.correction_mode} mode
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    alignItems: "center",
                    textAlign: "right",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                        marginBottom: 4,
                      }}
                    >
                      Students
                    </p>
                    <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
                      {studentCount}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                        marginBottom: 4,
                      }}
                    >
                      Average
                    </p>
                    <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
                      {avgScore.toFixed(0)}%
                    </p>
                  </div>

                  <span style={{ color: "var(--color-text-muted)" }}>→</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
