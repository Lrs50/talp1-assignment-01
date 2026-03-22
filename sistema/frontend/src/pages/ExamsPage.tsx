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
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update exam");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteExam(id);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete exam");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Exams</h2>
        {!creatingNew && !editingExam && (
          <button onClick={() => setCreatingNew(true)}>+ New Exam</button>
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

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
