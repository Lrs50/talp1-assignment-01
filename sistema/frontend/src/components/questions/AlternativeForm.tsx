import { useState } from "react";
import { type Alternative } from "../../api/questions";

interface Props {
  alternative?: Alternative;
  onSave: (description: string, isCorrect: boolean) => void;
  onCancel: () => void;
}

export function AlternativeForm({ alternative, onSave, onCancel }: Props) {
  const [description, setDescription] = useState(alternative?.description ?? "");
  const [isCorrect, setIsCorrect] = useState(alternative?.isCorrect ?? false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    onSave(description.trim(), isCorrect);
  }

  return (
    <form onSubmit={handleSubmit} style={{
      display: "flex",
      gap: 8,
      alignItems: "center",
      flexWrap: "wrap",
      background: "var(--color-bg)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-sm)",
      padding: "10px 12px",
    }}>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Alternative text…"
        style={{ flex: 1, minWidth: 200 }}
        autoFocus
        required
      />
      <label style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: "0.85rem",
        fontWeight: 500,
        color: isCorrect ? "var(--color-accent)" : "var(--color-text-muted)",
        textTransform: "none",
        letterSpacing: 0,
        cursor: "pointer",
        userSelect: "none",
      }}>
        <input
          type="checkbox"
          checked={isCorrect}
          onChange={(e) => setIsCorrect(e.target.checked)}
          style={{ width: "auto", padding: 0 }}
        />
        Correct answer
      </label>
      <button type="submit" className="btn-primary">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}
