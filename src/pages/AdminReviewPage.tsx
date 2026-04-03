import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { getAllWorkEntries, approveWorkEntry, rejectWorkEntry } from "../api/admin/workEntriesApi";
import type { WorkEntry } from "../api/admin/types";
import PageHeader from "../components/ui/PageHeader";
import PendingEntriesTable from "../features/admin/PendingEntriesTable";
import ReviewedEntriesTable from "../features/admin/ReviewedEntriesTable";
import EditWorkEntryModal from "../features/admin/EditWorkEntryModal";

export default function AdminReviewPage() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);

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

  function handleEditSaved() {
    setEditingEntry(null);
    loadEntries();
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

      <PendingEntriesTable
        entries={pending}
        loading={loading}
        actioningId={actioningId}
        onApprove={handleApprove}
        onReject={handleReject}
        onEdit={setEditingEntry}
      />

      <ReviewedEntriesTable
        entries={reviewed}
        onEdit={setEditingEntry}
      />

      {editingEntry && (
        <EditWorkEntryModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}

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
