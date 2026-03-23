import { useEffect, useState } from "react";
import { type Exam, fetchExams } from "../api/exams";
import { type StudentGrade, type CorrectionMode, correctExam, getCorrectionsByExamId, renameCorrectionRecord, type CorrectionRecord } from "../api/correction";
import { CorrectionUpload } from "../components/correction/CorrectionUpload";
import { GradeTable } from "../components/correction/GradeTable";

export function CorrectPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [corrections, setCorrections] = useState<CorrectionRecord[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [showHistroy, setShowHistory] = useState(false);
  const [editingCorrectionId, setEditingCorrectionId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [renamingError, setRenamingError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const examsData = await fetchExams();
        setExams(examsData);
        setError("");
      } catch (err) {
        setError("Failed to load exams");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      (async () => {
        try {
          const data = await getCorrectionsByExamId(selectedExamId);
          setCorrections(data);
        } catch {
          // Silently fail for corrections history
        }
      })();
    }
  }, [selectedExamId]);

  async function handleCorrect(
    examId: number,
    answerKey: string,
    studentResponses: string,
    mode: CorrectionMode,
    name?: string
  ) {
    setError("");
    setSuccess(false);
    try {
      setSubmitting(true);
      const result = await correctExam(examId, answerKey, studentResponses, mode, name);
      setGrades(result);
      setSuccess(true);
      setSelectedExamId(examId);
      // Reload corrections history
      const data = await getCorrectionsByExamId(examId);
      setCorrections(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Correction failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRenameCorrection(correctionId: number, newName: string) {
    if (!newName.trim()) {
      setRenamingError("Name cannot be empty");
      return;
    }
    try {
      setRenamingError("");
      const updated = await renameCorrectionRecord(correctionId, newName);
      setCorrections(corrections.map(c => c.id === correctionId ? updated : c));
      setEditingCorrectionId(null);
      setEditingName("");
    } catch (err: unknown) {
      setRenamingError(err instanceof Error ? err.message : "Failed to rename");
    }
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h2>Exam Correction</h2>
          <p style={{ margin: "2px 0 0", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Upload or paste CSV files to grade student responses against an answer key.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: 48,
          color: "var(--color-text-muted)",
        }}>
          <div style={{
            width: 18,
            height: 18,
            border: "2px solid var(--color-border)",
            borderTopColor: "var(--color-primary)",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
          }} />
          Loading exams...
        </div>
      ) : (
        <>
          <CorrectionUpload exams={exams} onCorrect={handleCorrect} />

          {success && grades.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div className="alert alert-success" style={{ marginBottom: 20 }}>
                Correction complete — {grades.length} student{grades.length !== 1 ? "s" : ""} graded.
              </div>
              <GradeTable grades={grades} />
              
              {corrections.length > 0 && (
                <div style={{ marginTop: 32 }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 600 }}>
                    Past corrections for this exam
                  </h3>
                  <div style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                  }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
                          <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" }}>
                            Name
                          </th>
                          <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" }}>
                            Date & Time
                          </th>
                          <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" }}>
                            Students
                          </th>
                          <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" }}>
                            Mode
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {corrections.map((correction, idx) => {
                          const date = new Date(correction.created_at);
                          const dateStr = date.toLocaleDateString() + " " + date.toLocaleTimeString();
                          const isEditing = editingCorrectionId === correction.id;
                          return (
                            <tr key={correction.id} style={{
                              borderBottom: idx < corrections.length - 1 ? "1px solid var(--color-border)" : "none",
                            }}>
                              <td style={{ padding: "10px 12px", fontSize: "0.85rem" }}>
                                {isEditing ? (
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <input
                                      type="text"
                                      value={editingName}
                                      onChange={(e) => setEditingName(e.target.value)}
                                      style={{
                                        flex: 1,
                                        padding: "4px 8px",
                                        fontSize: "0.85rem",
                                        border: "1px solid var(--color-border-focus)",
                                        borderRadius: "2px",
                                      }}
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleRenameCorrection(correction.id, editingName)}
                                      style={{ padding: "4px 10px", fontSize: "0.75rem", background: "var(--color-primary)", color: "white", border: "none", borderRadius: "2px", cursor: "pointer" }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingCorrectionId(null)}
                                      style={{ padding: "4px 10px", fontSize: "0.75rem", background: "transparent", color: "var(--color-text-muted)", border: "1px solid var(--color-border)", borderRadius: "2px", cursor: "pointer" }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <span
                                    onClick={() => {
                                      setEditingCorrectionId(correction.id);
                                      setEditingName(correction.name || "");
                                    }}
                                    style={{ cursor: "pointer", textDecoration: "underline", color: "var(--color-primary)" }}
                                  >
                                    {correction.name || "<unnamed>"}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: "10px 12px", fontSize: "0.85rem" }}>{dateStr}</td>
                              <td style={{ padding: "10px 12px", fontSize: "0.85rem" }}>{correction.results.length}</td>
                              <td style={{ padding: "10px 12px", fontSize: "0.85rem" }}>{correction.correction_mode}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
