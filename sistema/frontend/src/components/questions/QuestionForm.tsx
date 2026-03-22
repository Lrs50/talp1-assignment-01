import { useState } from "react";
import { type Question, type Alternative, addAlternative, updateAlternative, deleteAlternative } from "../../api/questions";
import { AlternativeForm } from "./AlternativeForm";

interface Props {
  question: Question;
  onSave: (statement: string) => void;
  onCancel: () => void;
  onAlternativesChange: () => void;
}

export function QuestionForm({ question, onSave, onCancel, onAlternativesChange }: Props) {
  const [statement, setStatement] = useState(question.statement);
  const [addingAlternative, setAddingAlternative] = useState(false);
  const [editingAlt, setEditingAlt] = useState<Alternative | null>(null);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!statement.trim()) return;
    onSave(statement.trim());
  }

  async function handleAddAlternative(description: string, isCorrect: boolean) {
    try {
      await addAlternative(question.id, description, isCorrect);
      setAddingAlternative(false);
      onAlternativesChange();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error adding alternative");
    }
  }

  async function handleUpdateAlternative(alt: Alternative, description: string, isCorrect: boolean) {
    try {
      await updateAlternative(question.id, alt.id, description, isCorrect);
      setEditingAlt(null);
      onAlternativesChange();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error updating alternative");
    }
  }

  async function handleDeleteAlternative(altId: number) {
    try {
      await deleteAlternative(question.id, altId);
      onAlternativesChange();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error deleting alternative");
    }
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="Question statement"
          style={{ flex: 1 }}
          required
        />
        <button type="submit" className="btn-primary">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
            ALTERNATIVES ({question.alternatives.length})
          </span>
          {!addingAlternative && (
            <button onClick={() => setAddingAlternative(true)} style={{ fontSize: "0.8rem" }}>
              + Add alternative
            </button>
          )}
        </div>

        {question.alternatives.length === 0 && !addingAlternative && (
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-subtle)", margin: "8px 0" }}>
            No alternatives yet. Add at least one to use this question in an exam.
          </p>
        )}

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {question.alternatives.map((alt) => (
            <li key={alt.id}>
              {editingAlt?.id === alt.id ? (
                <AlternativeForm
                  alternative={alt}
                  onSave={(desc, correct) => handleUpdateAlternative(alt, desc, correct)}
                  onCancel={() => setEditingAlt(null)}
                />
              ) : (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  background: alt.isCorrect ? "var(--color-correct-bg)" : "var(--color-bg)",
                  border: `1px solid ${alt.isCorrect ? "var(--color-success-border)" : "var(--color-border)"}`,
                  borderRadius: "var(--radius-sm)",
                }}>
                  <span className={`badge ${alt.isCorrect ? "badge-correct" : "badge-incorrect"}`}>
                    {alt.isCorrect ? "Correct" : "Wrong"}
                  </span>
                  <span style={{ flex: 1, fontSize: "0.9rem" }}>{alt.description}</span>
                  <button onClick={() => setEditingAlt(alt)} style={{ fontSize: "0.8rem" }}>Edit</button>
                  <button
                    onClick={() => handleDeleteAlternative(alt.id)}
                    className="btn-danger"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {addingAlternative && (
          <div style={{ marginTop: 8 }}>
            <AlternativeForm
              onSave={handleAddAlternative}
              onCancel={() => setAddingAlternative(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
