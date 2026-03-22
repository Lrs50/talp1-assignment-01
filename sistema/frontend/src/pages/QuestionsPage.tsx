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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadQuestions() {
    try {
      setLoading(true);
      const data = await fetchQuestions();
      setQuestions(data);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newStatement.trim()) return;
    try {
      setSubmitting(true);
      const created = await createQuestion(newStatement.trim());
      setNewStatement("");
      setCreatingNew(false);
      setError("");
      await loadQuestions();
      // Immediately open the edit/alternatives view for the new question
      setEditingQuestion(created);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create question");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(question: Question, statement: string) {
    try {
      setSubmitting(true);
      await updateQuestion(question.id, statement);
      setEditingQuestion(null);
      setError("");
      await loadQuestions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update question");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      setSubmitting(true);
      await deleteQuestion(id);
      setError("");
      await loadQuestions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete question");
    } finally {
      setSubmitting(false);
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
          <button 
            className="btn-primary" 
            onClick={() => { setCreatingNew(true); setError(""); }}
            disabled={loading}
          >
            + New Question
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && !editingQuestion && (
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
          Loading questions...
        </div>
      )}

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
              disabled={submitting}
            />
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Creating…" : "Create"}
            </button>
            <button 
              type="button" 
              onClick={() => { setCreatingNew(false); setNewStatement(""); }}
              disabled={submitting}
            >
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
        !loading && <QuestionList
          questions={questions}
          onEdit={(q) => { setEditingQuestion(q); setCreatingNew(false); }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
