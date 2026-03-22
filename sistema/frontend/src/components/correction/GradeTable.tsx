import { StudentGrade } from "../../api/correction";

interface Props {
  grades: StudentGrade[];
}

export function GradeTable({ grades }: Props) {
  if (grades.length === 0) return <p>No results yet.</p>;

  const questionCount = grades[0].questionGrades.length;

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
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button onClick={exportCsv}>Download CSV</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={cellStyle}>Name</th>
              <th style={cellStyle}>CPF</th>
              {Array.from({ length: questionCount }, (_, i) => (
                <th key={i} style={cellStyle}>Q{i + 1}</th>
              ))}
              <th style={cellStyle}>Total</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g, idx) => (
              <tr key={idx}>
                <td style={cellStyle}>{g.studentName}</td>
                <td style={cellStyle}>{g.studentCpf}</td>
                {g.questionGrades.map((qg, qi) => (
                  <td key={qi} style={cellStyle}>{qg.score.toFixed(2)}</td>
                ))}
                <td style={{ ...cellStyle, fontWeight: "bold" }}>
                  {g.totalScore.toFixed(2)}/{g.maxScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "6px 10px",
  textAlign: "left",
};
