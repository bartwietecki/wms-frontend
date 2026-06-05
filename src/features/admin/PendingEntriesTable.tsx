import type { CSSProperties } from "react";
import type { WorkEntry } from "../../api/admin/types";
import { formatHours, formatDate } from "../../utils/time";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";

interface PendingEntriesTableProps {
  entries: WorkEntry[];
  loading: boolean;
  actioningId: number | null;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onEdit: (entry: WorkEntry) => void;
  onDelete: (entry: WorkEntry) => void;
}

export default function PendingEntriesTable({
  entries,
  loading,
  actioningId,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}: PendingEntriesTableProps) {
  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <div style={titleRowStyle}>
          <span style={dotStyle} />
          <h2 style={titleStyle}>Awaiting Review</h2>
          {entries.length > 0 && (
            <span style={countBadgeStyle}>{entries.length}</span>
          )}
        </div>
        <p style={subtitleStyle}>
          {entries.length === 0
            ? "All submissions have been reviewed."
            : `${entries.length} submission${entries.length > 1 ? "s" : ""} need your attention.`}
        </p>
      </div>

      {loading && <p style={mutedTextStyle}>Loading entries…</p>}

      {!loading && entries.length === 0 && (
        <EmptyState message="No entries pending review. You're all caught up." />
      )}

      {!loading && entries.length > 0 && (
        <div style={tableWrapStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRowStyle}>
                <th style={thStyle}>Employee</th>
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
                  <td style={tdStyle}>{entry.employeeName}</td>
                  <td style={tdStyle}>{formatDate(entry.workDate)}</td>
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
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <div style={actionRowStyle}>
                      <button
                        className="btn-approve"
                        onClick={() => onApprove(entry.id)}
                        disabled={actioningId === entry.id}
                      >
                        {actioningId === entry.id ? "…" : "✓ Approve"}
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => onReject(entry.id)}
                        disabled={actioningId === entry.id}
                      >
                        {actioningId === entry.id ? "…" : "✕ Reject"}
                      </button>
                      <div style={stackedActionsStyle}>
                        <button
                          className="btn-edit"
                          onClick={() => onEdit(entry)}
                          disabled={actioningId === entry.id}
                        >
                          ✎ Edit
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => onDelete(entry)}
                          disabled={actioningId === entry.id}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-warning-border)",
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-sm)",
  marginBottom: "var(--space-8)",
  overflow: "hidden",
};

const cardHeaderStyle: CSSProperties = {
  padding: "var(--space-5) var(--space-6)",
  borderBottom: "1px solid var(--color-warning-border)",
  background: "var(--color-warning-bg)",
};

const titleRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
  marginBottom: "var(--space-1)",
};

const dotStyle: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "var(--color-warning-text)",
  flexShrink: 0,
};

const titleStyle: CSSProperties = {
  fontSize: "var(--font-size-md)",
  fontWeight: 600,
  color: "var(--color-warning-text)",
};

const subtitleStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-warning-text)",
  opacity: 0.8,
};

const countBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 22,
  height: 22,
  padding: "0 7px",
  background: "var(--color-warning-text)",
  color: "#fff",
  borderRadius: 999,
  fontSize: "var(--font-size-xs)",
  fontWeight: 700,
};

const mutedTextStyle: CSSProperties = {
  color: "var(--color-text-muted)",
  fontSize: "var(--font-size-sm)",
  padding: "var(--space-5) var(--space-6)",
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
  alignItems: "center",
};

const stackedActionsStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-1)",
  marginLeft: "var(--space-1)",
  borderLeft: "1px solid var(--color-border)",
  paddingLeft: "var(--space-3)",
};
