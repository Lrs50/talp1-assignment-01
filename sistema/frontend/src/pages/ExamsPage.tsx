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

  async function loadData() {
    try {
      const [examData, questionData] = await Promise.all([fetchExams(), fetchQuestions()]);
      setExams(examData);
      setQuestions(questionData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(title: string, answerMode: AnswerMode, questionIds: number[]) {
    try {
      await createExam(title, answerMode, questionIds);
      setCreatingNew(false);
      setError("");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create exam");
    }
  }

  async function handleUpdate(title: string, answerMode: AnswerMode, questionIds: number[]) {
    if (!editingExam) return;
    try {
      await updateExam(editingExam.id, title, answerMode, questionIds);
      setEditingExam(null);
      setError("");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update exam");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteExam(id);
      setError("");
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete exam");
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
          <button className="btn-primary" onClick={() => { setCreatingNew(true); setError(""); }}>
            + New Exam
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

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

      {!creatingNew && !editingExam && (
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
