import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Set up the PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Props {
  pdfUrl: string;
  title: string;
}

export function PdfPreviewViewer({ pdfUrl, title }: Props) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<any>(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError("");
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error("[PdfPreviewViewer] Error loading PDF:", err);
        setError("Failed to load PDF preview");
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [pdfUrl]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfRef.current || !canvasRef.current) return;

      try {
        const page = await pdfRef.current.getPage(currentPage);
        const baseScale = 1.5;
        const finalScale = baseScale * scale;
        const viewport = page.getViewport({ scale: finalScale });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderTask = page.render({
          canvasContext: context,
          viewport: viewport,
        });

        await renderTask.promise;
      } catch (err) {
        console.error("[PdfPreviewViewer] Error rendering page:", err);
      }
    };

    renderPage();
  }, [currentPage, scale]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 400,
          color: "var(--color-text-muted)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              border: "2px solid var(--color-border)",
              borderTopColor: "var(--color-primary)",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
          <p style={{ margin: 0 }}>Loading PDF preview…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 20,
          background: "var(--color-error-bg)",
          border: "1px solid var(--color-error-border)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-error-text)",
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>Error Loading PDF</p>
        <p style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            style={{ padding: "6px 12px", fontSize: "0.85rem" }}
          >
            ← Previous
          </button>
          <span
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-muted)",
              minWidth: 80,
              textAlign: "center",
            }}
          >
            Page {currentPage} of {numPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
            style={{ padding: "6px 12px", fontSize: "0.85rem" }}
          >
            Next →
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.2))}
            disabled={scale <= 0.5}
            style={{ padding: "6px 10px", fontSize: "0.85rem" }}
          >
            −
          </button>
          <span
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-muted)",
              minWidth: 50,
              textAlign: "center",
            }}
          >
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(Math.min(2, scale + 0.2))}
            disabled={scale >= 2}
            style={{ padding: "6px 10px", fontSize: "0.85rem" }}
          >
            +
          </button>
        </div>

        <span
          style={{
            marginLeft: "auto",
            fontSize: "0.8rem",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: 12,
          background: "#fafaf8",
          display: "flex",
          justifyContent: "center",
          overflow: "auto",
          maxHeight: 600,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            maxWidth: "100%",
            height: "auto",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        />
      </div>
    </div>
  );
}
