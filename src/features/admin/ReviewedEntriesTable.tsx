import type { CSSProperties } from "react";
import type { WorkEntry } from "../../api/admin/types";
import { formatHours } from "../../utils/time";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";

interface ReviewedEntriesTableProps {
  entries: WorkEntry[];
}

export default function ReviewedEntriesTable({ entries }: ReviewedEntriesTableProps) {
  if (entries.length === 0) return null;

  return (
    <Card>
      <h2 style={cardTitleStyle}>Reviewed Entries</h2>
      <p style={cardSubtitleStyle}>Previously approved or rejected submissions.</p>
      <div style={{ overflowX: "auto", marginTop: "var(--space-4)" }}>
        <table style={tableStyle}>
          <thead>
            <tr style={theadRowStyle}>
              <th style={thStyle}>Employee</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Duration</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="table-row-hover">
                <td style={tdStyle}>{entry.employeeName}</td>
                <td style={tdStyle}>{entry.workDate}</td>
                <td style={tdStyle}>
                  <span style={durationStyle}>{entry.minutes} min</span>
                  <span style={durationHintStyle}>{formatHours(entry.minutes)}</span>
                </td>
                <td style={{ ...tdStyle, color: "var(--color-text-muted)", maxWidth: 300 }}>
                  {entry.description?.trim() || (
                    <span style={{ color: "var(--color-text-subtle)" }}>—</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <StatusBadge status={entry.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const cardTitleStyle: CSSProperties = {
  fontSize: "var(--font-size-md)",
  fontWeight: 600,
  color: "var(--color-text)",
  marginBottom: 0,
};

const cardSubtitleStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-muted)",
  marginTop: "var(--space-1)",
};

const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse" };

const theadRowStyle: CSSProperties = { background: "var(--color-bg)" };

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "var(--space-3) var(--space-4)",
  fontSize: "var(--font-size-xs)",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--color-text-muted)",
  borderBottom: "1px solid var(--color-border)",
  whiteSpace: "nowrap",
};

const tdStyle: CSSProperties = {
  padding: "var(--space-3) var(--space-4)",
  fontSize: "var(--font-size-base)",
  borderBottom: "1px solid var(--color-border)",
  verticalAlign: "middle",
};

const durationStyle: CSSProperties = {
  display: "block",
  fontWeight: 500,
  color: "var(--color-text)",
};

const durationHintStyle: CSSProperties = {
  display: "block",
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-subtle)",
  marginTop: 1,
};
