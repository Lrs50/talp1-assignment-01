import { useEffect, useState } from "react";
import { type Exam, fetchExams, createExam, updateExam, deleteExam, type AnswerMode } from "../api/exams";
import { type Question, fetchQuestions } from "../api/questions";
import { ExamList } from "../components/exams/ExamList";
import { ExamForm } from "../components/exams/ExamForm";
import { ExamGenerateDialog } from "../components/exams/ExamGenerateDialog";

export function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [generatingExam, setGeneratingExam] = useState<Exam | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [examData, questionData] = await Promise.all([fetchExams(), fetchQuestions()]);
      setExams(examData);
      setQuestions(questionData);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(title: string, answerMode: AnswerMode, questionIds: number[]) {
    try {
      setSubmitting(true);
      await createExam(title, answerMode, questionIds);
      setCreatingNew(false);
      setError("");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create exam");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(title: string, answerMode: AnswerMode, questionIds: number[]) {
    if (!editingExam) return;
    try {
      setSubmitting(true);
      await updateExam(editingExam.id, title, answerMode, questionIds);
      setEditingExam(null);
      setError("");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update exam");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      setSubmitting(true);
      await deleteExam(id);
      setError("");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete exam");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Exams</h2>
          <p style={{ margin: "2px 0 0", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Compose exams from your question bank and generate randomized PDF versions.
          </p>
        </div>
        {!creatingNew && !editingExam && (
          <button 
            className="btn-primary" 
            onClick={() => { setCreatingNew(true); setError(""); }}
            disabled={loading}
          >
            + New Exam
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && !editingExam && !creatingNew && (
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
      )}

      {creatingNew && (
        <ExamForm
          availableQuestions={questions}
          onSave={handleCreate}
          onCancel={() => setCreatingNew(false)}
        />
      )}

      {editingExam && (
        <ExamForm
          exam={editingExam}
          availableQuestions={questions}
          onSave={handleUpdate}
          onCancel={() => setEditingExam(null)}
        />
      )}

      {!loading && !creatingNew && !editingExam && (
        <ExamList
          exams={exams}
          onEdit={setEditingExam}
          onDelete={handleDelete}
          onGenerate={setGeneratingExam}
        />
      )}

      {generatingExam && (
        <ExamGenerateDialog
          exam={generatingExam}
          onClose={() => setGeneratingExam(null)}
        />
      )}
    </div>
  );
}
