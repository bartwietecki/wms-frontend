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
        title="Admin Panel"
        subtitle="Review and approve employee work log submissions."
      />

      {error && <div style={errorBannerStyle}>{error}</div>}

      {/* Pending */}
      <Card style={{ marginBottom: "var(--space-8)" }}>
        <div style={cardHeaderRowStyle}>
          <h2 style={cardTitleStyle}>
            Pending Review
            {pending.length > 0 && (
              <span style={countBadgeStyle}>{pending.length}</span>
            )}
          </h2>
          <button style={secondaryBtnStyle} onClick={loadEntries} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {loading && <p style={mutedTextStyle}>Loading entries…</p>}

        {!loading && pending.length === 0 && (
          <EmptyState message="No entries pending review." />
        )}

        {!loading && pending.length > 0 && (
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Minutes</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    actioning={actioningId === entry.id}
                    onApprove={() => handleApprove(entry.id)}
                    onReject={() => handleReject(entry.id)}
                    showActions
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <Card>
          <h2 style={{ ...cardTitleStyle, marginBottom: "var(--space-5)" }}>
            Reviewed Entries
          </h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Minutes</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {reviewed.map((entry) => (
                  <EntryRow key={entry.id} entry={entry} actioning={false} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// EntryRow

interface EntryRowProps {
  entry: WorkEntry;
  actioning: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

function EntryRow({ entry, actioning, onApprove, onReject, showActions }: EntryRowProps) {
  return (
    <tr>
      <td style={tdStyle}>{entry.workDate}</td>
      <td style={tdStyle}>{entry.minutes}</td>
      <td style={{ ...tdStyle, color: "var(--color-text-muted)" }}>
        {entry.description?.trim() || <span style={{ color: "var(--color-text-subtle)" }}>—</span>}
      </td>
      <td style={tdStyle}>
        <StatusBadge status={entry.status} />
      </td>
      {showActions && (
        <td style={tdStyle}>
          <div style={actionRowStyle}>
            <button
              style={approveBtnStyle}
              onClick={onApprove}
              disabled={actioning}
            >
              {actioning ? "…" : "Approve"}
            </button>
            <button
              style={rejectBtnStyle}
              onClick={onReject}
              disabled={actioning}
            >
              {actioning ? "…" : "Reject"}
            </button>
          </div>
        </td>
      )}
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

const cardTitleStyle: CSSProperties = {
  fontSize: "var(--font-size-md)",
  fontWeight: 600,
  color: "var(--color-text)",
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
};

const cardHeaderRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "var(--space-5)",
};

const countBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 22,
  height: 22,
  padding: "0 7px",
  background: "var(--color-primary)",
  color: "#fff",
  borderRadius: 999,
  fontSize: "var(--font-size-xs)",
  fontWeight: 700,
};

const secondaryBtnStyle: CSSProperties = {
  padding: "7px 14px",
  background: "var(--color-surface)",
  color: "var(--color-primary)",
  border: "1px solid var(--color-primary-border)",
  borderRadius: "var(--radius-sm)",
  fontWeight: 600,
  fontSize: "var(--font-size-sm)",
  cursor: "pointer",
};

const mutedTextStyle: CSSProperties = {
  color: "var(--color-text-muted)",
  fontSize: "var(--font-size-sm)",
  padding: "var(--space-4) 0",
};

const tableWrapStyle: CSSProperties = {
  overflowX: "auto",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
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

const tdStyle: CSSProperties = {
  padding: "var(--space-3) var(--space-4)",
  fontSize: "var(--font-size-base)",
  borderBottom: "1px solid var(--color-border)",
  verticalAlign: "middle",
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: "var(--space-2)",
};

const approveBtnStyle: CSSProperties = {
  padding: "5px 12px",
  background: "var(--color-success-bg)",
  color: "var(--color-success-text)",
  border: "1px solid var(--color-success-border)",
  borderRadius: "var(--radius-sm)",
  fontWeight: 600,
  fontSize: "var(--font-size-sm)",
  cursor: "pointer",
};

const rejectBtnStyle: CSSProperties = {
  padding: "5px 12px",
  background: "var(--color-danger-bg)",
  color: "var(--color-danger-text)",
  border: "1px solid var(--color-danger-border)",
  borderRadius: "var(--radius-sm)",
  fontWeight: 600,
  fontSize: "var(--font-size-sm)",
  cursor: "pointer",
};
