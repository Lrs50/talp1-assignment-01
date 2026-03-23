import { useEffect, useState } from "react";
import { type Exam, fetchExams, createExam, updateExam, deleteExam, type AnswerMode } from "../api/exams";
import { type Question, fetchQuestions } from "../api/questions";
import { getCorrectionsByExamId } from "../api/correction";
import { ExamList } from "../components/exams/ExamList";
import { ExamForm } from "../components/exams/ExamForm";
import { ExamGenerateDialog } from "../components/exams/ExamGenerateDialog";
import { ExamPreviewModal } from "../components/exams/ExamPreviewModal";

export function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [previewingExam, setPreviewingExam] = useState<Exam | null>(null);
  const [generatingExam, setGeneratingExam] = useState<Exam | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [correctionCounts, setCorrectionCounts] = useState(new Map<number, number>());

  async function loadData() {
    try {
      console.log("[loadData] Starting data load");
      setLoading(true);
      const [examData, questionData] = await Promise.all([fetchExams(), fetchQuestions()]);
      console.log("[loadData] Fetched exams and questions", { examCount: examData.length, questionCount: questionData.length });
      setExams(examData);
      setQuestions(questionData);
      
      // Load correction counts for each exam (with per-exam error handling)
      const counts = new Map<number, number>();
      for (const exam of examData) {
        try {
          const corrections = await getCorrectionsByExamId(exam.id);
          counts.set(exam.id, corrections.length);
          console.log(`[loadData] Exam ${exam.id} (${exam.title}): ${corrections.length} corrections`);
        } catch (err: unknown) {
          // Log but don't fail entire load
          console.error(`[loadData] Failed to load corrections for exam ${exam.id}:`, err);
          counts.set(exam.id, 0);
        }
      }
      console.log("[loadData] Setting correction counts", counts);
      setCorrectionCounts(counts);
      setError("");
      console.log("[loadData] Data load completed successfully");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load data";
      console.error("[loadData] Fatal error:", errorMsg, err);
      setError(errorMsg);
    } finally {
      setLoading(false);
      console.log("[loadData] Loading state set to false");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(title: string, answerMode: AnswerMode, questionIds: number[]) {
    try {
      console.log("[handleCreate] Starting exam creation", { title, answerMode, questionCount: questionIds.length });
      setSubmitting(true);
      setError("");
      const createdExam = await createExam(title, answerMode, questionIds);
      console.log("[handleCreate] Exam created successfully", createdExam);
      setCreatingNew(false);
      console.log("[handleCreate] Form closed, calling loadData");
      await loadData();
      console.log("[handleCreate] Data reloaded after exam creation");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create exam";
      console.error("[handleCreate] Error during creation:", errorMsg, err);
      setError(errorMsg);
      setCreatingNew(false);
    } finally {
      setSubmitting(false);
      console.log("[handleCreate] Submitting state set to false");
    }
  }

  async function handleUpdate(title: string, answerMode: AnswerMode, questionIds: number[]) {
    if (!editingExam) return;
    try {
      setSubmitting(true);
      setError("");
      await updateExam(editingExam.id, title, answerMode, questionIds);
      setEditingExam(null);
      await loadData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update exam";
      console.error("Update exam error:", errorMsg);
      setError(errorMsg);
      setEditingExam(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      setSubmitting(true);
      setError("");
      await deleteExam(id);
      await loadData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete exam";
      console.error("Delete exam error:", errorMsg);
      setError(errorMsg);
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
            onClick={() => { 
              console.log("[handleNavClick] Opening create form");
              setCreatingNew(true); 
              setError(""); 
            }}
            disabled={loading}
          >
            + New Exam
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && !editingExam && !creatingNew && !previewingExam && !generatingExam && (
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

      {!loading && !creatingNew && !editingExam && !previewingExam && !generatingExam && (
        exams.length > 0 ? (
          <ExamList
            exams={exams}
            correctionCounts={correctionCounts}
            onEdit={setEditingExam}
            onDelete={handleDelete}
            onGenerate={setPreviewingExam}
          />
        ) : (
          <div className="empty-state">
            <p>No exams yet.</p>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-subtle)" }}>
              Click "New Exam" to create your first exam.
            </p>
          </div>
        )
      )}

      {previewingExam && (
        <ExamPreviewModal
          exam={previewingExam}
          questions={questions}
          onGenerate={() => {
            setPreviewingExam(null);
            setGeneratingExam(previewingExam);
          }}
          onCancel={() => setPreviewingExam(null)}
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
