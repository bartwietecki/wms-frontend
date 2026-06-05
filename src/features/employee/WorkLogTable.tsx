import type { CSSProperties } from "react";
import type { WorkEntry } from "../../api/employee/types";
import { formatHours, formatDate } from "../../utils/time";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";

interface WorkLogTableProps {
  entries: WorkEntry[];
  loading: boolean;
  hasError?: boolean;
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onFilterSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onEdit: (entry: WorkEntry) => void;
  onDelete: (entry: WorkEntry) => void;
}

export default function WorkLogTable({
  entries,
  loading,
  hasError = false,
  from,
  to,
  onFromChange,
  onToChange,
  onFilterSubmit,
  onEdit,
  onDelete,
}: WorkLogTableProps) {
  return (
    <Card>
      <div style={cardHeaderRowStyle}>
        <div>
          <h2 style={cardTitleStyle}>Submission History</h2>
          <p style={cardSubtitleStyle}>Your work logs for the selected period.</p>
        </div>
        <form onSubmit={onFilterSubmit} style={filterRowStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>From</label>
            <input
              className="form-input"
              type="date"
              value={from}
              onChange={(e) => onFromChange(e.target.value)}
              required
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>To</label>
            <input
              className="form-input"
              type="date"
              value={to}
              onChange={(e) => onToChange(e.target.value)}
              required
            />
          </div>
          <button className="btn-secondary" type="submit" disabled={loading}>
            {loading ? "Loading…" : "Apply"}
          </button>
        </form>
      </div>

      {loading && <p style={mutedTextStyle}>Loading your work logs…</p>}

      {!loading && !hasError && entries.length === 0 && (
        <EmptyState message="No work logs found for the selected period." />
      )}

      {!loading && entries.length > 0 && (
        <div style={tableWrapStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRowStyle}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Duration</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="table-row-hover">
                  <td style={tdStyle}>{formatDate(entry.workDate)}</td>
                  <td style={tdStyle}>
                    <span style={durationStyle}>{entry.minutes} min</span>
                    <span style={durationHintStyle}>{formatHours(entry.minutes)}</span>
                  </td>
                  <td style={{ ...tdStyle, color: "var(--color-text-muted)", maxWidth: 320 }}>
                    {entry.description?.trim() || (
                      <span style={{ color: "var(--color-text-subtle)" }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge status={entry.status} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    {entry.status === "PENDING" && (
                      <div style={actionRowStyle}>
                        <button className="btn-edit" onClick={() => onEdit(entry)}>
                          ✎ Edit
                        </button>
                        <button className="btn-danger" onClick={() => onDelete(entry)}>
                          🗑 Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

const cardHeaderRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "var(--space-4)",
  marginBottom: "var(--space-5)",
};

const filterRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  gap: "var(--space-3)",
  flexWrap: "wrap",
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-1)",
};

const labelStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  color: "var(--color-text-muted)",
};

const mutedTextStyle: CSSProperties = {
  color: "var(--color-text-muted)",
  fontSize: "var(--font-size-sm)",
  padding: "var(--space-4) 0",
};

const tableWrapStyle: CSSProperties = { overflowX: "auto" };

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

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: "var(--space-2)",
  justifyContent: "flex-end",
};
