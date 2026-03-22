import { useState } from "react";
import { QuestionsPage } from "./pages/QuestionsPage";
import { ExamsPage } from "./pages/ExamsPage";
import { CorrectPage } from "./pages/CorrectPage";

type Page = "questions" | "exams" | "correct";

const NAV_ITEMS: { id: Page; label: string; description: string }[] = [
  { id: "questions", label: "Questions", description: "Manage question bank" },
  { id: "exams", label: "Exams", description: "Create & generate exams" },
  { id: "correct", label: "Correction", description: "Grade student responses" },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("questions");

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <header style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32, height: 56 }}>
            <div>
              <span style={{
                fontWeight: 800,
                fontSize: "1.1rem",
                color: "var(--color-primary)",
                letterSpacing: "-0.02em",
              }}>
                ExamSystem
              </span>
            </div>
            <nav style={{ display: "flex", gap: 2, flex: 1 }}>
              {NAV_ITEMS.map(({ id, label }) => {
                const active = currentPage === id;
                return (
                  <button
                    key={id}
                    onClick={() => setCurrentPage(id)}
                    style={{
                      padding: "6px 16px",
                      fontWeight: active ? 600 : 400,
                      background: active ? "var(--color-primary)" : "transparent",
                      color: active ? "#fff" : "var(--color-text-muted)",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      transition: "background 0.15s, color 0.15s",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        {currentPage === "questions" && <QuestionsPage />}
        {currentPage === "exams" && <ExamsPage />}
        {currentPage === "correct" && <CorrectPage />}
      </main>
    </div>
  );
}
