import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { createWorkEntry, getMyWorkEntries } from "../api/employee/workEntriesApi";
import type { WorkEntry } from "../api/employee/types";
import { getToday, getMonthStart } from "../utils/time";
import PageHeader from "../components/ui/PageHeader";
import WorkLogForm from "../features/employee/WorkLogForm";
import WorkLogTable from "../features/employee/WorkLogTable";
import EditWorkLogModal from "../features/employee/EditWorkLogModal";
import DeleteWorkLogModal from "../features/employee/DeleteWorkLogModal";

export default function EmployeePage() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<WorkEntry | null>(null);

  const [from, setFrom] = useState(getMonthStart());
  const [to, setTo] = useState(getToday());

  const [workDate, setWorkDate] = useState(getToday());
  const [minutes, setMinutes] = useState("480");
  const [description, setDescription] = useState("");

  async function loadEntries() {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyWorkEntries(from, to);
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load work logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEntries(); }, []);

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSubmitSuccess(false);
      await createWorkEntry({
        workDate,
        minutes: Number(minutes),
        description: description.trim(),
      });
      setWorkDate(getToday());
      setMinutes("480");
      setDescription("");
      setSubmitSuccess(true);
      await loadEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create work log");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFilterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await loadEntries();
  }

  return (
    <div>
      <PageHeader
        area="employee"
        title="My Work Logs"
        subtitle="Submit your daily work hours and track their approval status."
      />

      {error && <div style={errorBannerStyle}>{error}</div>}
      {submitSuccess && <div style={successBannerStyle}>Work log submitted successfully.</div>}

      <WorkLogForm
        workDate={workDate}
        minutes={minutes}
        description={description}
        submitting={submitting}
        onWorkDateChange={(v) => { setWorkDate(v); setSubmitSuccess(false); }}
        onMinutesChange={(v) => { setMinutes(v); setSubmitSuccess(false); }}
        onDescriptionChange={(v) => { setDescription(v); setSubmitSuccess(false); }}
        onSubmit={handleCreateSubmit}
      />

      <WorkLogTable
        entries={entries}
        loading={loading}
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        onFilterSubmit={handleFilterSubmit}
        onEdit={setEditingEntry}
        onDelete={setDeletingEntry}
      />

      {editingEntry && (
        <EditWorkLogModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSaved={() => { setEditingEntry(null); loadEntries(); }}
        />
      )}

      {deletingEntry && (
        <DeleteWorkLogModal
          entry={deletingEntry}
          onClose={() => setDeletingEntry(null)}
          onDeleted={() => { setDeletingEntry(null); loadEntries(); }}
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
  marginBottom: "var(--space-5)",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
};

const successBannerStyle: CSSProperties = {
  background: "var(--color-success-bg)",
  color: "var(--color-success-text)",
  border: "1px solid var(--color-success-border)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-3) var(--space-4)",
  marginBottom: "var(--space-5)",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
};
