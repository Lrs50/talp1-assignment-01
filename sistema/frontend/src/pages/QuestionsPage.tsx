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
      const created = await createQuestion(newStatement.trim());
      setNewStatement("");
      setCreatingNew(false);
      setError("");
      await loadQuestions();
      // Immediately open the edit/alternatives view for the new question
      setEditingQuestion(created);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create question");
    }
  }

  async function handleUpdate(question: Question, statement: string) {
    try {
      await updateQuestion(question.id, statement);
      setEditingQuestion(null);
      setError("");
      await loadQuestions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update question");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteQuestion(id);
      setError("");
      await loadQuestions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete question");
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Questions</h2>
          <p style={{ margin: "2px 0 0", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Build your question bank — each question needs alternatives before it can be added to an exam.
          </p>
        </div>
        {!creatingNew && !editingQuestion && (
          <button className="btn-primary" onClick={() => { setCreatingNew(true); setError(""); }}>
            + New Question
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {creatingNew && (
        <div className="card" style={{ marginBottom: 16 }}>
          <p style={{ margin: "0 0 10px", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
            NEW QUESTION
          </p>
          <form onSubmit={handleCreate} style={{ display: "flex", gap: 8 }}>
            <input
              value={newStatement}
              onChange={(e) => setNewStatement(e.target.value)}
              placeholder="Enter the question statement…"
              style={{ flex: 1 }}
              autoFocus
              required
            />
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" onClick={() => { setCreatingNew(false); setNewStatement(""); }}>
              Cancel
            </button>
          </form>
          <p className="helper-text">After creating, you can add alternatives immediately.</p>
        </div>
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
          onEdit={(q) => { setEditingQuestion(q); setCreatingNew(false); }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
