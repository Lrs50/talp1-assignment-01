import { type Exam, getPdfPreviewUrl } from "../../api/exams";
import { PdfPreviewViewer } from "./PdfPreviewViewer";

interface Props {
  exam: Exam;
  onGenerate: () => void;
  onCancel: () => void;
}

export function ExamPreviewModal({ exam, onGenerate, onCancel }: Props) {
  try {
    console.log("[ExamPreviewModal] Rendering PDF preview for exam:", exam.id);
    if (!exam) {
      console.error("[ExamPreviewModal] Missing exam");
      return null;
    }

    const pdfUrl = getPdfPreviewUrl(exam.id);

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(17, 17, 16, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          padding: 24,
        }}
      >
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: 28,
            width: "100%",
            maxWidth: 800,
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <h3
              style={{
                margin: 0,
                fontSize: "1rem",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              PDF Preview
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
              }}
            >
              {exam.title}
            </p>
          </div>

          <PdfPreviewViewer pdfUrl={pdfUrl} title={exam.title} />

          <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
            <button
              onClick={onGenerate}
              className="btn-primary"
              style={{ flex: 1 }}
            >
              Confirm & Generate
            </button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  } catch (err) {
    console.error("[ExamPreviewModal] Error rendering:", err);
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(17, 17, 16, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          padding: 24,
        }}
      >
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: 28,
            maxWidth: 420,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
            Error
          </h3>
          <p style={{ margin: "8px 0 16px", fontSize: "0.9rem" }}>
            Failed to generate PDF preview
          </p>
          <button onClick={onCancel} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    );
  }
}
