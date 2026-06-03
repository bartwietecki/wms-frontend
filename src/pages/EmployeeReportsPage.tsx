import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  getMonthlyPreview,
  submitMonthlyReport,
  getMyReports,
} from "../api/employee/reportsApi";
import type { MonthlyReportPreview, MyReport } from "../api/employee/types";
import { formatDate, formatMonthName } from "../utils/time";
import { parseApiError } from "../utils/apiError";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH = now.getMonth() + 1;

const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export default function EmployeeReportsPage() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(CURRENT_MONTH);

  const [preview, setPreview] = useState<MonthlyReportPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [history, setHistory] = useState<MyReport[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  async function loadHistory() {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await getMyReports();
      const sorted = [...data].sort((a, b) =>
        b.year !== a.year ? b.year - a.year : b.month - a.month
      );
      setHistory(sorted);
    } catch (err) {
      setHistoryError(parseApiError(err, "Failed to load report history"));
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => { loadHistory(); }, []);

  async function handlePreview() {
    setPreviewLoading(true);
    setPreviewError(null);
    setPreview(null);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const data = await getMonthlyPreview(year, month);
      const sortedEntries = [...data.entries].sort((a, b) =>
        a.workDate.localeCompare(b.workDate)
      );
      setPreview({ ...data, entries: sortedEntries });
    } catch (err) {
      setPreviewError(parseApiError(err, "Failed to load preview"));
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleSubmit() {
    if (!preview) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      await submitMonthlyReport(year, month);
      setSubmitSuccess(`Report for ${formatMonthName(month)} ${year} submitted successfully.`);
      await Promise.all([handlePreview(), loadHistory()]);
    } catch (err) {
      setSubmitError(parseApiError(err, "Failed to submit report"));
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    preview !== null &&
    (preview.existingReportStatus === null ||
      preview.existingReportStatus === "REJECTED");

  const submitLabel = () => {
    if (submitting) return "Submitting…";
    if (!preview) return "Submit Month";
    if (preview.existingReportStatus === "SUBMITTED") return "Awaiting Review";
    if (preview.existingReportStatus === "APPROVED") return "Month Approved";
    if (preview.existingReportStatus === "REJECTED") return "Resubmit Month";
    return "Submit Month";
  };

  return (
    <div>
      <PageHeader
        area="employee"
        title="Monthly Reports"
        subtitle="Preview and submit your monthly work reports."
      />

      {/* Section 1 — Preview & Submit */}
      <Card style={{ marginBottom: "var(--space-8)" }}>
        <h2 style={cardTitleStyle}>Generate Monthly Report</h2>

        <div style={previewFormStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Year</label>
            <input
              className="form-input"
              type="number"
              min={2020}
              max={CURRENT_YEAR + 1}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{ width: 100 }}
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Month</label>
            <select
              className="form-input"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>&nbsp;</label>
            <button
              className="btn-secondary"
              onClick={handlePreview}
              disabled={previewLoading}
            >
              {previewLoading ? "Loading…" : "Preview"}
            </button>
          </div>
        </div>

        {previewError && <div style={errorStyle}>{previewError}</div>}

        {preview && (
          <div style={{ marginTop: "var(--space-5)" }}>
            {/* Summary card */}
            <div style={summaryGridStyle}>
              <div style={summaryItemStyle}>
                <span style={summaryLabelStyle}>Period</span>
                <span style={summaryValueStyle}>{formatMonthName(preview.month)} {preview.year}</span>
              </div>
              <div style={summaryItemStyle}>
                <span style={summaryLabelStyle}>Total Hours</span>
                <span style={summaryValueStyle}>{preview.totalHours.toFixed(1)} h</span>
              </div>
              <div style={summaryItemStyle}>
                <span style={summaryLabelStyle}>Total Minutes</span>
                <span style={summaryValueStyle}>{preview.totalMinutes}</span>
              </div>
              <div style={summaryItemStyle}>
                <span style={summaryLabelStyle}>Entries</span>
                <span style={summaryValueStyle}>{preview.entriesCount}</span>
              </div>
              {preview.existingReportStatus && (
                <div style={summaryItemStyle}>
                  <span style={summaryLabelStyle}>Current Status</span>
                  <StatusBadge status={preview.existingReportStatus} />
                </div>
              )}
            </div>

            {/* Entries table */}
            {preview.entries.length > 0 ? (
              <div style={{ ...tableWrapStyle, margin: "var(--space-5) 0" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={theadRowStyle}>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Minutes</th>
                      <th style={thStyle}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.entries.map((entry) => (
                      <tr key={entry.id} className="table-row-hover">
                        <td style={tdStyle}>{formatDate(entry.workDate)}</td>
                        <td style={tdStyle}>{entry.minutes}</td>
                        <td style={{ ...tdStyle, color: "var(--color-text-muted)" }}>
                          {entry.description || <span style={{ color: "var(--color-text-subtle)" }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState message="No work entries for this period." />
            )}

            {submitError && <div style={errorStyle}>{submitError}</div>}
            {submitSuccess && <div style={successStyle}>{submitSuccess}</div>}

            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
            >
              {submitLabel()}
            </button>
          </div>
        )}
      </Card>

      {/* Section 2 — History */}
      <Card>
        <div style={cardHeaderStyle}>
          <h2 style={cardTitleStyle}>Report History</h2>
          <p style={cardSubtitleStyle}>All your submitted monthly reports.</p>
        </div>

        {historyError && <div style={errorStyle}>{historyError}</div>}
        {historyLoading && <p style={mutedStyle}>Loading…</p>}

        {!historyLoading && history.length === 0 && (
          <EmptyState message="You have not submitted any monthly reports yet." />
        )}

        {!historyLoading && history.length > 0 && (
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadRowStyle}>
                  <th style={thStyle}>Month</th>
                  <th style={thStyle}>Year</th>
                  <th style={thStyle}>Total Hours</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id} className="table-row-hover">
                    <td style={tdStyle}>{formatMonthName(r.month)}</td>
                    <td style={tdStyle}>{r.year}</td>
                    <td style={tdStyle}>{r.totalHours.toFixed(1)} h</td>
                    <td style={tdStyle}><StatusBadge status={r.status} /></td>
                    <td style={{ ...tdStyle, color: "var(--color-text-muted)" }}>
                      {formatDate(r.submittedAt.slice(0, 10))}
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

const cardTitleStyle: CSSProperties = {
  fontSize: "var(--font-size-md)",
  fontWeight: 600,
  color: "var(--color-text)",
  marginBottom: "var(--space-5)",
};

const cardHeaderStyle: CSSProperties = { marginBottom: "var(--space-5)" };

const cardSubtitleStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-muted)",
  marginTop: "var(--space-1)",
};

const previewFormStyle: CSSProperties = {
  display: "flex",
  gap: "var(--space-4)",
  alignItems: "flex-end",
  marginBottom: "var(--space-4)",
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

const summaryGridStyle: CSSProperties = {
  display: "flex",
  gap: "var(--space-6)",
  flexWrap: "wrap",
  padding: "var(--space-4)",
  background: "var(--color-bg)",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-border)",
  marginBottom: "var(--space-4)",
};

const summaryItemStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-1)",
};

const summaryLabelStyle: CSSProperties = {
  fontSize: "var(--font-size-xs)",
  fontWeight: 600,
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const summaryValueStyle: CSSProperties = {
  fontSize: "var(--font-size-md)",
  fontWeight: 600,
  color: "var(--color-text)",
};

const mutedStyle: CSSProperties = {
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

const errorStyle: CSSProperties = {
  background: "var(--color-danger-bg)",
  color: "var(--color-danger-text)",
  border: "1px solid var(--color-danger-border)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-3) var(--space-4)",
  marginBottom: "var(--space-5)",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
};

const successStyle: CSSProperties = {
  background: "var(--color-success-bg)",
  color: "var(--color-success-text)",
  border: "1px solid var(--color-success-border)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-3) var(--space-4)",
  marginBottom: "var(--space-5)",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
};
