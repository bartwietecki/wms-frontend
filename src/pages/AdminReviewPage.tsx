import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  getWorkEntries,
  approveWorkEntry,
  rejectWorkEntry,
} from "../api/admin/workEntriesApi";
import type { WorkEntryFilters } from "../api/admin/workEntriesApi";
import type { WorkEntry } from "../api/admin/types";
import { parseApiError } from "../utils/apiError";
import PageHeader from "../components/ui/PageHeader";
import WorkEntryFilterBar from "../features/admin/WorkEntryFilterBar";
import WorkEntriesTable from "../features/admin/WorkEntriesTable";
import EditWorkEntryModal from "../features/admin/EditWorkEntryModal";
import DeleteWorkEntryModal from "../features/admin/DeleteWorkEntryModal";

const EMPTY_FILTERS: WorkEntryFilters = {};

export default function AdminReviewPage() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState<WorkEntryFilters>(EMPTY_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<WorkEntryFilters>(EMPTY_FILTERS);
  const [search, setSearch] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const [actioningId, setActioningId] = useState<number | null>(null);
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<WorkEntry | null>(null);

  async function loadEntries(activeFilters: WorkEntryFilters, p: number) {
    try {
      setLoading(true);
      setError(null);
      const data = await getWorkEntries(activeFilters, p);
      setEntries(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setPage(data.number);
    } catch (err) {
      setError(parseApiError(err, "Failed to load work entries"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEntries(EMPTY_FILTERS, 0); }, []);

  function handleApplyFilters() {
    if (pendingFilters.from && pendingFilters.to && pendingFilters.from > pendingFilters.to) {
      setValidationError("'From' date cannot be after 'To' date.");
      return;
    }
    setValidationError(null);
    setFilters(pendingFilters);
    loadEntries(pendingFilters, 0);
  }

  function handleResetFilters() {
    setPendingFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setSearch("");
    setValidationError(null);
    loadEntries(EMPTY_FILTERS, 0);
  }

  function handlePageChange(p: number) {
    loadEntries(filters, p);
  }

  async function handleApprove(id: number) {
    try {
      setActioningId(id);
      setError(null);
      await approveWorkEntry(id);
      await loadEntries(filters, page);
    } catch (err) {
      setError(parseApiError(err, "Failed to approve entry"));
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(id: number) {
    try {
      setActioningId(id);
      setError(null);
      await rejectWorkEntry(id);
      await loadEntries(filters, page);
    } catch (err) {
      setError(parseApiError(err, "Failed to reject entry"));
    } finally {
      setActioningId(null);
    }
  }

  // Client-side search on current page
  const visibleEntries = search.trim()
    ? entries.filter((e) => {
        const q = search.toLowerCase();
        return (
          e.employeeName.toLowerCase().includes(q) ||
          (e.description ?? "").toLowerCase().includes(q)
        );
      })
    : entries;

  return (
    <div>
      <PageHeader
        area="admin"
        title="Work Entry Review"
        subtitle="Filter, review and manage employee work log submissions."
        action={
          <button
            className="btn-secondary-admin"
            onClick={() => loadEntries(filters, page)}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
        }
      />

      <WorkEntryFilterBar
        filters={pendingFilters}
        search={search}
        validationError={validationError}
        onFiltersChange={setPendingFilters}
        onSearchChange={setSearch}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {error && <div style={errorBannerStyle}>{error}</div>}

      <WorkEntriesTable
        entries={visibleEntries}
        loading={loading}
        totalElements={totalElements}
        page={page}
        totalPages={totalPages}
        actioningId={actioningId}
        onApprove={handleApprove}
        onReject={handleReject}
        onEdit={setEditingEntry}
        onDelete={setDeletingEntry}
        onPageChange={handlePageChange}
      />

      {editingEntry && (
        <EditWorkEntryModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSaved={() => { setEditingEntry(null); loadEntries(filters, page); }}
        />
      )}

      {deletingEntry && (
        <DeleteWorkEntryModal
          entry={deletingEntry}
          onClose={() => setDeletingEntry(null)}
          onDeleted={() => { setDeletingEntry(null); loadEntries(filters, page); }}
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
