import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  getAdminReports,
  getAdminReport,
  approveReport,
  rejectReport,
} from "../api/admin/reportsApi";
import type { ReportFilters } from "../api/admin/reportsApi";
import type { AdminReport, AdminReportDetail } from "../api/admin/types";
import { formatDate, formatMonthName } from "../utils/time";
import { parseApiError } from "../utils/apiError";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";

const EMPTY_FILTERS: ReportFilters = {};

const MONTH_OPTIONS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState<ReportFilters>(EMPTY_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<ReportFilters>(EMPTY_FILTERS);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [detail, setDetail] = useState<AdminReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [actioningId, setActioningId] = useState<number | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [rejectMode, setRejectMode] = useState(false);
  const [adminComment, setAdminComment] = useState("");

  async function loadReports(activeFilters: ReportFilters, p: number) {
    setLoading(true);
    setError(null);
    setActionSuccess(null);
    try {
      const data = await getAdminReports(activeFilters, p);
      setReports(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setPage(data.number);
    } catch (err) {
      setError(parseApiError(err, "Failed to load reports"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReports(EMPTY_FILTERS, 0); }, []);

  function handleApplyFilters() {
    setValidationError(null);
    setFilters(pendingFilters);
    setDetail(null);
    loadReports(pendingFilters, 0);
  }

  function handleResetFilters() {
    setPendingFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setValidationError(null);
    setDetail(null);
    loadReports(EMPTY_FILTERS, 0);
  }

  function set<K extends keyof ReportFilters>(key: K, value: string) {
    setPendingFilters((prev) => ({ ...prev, [key]: value || undefined }));
  }

  async function handleView(id: number) {
    if (detail?.id === id) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);
    setRejectMode(false);
    setAdminComment("");
    setActionError(null);
    setActionSuccess(null);
    try {
      const data = await getAdminReport(id);
      const sortedEntries = [...data.entries].sort((a, b) =>
        a.workDate.localeCompare(b.workDate)
      );
      setDetail({ ...data, entries: sortedEntries });
    } catch (err) {
      setDetailError(parseApiError(err, "Failed to load report detail"));
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleApprove(id: number) {
    setActioningId(id);
    setActionError(null);
    try {
      await approveReport(id);
      setActionSuccess("Report approved.");
      setRejectMode(false);
      await Promise.all([loadReports(filters, page), handleView(id)]);
    } catch (err) {
      setActionError(parseApiError(err, "Failed to approve report"));
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(id: number) {
    if (!adminComment.trim()) {
      setActionError("Admin comment is required to reject a report.");
      return;
    }
    setActioningId(id);
    setActionError(null);
    try {
      await rejectReport(id, adminComment.trim());
      setActionSuccess("Report rejected.");
      setRejectMode(false);
      setAdminComment("");
      await Promise.all([loadReports(filters, page), handleView(id)]);
    } catch (err) {
      setActionError(parseApiError(err, "Failed to reject report"));
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div>
      <PageHeader
        area="admin"
        title="Monthly Reports"
        subtitle="Review and approve employee monthly work reports."
        action={
          <button
            className="btn-secondary-admin"
            onClick={() => loadReports(filters, page)}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
        }
      />

      {/* Filter bar */}
      <Card style={{ marginBottom: "var(--space-6)" }}>
        <form onSubmit={(e) => { e.preventDefault(); handleApplyFilters(); }}>
          <div style={filterGridStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Status</label>
              <select
                className="form-input"
                value={pendingFilters.status ?? ""}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="">All</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Employee ID</label>
              <input
                className="form-input"
                type="number"
                min="1"
                placeholder="e.g. 5"
                value={pendingFilters.employeeId ?? ""}
                onChange={(e) => set("employeeId", e.target.value)}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Year</label>
              <input
                className="form-input"
                type="number"
                min="2020"
                placeholder="e.g. 2026"
                value={pendingFilters.year ?? ""}
                onChange={(e) => set("year", e.target.value)}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Month</label>
              <select
                className="form-input"
                value={pendingFilters.month ?? ""}
                onChange={(e) => set("month", e.target.value)}
              >
                <option value="">All</option>
                {MONTH_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {validationError && <p style={validationStyle}>{validationError}</p>}

          <div style={filterFooterStyle}>
            <button type="button" className="btn-secondary" onClick={handleResetFilters}>
              Reset
            </button>
            <button type="submit" className="btn-primary">
              Apply filters
            </button>
          </div>
        </form>
      </Card>

      {error && <div style={errorStyle}>{error}</div>}
      {actionSuccess && <div style={successStyle}>{actionSuccess}</div>}

      {/* Reports table */}
      <Card style={{ marginBottom: "var(--space-6)" }}>
        <div style={cardHeaderStyle}>
          <h2 style={cardTitleStyle}>Monthly Reports</h2>
          <p style={cardSubtitleStyle}>
            {loading ? "Loading…" : `${totalElements} report${totalElements !== 1 ? "s" : ""} total`}
          </p>
        </div>

        {loading && <p style={mutedStyle}>Loading reports…</p>}

        {!loading && reports.length === 0 && (
          <EmptyState message="No reports match the current filters." />
        )}

        {!loading && reports.length > 0 && (
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadRowStyle}>
                  <th style={thStyle}>Employee</th>
                  <th style={thStyle}>Month</th>
                  <th style={thStyle}>Year</th>
                  <th style={thStyle}>Total Hours</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Submitted At</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr
                    key={r.id}
                    className="table-row-hover"
                    style={detail?.id === r.id ? selectedRowStyle : undefined}
                  >
                    <td style={tdStyle}>{r.employeeName}</td>
                    <td style={tdStyle}>{formatMonthName(r.month)}</td>
                    <td style={tdStyle}>{r.year}</td>
                    <td style={tdStyle}>{r.totalHours.toFixed(1)} h</td>
                    <td style={tdStyle}><StatusBadge status={r.status} /></td>
                    <td style={{ ...tdStyle, color: "var(--color-text-muted)" }}>
                      {formatDate(r.submittedAt.slice(0, 10))}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button
                        className="btn-secondary"
                        onClick={() => handleView(r.id)}
                      >
                        {detail?.id === r.id ? "Close" : "View"}
                      </button>
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
                onClick={() => loadReports(filters, page - 1)}
                disabled={page === 0}
              >
                ← Previous
              </button>
              <button
                className="btn-secondary"
                onClick={() => loadReports(filters, page + 1)}
                disabled={page >= totalPages - 1}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail panel */}
      {detailLoading && (
        <Card>
          <p style={mutedStyle}>Loading report detail…</p>
        </Card>
      )}

      {detailError && <div style={errorStyle}>{detailError}</div>}

      {detail && !detailLoading && (
        <Card>
          {/* Summary */}
          <div style={cardHeaderStyle}>
            <h2 style={cardTitleStyle}>
              Report — {formatMonthName(detail.month)} {detail.year} · {detail.employeeName}
            </h2>
          </div>

          <div style={summaryGridStyle}>
            <SummaryItem label="Employee" value={detail.employeeName} />
            <SummaryItem label="Period" value={`${formatMonthName(detail.month)} ${detail.year}`} />
            <SummaryItem label="Total Hours" value={`${detail.totalHours.toFixed(1)} h`} />
            <SummaryItem label="Status" value={<StatusBadge status={detail.status} />} />
            <SummaryItem label="Submitted At" value={formatDate(detail.submittedAt.slice(0, 10))} />
            {detail.reviewedAt && (
              <SummaryItem label="Reviewed At" value={formatDate(detail.reviewedAt.slice(0, 10))} />
            )}
            {detail.adminComment && (
              <SummaryItem label="Admin Comment" value={detail.adminComment} />
            )}
          </div>

          {/* Entries */}
          <div style={detailSectionLabel}>Work Entries</div>

          {detail.entries.length === 0 ? (
            <EmptyState message="No entries in this report." />
          ) : (
            <div style={tableWrapStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr style={theadRowStyle}>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Minutes</th>
                    <th style={thStyle}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.entries.map((entry) => (
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
          )}

          {/* Approval actions */}
          {detail.status === "SUBMITTED" && (
            <div style={actionsAreaStyle}>
              <div style={detailSectionLabel}>Actions</div>

              {actionError && <div style={{ ...errorStyle, marginBottom: "var(--space-4)" }}>{actionError}</div>}

              {!rejectMode ? (
                <div style={actionRowStyle}>
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(detail.id)}
                    disabled={actioningId === detail.id}
                  >
                    {actioningId === detail.id ? "…" : "✓ Approve"}
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => { setRejectMode(true); setActionError(null); }}
                    disabled={actioningId === detail.id}
                  >
                    ✕ Reject
                  </button>
                </div>
              ) : (
                <div style={rejectFormStyle}>
                  <label style={labelStyle}>Admin Comment <span style={requiredStyle}>*</span></label>
                  <textarea
                    className="form-input"
                    style={{ resize: "vertical", minHeight: 80 }}
                    rows={3}
                    placeholder="Explain why this report is being rejected…"
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                  />
                  <div style={actionRowStyle}>
                    <button
                      className="btn-reject"
                      onClick={() => handleReject(detail.id)}
                      disabled={actioningId === detail.id || !adminComment.trim()}
                    >
                      {actioningId === detail.id ? "…" : "✕ Confirm Reject"}
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => { setRejectMode(false); setAdminComment(""); setActionError(null); }}
                      disabled={actioningId === detail.id}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={summaryItemStyle}>
      <span style={summaryLabelStyle}>{label}</span>
      <span style={summaryValueStyle}>{value}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const filterGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "var(--space-4)",
  marginBottom: "var(--space-4)",
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

const validationStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-danger-text)",
  marginBottom: "var(--space-3)",
};

const filterFooterStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "var(--space-3)",
};

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

const selectedRowStyle: CSSProperties = {
  background: "var(--color-admin-tint)",
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

const summaryGridStyle: CSSProperties = {
  display: "flex",
  gap: "var(--space-6)",
  flexWrap: "wrap",
  padding: "var(--space-4)",
  background: "var(--color-bg)",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-border)",
  marginBottom: "var(--space-5)",
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
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  color: "var(--color-text)",
};

const detailSectionLabel: CSSProperties = {
  fontSize: "var(--font-size-xs)",
  fontWeight: 600,
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginTop: "var(--space-5)",
  marginBottom: "var(--space-3)",
};

const actionsAreaStyle: CSSProperties = {
  marginTop: "var(--space-5)",
  paddingTop: "var(--space-4)",
  borderTop: "1px solid var(--color-border)",
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: "var(--space-2)",
};

const rejectFormStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-3)",
  maxWidth: 480,
};

const requiredStyle: CSSProperties = {
  color: "var(--color-danger-text)",
};

const errorStyle: CSSProperties = {
  background: "var(--color-danger-bg)",
  color: "var(--color-danger-text)",
  border: "1px solid var(--color-danger-border)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-3) var(--space-4)",
  marginBottom: "var(--space-6)",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
};

const successStyle: CSSProperties = {
  background: "var(--color-success-bg)",
  color: "var(--color-success-text)",
  border: "1px solid var(--color-success-border)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-3) var(--space-4)",
  marginBottom: "var(--space-6)",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
};
