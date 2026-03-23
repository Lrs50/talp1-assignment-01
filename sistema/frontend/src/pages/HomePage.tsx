export function HomePage() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: 60 }}>
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: 300,
          marginBottom: 12,
          color: "var(--color-text)",
          letterSpacing: "-0.01em",
        }}>
          Kotae
        </h1>
        <p style={{
          fontSize: "1rem",
          color: "var(--color-text-muted)",
          lineHeight: 1.6,
          marginBottom: 0,
        }}>
          Create and manage questions, build exams, generate randomized versions, and grade student responses.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        <NavButton
          title="Create Question"
          description="Build a new question with alternatives"
          href="#questions"
        />
        <NavButton
          title="Create Exam"
          description="Assemble questions into exams and generate randomized versions"
          href="#exams"
        />
        <NavButton
          title="Grade Exam"
          description="Upload answer keys and student responses to generate grade reports"
          href="#correct"
        />
      </div>

      <div style={{
        marginTop: 60,
        padding: 24,
        background: "var(--color-surface)",
        borderLeft: "3px solid var(--color-primary)",
        borderRadius: 4,
      }}>
        <p style={{
          margin: 0,
          fontSize: "0.9rem",
          color: "var(--color-text-muted)",
          lineHeight: 1.6,
        }}>
          <strong>Getting started:</strong> Begin by creating questions with multiple alternative answers. Then group them into exams, generate randomized versions for distribution, and grade student responses using CSV files.
        </p>
      </div>
    </div>
  );
}

function NavButton({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <a
      href={href}
      style={{
        display: "block",
        padding: 20,
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 6,
        textDecoration: "none",
        transition: "all 0.12s ease",
        cursor: "pointer",
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        const target = e.currentTarget as HTMLElement;
        target.style.borderColor = "var(--color-primary)";
        target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.04)";
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLElement;
        target.style.borderColor = "var(--color-border)";
        target.style.boxShadow = "none";
      }}
    >
      <div style={{
        fontSize: "1.1rem",
        fontWeight: 600,
        color: "var(--color-text)",
        marginBottom: 6,
      }}>
        {title}
      </div>
      <div style={{
        fontSize: "0.9rem",
        color: "var(--color-text-muted)",
        lineHeight: 1.4,
      }}>
        {description}
      </div>
    </a>
  );
}
