import { type StudentGrade } from "../../api/correction";

interface Props {
  grades: StudentGrade[];
}

export function GradeTable({ grades }: Props) {
  if (grades.length === 0) return null;

  const questionCount = grades[0].questionGrades.length;
  const totalPossible = grades[0].maxScore;
  const avg = grades.reduce((sum, g) => sum + g.totalScore, 0) / grades.length;

  function exportCsv() {
    const questionHeaders = Array.from({ length: questionCount }, (_, i) => `q${i + 1}`);
    const headers = ["studentName", "studentCpf", ...questionHeaders, "totalScore", "maxScore"];
    const rows = grades.map((g) => [
      g.studentName,
      g.studentCpf,
      ...g.questionGrades.map((qg) => qg.score.toFixed(2)),
      g.totalScore.toFixed(2),
      g.maxScore,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "grade_report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
        marginBottom: 20,
      }}>
        {[
          { label: "Students", value: grades.length },
          { label: "Questions", value: questionCount },
          { label: "Class average", value: `${avg.toFixed(2)} / ${totalPossible}` },
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "var(--color-primary)" }}>
              {value}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Grade Report
          </span>
          <button onClick={exportCsv} style={{ fontSize: "0.8rem" }}>Download CSV</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{
            borderCollapse: "collapse",
            width: "100%",
            fontSize: "0.875rem",
          }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={th}>Student</th>
                <th style={th}>CPF</th>
                {Array.from({ length: questionCount }, (_, i) => (
                  <th key={i} style={{ ...th, textAlign: "center" }}>Q{i + 1}</th>
                ))}
                <th style={{ ...th, textAlign: "center", background: "#f1f5fe" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, idx) => {
                const pct = g.totalScore / g.maxScore;
                const rowBg = idx % 2 === 0 ? "#ffffff" : "#fafafa";
                return (
                  <tr key={idx} style={{ background: rowBg }}>
                    <td style={td}>{g.studentName}</td>
                    <td style={{ ...td, color: "var(--color-text-muted)", fontSize: "0.8rem" }}>{g.studentCpf}</td>
                    {g.questionGrades.map((qg, qi) => (
                      <td key={qi} style={{ ...td, textAlign: "center", color: qg.score >= 1 ? "var(--color-success)" : qg.score > 0 ? "#d97706" : "var(--color-danger)" }}>
                        {qg.score % 1 === 0 ? qg.score : qg.score.toFixed(2)}
                      </td>
                    ))}
                    <td style={{
                      ...td,
                      textAlign: "center",
                      fontWeight: 700,
                      background: pct >= 0.5 ? "var(--color-success-bg)" : "var(--color-error-bg)",
                      color: pct >= 0.5 ? "var(--color-success)" : "var(--color-danger)",
                    }}>
                      {g.totalScore % 1 === 0 ? g.totalScore : g.totalScore.toFixed(2)}/{g.maxScore}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "10px 14px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: "0.8rem",
  color: "var(--color-text-muted)",
  borderBottom: "1px solid var(--color-border)",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "10px 14px",
  borderBottom: "1px solid var(--color-border)",
};
