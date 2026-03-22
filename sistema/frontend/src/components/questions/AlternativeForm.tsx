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
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Alternative description"
        style={{ flex: 1, minWidth: 200, padding: "4px 8px" }}
        required
      />
      <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <input
          type="checkbox"
          checked={isCorrect}
          onChange={(e) => setIsCorrect(e.target.checked)}
        />
        Correct
      </label>
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}
