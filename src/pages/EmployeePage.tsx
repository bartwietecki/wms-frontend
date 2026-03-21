import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { createWorkEntry, getMyWorkEntries } from "../api/workEntriesApi";
import type { WorkEntry } from "../api/types";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
}

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function EmployeePage() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const minutesNum = Number(minutes);
  const hoursHint = minutesNum > 0 ? formatHours(minutesNum) : null;

  return (
    <div>
      <PageHeader
        area="employee"
        title="My Work Logs"
        subtitle="Submit your daily work hours and track their approval status."
      />

      {error && <div style={errorBannerStyle}>{error}</div>}
      {submitSuccess && (
        <div style={successBannerStyle}>Work log submitted successfully.</div>
      )}

      {/* Add Work Log */}
      <Card style={{ maxWidth: 500, marginBottom: "var(--space-8)" }}>
        <h2 style={cardTitleStyle}>Log Work Hours</h2>
        <form onSubmit={handleCreateSubmit} style={formGridStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Date</label>
            <input
              style={inputStyle}
              type="date"
              value={workDate}
              onChange={(e) => { setWorkDate(e.target.value); setSubmitSuccess(false); }}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              Minutes
              {hoursHint && <span style={hintStyle}> — {hoursHint}</span>}
            </label>
            <input
              style={inputStyle}
              type="number"
              min="1"
              step="1"
              value={minutes}
              onChange={(e) => { setMinutes(e.target.value); setSubmitSuccess(false); }}
              required
            />
            <span style={fieldHelpStyle}>e.g. 480 = 8 hours, 60 = 1 hour</span>
          </div>

          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Description <span style={optionalStyle}>(optional)</span></label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
              value={description}
              onChange={(e) => { setDescription(e.target.value); setSubmitSuccess(false); }}
              rows={3}
              placeholder="What did you work on?"
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <button style={primaryBtnStyle} type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Submit Work Log"}
            </button>
          </div>
        </form>
      </Card>

      {/* Work Log List */}
      <Card>
        <div style={cardHeaderRowStyle}>
          <div>
            <h2 style={cardTitleStyle}>Submission History</h2>
            <p style={cardSubtitleStyle}>Your work logs for the selected period.</p>
          </div>
          <form onSubmit={handleFilterSubmit} style={filterRowStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>From</label>
              <input
                style={inputStyle}
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>To</label>
              <input
                style={inputStyle}
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />
            </div>
            <button style={secondaryBtnStyle} type="submit" disabled={loading}>
              {loading ? "Loading…" : "Apply"}
            </button>
          </form>
        </div>

        {loading && <p style={mutedTextStyle}>Loading your work logs…</p>}

        {!loading && entries.length === 0 && (
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
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} style={tbodyRowStyle}>
                    <td style={tdStyle}>{entry.workDate}</td>
                    <td style={tdStyle}>
                      <span style={durationStyle}>{entry.minutes} min</span>
                      <span style={durationHintStyle}>{formatHours(entry.minutes)}</span>
                    </td>
                    <td style={{ ...tdStyle, color: "var(--color-text-muted)", maxWidth: 320 }}>
                      {entry.description?.trim() || <span style={{ color: "var(--color-text-subtle)" }}>—</span>}
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={entry.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "var(--space-4)",
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

const hintStyle: CSSProperties = {
  fontWeight: 400,
  color: "var(--color-primary)",
};

const optionalStyle: CSSProperties = {
  fontWeight: 400,
  color: "var(--color-text-subtle)",
};

const fieldHelpStyle: CSSProperties = {
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-subtle)",
};

const inputStyle: CSSProperties = {
  padding: "8px 10px",
  border: "1px solid var(--color-border-strong)",
  borderRadius: "var(--radius-sm)",
  fontSize: "var(--font-size-base)",
  color: "var(--color-text)",
  background: "var(--color-surface)",
  outline: "none",
  width: "100%",
};

const primaryBtnStyle: CSSProperties = {
  padding: "9px 20px",
  background: "var(--color-primary)",
  color: "#fff",
  border: "none",
  borderRadius: "var(--radius-sm)",
  fontWeight: 600,
  fontSize: "var(--font-size-sm)",
  cursor: "pointer",
};

const secondaryBtnStyle: CSSProperties = {
  padding: "8px 16px",
  background: "var(--color-surface)",
  color: "var(--color-primary)",
  border: "1px solid var(--color-primary-border)",
  borderRadius: "var(--radius-sm)",
  fontWeight: 600,
  fontSize: "var(--font-size-sm)",
  cursor: "pointer",
  whiteSpace: "nowrap",
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

const theadRowStyle: CSSProperties = {
  background: "var(--color-bg)",
};

const tbodyRowStyle: CSSProperties = {};

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
