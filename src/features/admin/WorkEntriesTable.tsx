import type { CSSProperties } from "react";
import type { WorkEntry } from "../../api/admin/types";
import { formatHours, formatDate } from "../../utils/time";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";

interface WorkEntriesTableProps {
  entries: WorkEntry[];
  loading: boolean;
  hasError?: boolean;
  totalElements: number;
  page: number;
  totalPages: number;
  actioningId: number | null;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onEdit: (entry: WorkEntry) => void;
  onDelete: (entry: WorkEntry) => void;
  onPageChange: (page: number) => void;
}

export default function WorkEntriesTable({
  entries,
  loading,
  hasError = false,
  totalElements,
  page,
  totalPages,
  actioningId,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onPageChange,
}: WorkEntriesTableProps) {
  return (
    <Card>
      <div style={cardHeaderStyle}>
        <div>
          <h2 style={cardTitleStyle}>Work Entries</h2>
          <p style={cardSubtitleStyle}>
            {loading ? "Loading…" : `${totalElements} entr${totalElements !== 1 ? "ies" : "y"} total`}
          </p>
        </div>
      </div>

      {loading && <p style={mutedTextStyle}>Loading work entries…</p>}

      {!loading && !hasError && entries.length === 0 && (
        <EmptyState message="No work entries match the current filters." />
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
                  <td style={{ ...tdStyle, color: "var(--color-text-muted)", maxWidth: 280 }}>
                    {entry.description?.trim() || (
                      <span style={{ color: "var(--color-text-subtle)" }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge status={entry.status} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <div style={actionRowStyle}>
                      {entry.status === "PENDING" && (
                        <>
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
                        </>
                      )}
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

      {!loading && totalPages > 1 && (
        <div style={paginationStyle}>
          <span style={pageInfoStyle}>
            {totalElements} total · Page {page + 1} of {totalPages}
          </span>
          <div style={pageButtonsStyle}>
            <button
              className="btn-secondary"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
            >
              ← Previous
            </button>
            <button
              className="btn-secondary"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

const cardHeaderStyle: CSSProperties = { marginBottom: "var(--space-5)" };

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

const paginationStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: "var(--space-5)",
  paddingTop: "var(--space-4)",
  borderTop: "1px solid var(--color-border)",
};

const pageInfoStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-muted)",
};

const pageButtonsStyle: CSSProperties = {
  display: "flex",
  gap: "var(--space-2)",
};
