import type { StudentGrade } from "../../api/correction";

interface Props {
  grades: StudentGrade[];
}

export function ScoreDistributionChart({ grades }: Props) {
  if (grades.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "var(--color-text-muted)" }}>
        No grades to display
      </div>
    );
  }

  // Calculate score distribution
  const percentages = grades.map((g) => (g.totalScore / g.maxScore) * 100);

  // Create 5 buckets: 0-20%, 20-40%, 40-60%, 60-80%, 80-100%
  const buckets = [0, 0, 0, 0, 0];
  percentages.forEach((pct) => {
    if (pct < 20) buckets[0]++;
    else if (pct < 40) buckets[1]++;
    else if (pct < 60) buckets[2]++;
    else if (pct < 80) buckets[3]++;
    else buckets[4]++;
  });

  const maxBucketCount = Math.max(...buckets, 1);
  const labels = ["0-20%", "20-40%", "40-60%", "60-80%", "80-100%"];

  return (
    <div
      style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: 16,
      }}
    >
      <p
        style={{
          margin: "0 0 16px",
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        Score Distribution
      </p>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
        {buckets.map((count, idx) => {
          const height = (count / maxBucketCount) * 100;
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: `${height}%`,
                  minHeight: height > 0 ? 4 : 0,
                  background: "var(--color-accent)",
                  borderRadius: "var(--radius-sm)",
                  transition: "background-color 0.2s",
                }}
                title={`${labels[idx]}: ${count} student${count !== 1 ? "s" : ""}`}
              />
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  textAlign: "center",
                }}
              >
                {labels[idx]}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "var(--color-text)",
                }}
              >
                {count}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
