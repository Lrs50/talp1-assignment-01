import { useEffect, useState } from "react";
import {
  type Question,
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../api/questions";
import { QuestionList } from "../components/questions/QuestionList";
import { QuestionForm } from "../components/questions/QuestionForm";

export function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newStatement, setNewStatement] = useState("");
  const [error, setError] = useState("");

  async function loadQuestions() {
    try {
      const data = await fetchQuestions();
      setQuestions(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load questions");
    }
  }

  useEffect(() => {
    loadQuestions();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newStatement.trim()) return;
    try {
      await createQuestion(newStatement.trim());
      setNewStatement("");
      setCreatingNew(false);
      await loadQuestions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create question");
    }
  }

  async function handleUpdate(question: Question, statement: string) {
    try {
      await updateQuestion(question.id, statement);
      setEditingQuestion(null);
      await loadQuestions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update question");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteQuestion(id);
      await loadQuestions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete question");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Questions</h2>
        {!creatingNew && !editingQuestion && (
          <button onClick={() => setCreatingNew(true)}>+ New Question</button>
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {creatingNew && (
        <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            value={newStatement}
            onChange={(e) => setNewStatement(e.target.value)}
            placeholder="Question statement"
            style={{ flex: 1, padding: "4px 8px" }}
            autoFocus
            required
          />
          <button type="submit">Create</button>
          <button type="button" onClick={() => setCreatingNew(false)}>Cancel</button>
        </form>
      )}

      {editingQuestion ? (
        <QuestionForm
          question={editingQuestion}
          onSave={(statement) => handleUpdate(editingQuestion, statement)}
          onCancel={() => setEditingQuestion(null)}
          onAlternativesChange={loadQuestions}
        />
      ) : (
        <QuestionList
          questions={questions}
          onEdit={(q) => setEditingQuestion(q)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
