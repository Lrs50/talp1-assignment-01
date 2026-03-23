import { useState, useEffect } from "react";
import { HomePage } from "./pages/HomePage";
import { QuestionsPage } from "./pages/QuestionsPage";
import { ExamsPage } from "./pages/ExamsPage";
import { CorrectPage } from "./pages/CorrectPage";
import { ErrorBoundary } from "./components/ErrorBoundary";

type Page = "home" | "questions" | "exams" | "correct";

const NAV_ITEMS: { id: Page; label: string }[] = [
  { id: "questions", label: "Questions" },
  { id: "exams", label: "Exams" },
  { id: "correct", label: "Correction" },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || "home";
      if (["home", "questions", "exams", "correct"].includes(hash)) {
        setCurrentPage(hash as Page);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Handle initial page load
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    window.location.hash = page === "home" ? "" : page;
  };

  return (
    <ErrorBoundary>
      <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
        <header style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}>
          <div style={{ maxWidth: 1024, margin: "0 auto", padding: "0 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 40, height: 54 }}>
              <button
                onClick={() => handleNavClick("home")}
                style={{
                  fontWeight: 300,
                  fontSize: "1.05rem",
                  color: "var(--color-text)",
                  letterSpacing: "0.08em",
                  fontFamily: "var(--font-sans)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ExamSystem
              </button>
              {currentPage !== "home" && (
                <nav style={{ display: "flex", gap: 24 }}>
                  {NAV_ITEMS.map(({ id, label }) => {
                    const active = currentPage === id;
                    return (
                      <button
                        key={id}
                        onClick={() => handleNavClick(id)}
                        style={{
                          padding: "0",
                          paddingBottom: "2px",
                          fontWeight: active ? 600 : 400,
                          background: "transparent",
                          color: active ? "var(--color-text)" : "var(--color-text-muted)",
                          border: "none",
                          borderBottom: active ? "2px solid var(--color-text)" : "2px solid transparent",
                          borderRadius: 0,
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          transition: "color 0.12s, border-color 0.12s",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1024, margin: "0 auto", padding: "36px 28px" }}>
          {currentPage === "home" && <HomePage />}
          {currentPage === "questions" && <QuestionsPage />}
          {currentPage === "exams" && <ExamsPage />}
          {currentPage === "correct" && <CorrectPage />}
        </main>
      </div>
    </ErrorBoundary>
  );
}
