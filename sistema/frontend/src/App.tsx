import { useState } from "react";
import { QuestionsPage } from "./pages/QuestionsPage";
import { ExamsPage } from "./pages/ExamsPage";
import { CorrectPage } from "./pages/CorrectPage";

type Page = "questions" | "exams" | "correct";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("questions");

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, marginBottom: 16 }}>Exam System</h1>
        <nav style={{ display: "flex", gap: 8 }}>
          {(["questions", "exams", "correct"] as Page[]).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                padding: "6px 16px",
                fontWeight: currentPage === page ? "bold" : "normal",
                background: currentPage === page ? "#333" : "#eee",
                color: currentPage === page ? "white" : "#333",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {currentPage === "questions" && <QuestionsPage />}
        {currentPage === "exams" && <ExamsPage />}
        {currentPage === "correct" && <CorrectPage />}
      </main>
    </div>
  );
}
