import { useState } from "react";
import { Question, Alternative, addAlternative, updateAlternative, deleteAlternative } from "../../api/questions";
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
    <div style={{ border: "1px solid #ccc", borderRadius: 6, padding: 16, marginBottom: 12 }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="Question statement"
          style={{ flex: 1, padding: "4px 8px" }}
          required
        />
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ paddingLeft: 8 }}>
        <strong>Alternatives:</strong>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {question.alternatives.map((alt) => (
            <li key={alt.id} style={{ marginBottom: 6 }}>
              {editingAlt?.id === alt.id ? (
                <AlternativeForm
                  alternative={alt}
                  onSave={(desc, correct) => handleUpdateAlternative(alt, desc, correct)}
                  onCancel={() => setEditingAlt(null)}
                />
              ) : (
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span>{alt.isCorrect ? "✓" : "○"} {alt.description}</span>
                  <button onClick={() => setEditingAlt(alt)}>Edit</button>
                  <button onClick={() => handleDeleteAlternative(alt.id)}>Delete</button>
                </span>
              )}
            </li>
          ))}
        </ul>
        {addingAlternative ? (
          <AlternativeForm
            onSave={handleAddAlternative}
            onCancel={() => setAddingAlternative(false)}
          />
        ) : (
          <button onClick={() => setAddingAlternative(true)}>+ Add Alternative</button>
        )}
      </div>
    </div>
  );
}
