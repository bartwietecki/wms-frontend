import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { getAllWorkEntries, approveWorkEntry, rejectWorkEntry } from "../api/adminApi";
import type { WorkEntry } from "../api/types";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";

export default function AdminReviewPage() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<number | null>(null);

  async function loadEntries() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllWorkEntries();
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load work entries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEntries(); }, []);

  async function handleApprove(id: number) {
    try {
      setActioningId(id);
      setError(null);
      await approveWorkEntry(id);
      await loadEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve entry");
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(id: number) {
    try {
      setActioningId(id);
      setError(null);
      await rejectWorkEntry(id);
      await loadEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject entry");
    } finally {
      setActioningId(null);
    }
  }

  const pending = entries.filter((e) => e.status === "PENDING");
  const reviewed = entries.filter((e) => e.status !== "PENDING");

  return (
    <div>
      <PageHeader
        area="admin"
        title="Work Entry Review"
        subtitle="Approve or reject employee work log submissions."
        action={
          <button className="btn-secondary-admin" onClick={loadEntries} disabled={loading}>
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
        }
      />

      {error && <div style={errorBannerStyle}>{error}</div>}

      {/* Pending — visually prominent */}
      <div style={pendingCardStyle}>
        <div style={pendingCardHeaderStyle}>
          <div style={pendingTitleRowStyle}>
            <span style={pendingDotStyle} />
            <h2 style={pendingTitleStyle}>Awaiting Review</h2>
            {pending.length > 0 && (
              <span style={countBadgeStyle}>{pending.length}</span>
            )}
          </div>
          <p style={pendingSubtitleStyle}>
            {pending.length === 0
              ? "All submissions have been reviewed."
              : `${pending.length} submission${pending.length > 1 ? "s" : ""} need your attention.`}
          </p>
        </div>

        {loading && <p style={mutedTextStyle}>Loading entries…</p>}

        {!loading && pending.length === 0 && (
          <EmptyState message="No entries pending review. You're all caught up." />
        )}

        {!loading && pending.length > 0 && (
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
                {pending.map((entry) => (
                  <PendingRow
                    key={entry.id}
                    entry={entry}
                    actioning={actioningId === entry.id}
                    onApprove={() => handleApprove(entry.id)}
                    onReject={() => handleReject(entry.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reviewed entries */}
      {reviewed.length > 0 && (
        <Card>
          <h2 style={cardTitleStyle}>Reviewed Entries</h2>
          <p style={cardSubtitleStyle}>Previously approved or rejected submissions.</p>
          <div style={{ ...tableWrapStyle, marginTop: "var(--space-4)" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadRowStyle}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Duration</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {reviewed.map((entry) => (
                  <ReviewedRow key={entry.id} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// Row components

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

interface PendingRowProps {
  entry: WorkEntry;
  actioning: boolean;
  onApprove: () => void;
  onReject: () => void;
}

function PendingRow({ entry, actioning, onApprove, onReject }: PendingRowProps) {
  return (
    <tr className="table-row-hover">
      <td style={tdStyle}>{entry.workDate}</td>
      <td style={tdStyle}>
        <span style={durationStyle}>{entry.minutes} min</span>
        <span style={durationHintStyle}>{formatHours(entry.minutes)}</span>
      </td>
      <td style={{ ...tdStyle, color: "var(--color-text-muted)", maxWidth: 300 }}>
        {entry.description?.trim() || <span style={{ color: "var(--color-text-subtle)" }}>—</span>}
      </td>
      <td style={tdStyle}>
        <StatusBadge status={entry.status} />
      </td>
      <td style={{ ...tdStyle, textAlign: "right" }}>
        <div style={actionRowStyle}>
          <button className="btn-approve" onClick={onApprove} disabled={actioning}>
            {actioning ? "…" : "✓ Approve"}
          </button>
          <button className="btn-reject" onClick={onReject} disabled={actioning}>
            {actioning ? "…" : "✕ Reject"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function ReviewedRow({ entry }: { entry: WorkEntry }) {
  return (
    <tr className="table-row-hover">
      <td style={tdStyle}>{entry.workDate}</td>
      <td style={tdStyle}>
        <span style={durationStyle}>{entry.minutes} min</span>
        <span style={durationHintStyle}>{formatHours(entry.minutes)}</span>
      </td>
      <td style={{ ...tdStyle, color: "var(--color-text-muted)", maxWidth: 300 }}>
        {entry.description?.trim() || <span style={{ color: "var(--color-text-subtle)" }}>—</span>}
      </td>
      <td style={tdStyle}>
        <StatusBadge status={entry.status} />
      </td>
    </tr>
  );
}

// Styles

const errorBannerStyle: CSSProperties = {
  background: "var(--color-danger-bg)",
  color: "var(--color-danger-text)",
  border: "1px solid var(--color-danger-border)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-3) var(--space-4)",
  marginBottom: "var(--space-6)",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
};

// Pending card — distinct from regular Card, uses warning tint
const pendingCardStyle: CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-warning-border)",
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-sm)",
  marginBottom: "var(--space-8)",
  overflow: "hidden",
};

const pendingCardHeaderStyle: CSSProperties = {
  padding: "var(--space-5) var(--space-6)",
  borderBottom: "1px solid var(--color-warning-border)",
  background: "var(--color-warning-bg)",
};

const pendingTitleRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
  marginBottom: "var(--space-1)",
};

const pendingDotStyle: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "var(--color-warning-text)",
  flexShrink: 0,
};

const pendingTitleStyle: CSSProperties = {
  fontSize: "var(--font-size-md)",
  fontWeight: 600,
  color: "var(--color-warning-text)",
};

const pendingSubtitleStyle: CSSProperties = {
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

const refreshBtnStyle_unused = {}; // replaced by .btn-secondary-admin CSS class

const mutedTextStyle: CSSProperties = {
  color: "var(--color-text-muted)",
  fontSize: "var(--font-size-sm)",
  padding: "var(--space-5) var(--space-6)",
};

const tableWrapStyle: CSSProperties = {
  overflowX: "auto",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const theadRowStyle: CSSProperties = {
  background: "var(--color-bg)",
};

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

const pendingTbodyRowStyle_unused = {}; // replaced by .table-row-hover CSS class

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

const approveBtnStyle: CSSProperties = {
  padding: "6px 14px",
  background: "var(--color-success-bg)",
  color: "var(--color-success-text)",
  border: "1px solid var(--color-success-border)",
  borderRadius: "var(--radius-sm)",
  fontWeight: 600,
  fontSize: "var(--font-size-sm)",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const rejectBtnStyle: CSSProperties = {
  padding: "6px 14px",
  background: "var(--color-danger-bg)",
  color: "var(--color-danger-text)",
  border: "1px solid var(--color-danger-border)",
  borderRadius: "var(--radius-sm)",
  fontWeight: 600,
  fontSize: "var(--font-size-sm)",
  cursor: "pointer",
  whiteSpace: "nowrap",
};
