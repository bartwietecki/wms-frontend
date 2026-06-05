import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  getLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "../api/admin/leaveRequestsApi";
import { formatDate } from "../utils/time";
import { parseApiError } from "../utils/apiError";
import type { LeaveRequestFilters } from "../api/admin/leaveRequestsApi";
import type { LeaveRequest } from "../api/admin/types";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";

const EMPTY_FILTERS: LeaveRequestFilters = {};

export default function AdminLeaveRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState<LeaveRequestFilters>(EMPTY_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<LeaveRequestFilters>(EMPTY_FILTERS);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [actioningId, setActioningId] = useState<number | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function loadRequests(activeFilters: LeaveRequestFilters, p: number) {
    setLoading(true);
    setError(null);
    setActionSuccess(null);
    try {
      const data = await getLeaveRequests(activeFilters, p);
      setRequests(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setPage(data.number);
    } catch (err) {
      setError(parseApiError(err, "Failed to load leave requests"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRequests(EMPTY_FILTERS, 0); }, []);

  useEffect(() => {
    if (!actionSuccess) return;
    const t = setTimeout(() => setActionSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [actionSuccess]);

  function handleApplyFilters() {
    if (pendingFilters.from && pendingFilters.to && pendingFilters.from > pendingFilters.to) {
      setValidationError("'From' date cannot be after 'To' date.");
      return;
    }
    setValidationError(null);
    setFilters(pendingFilters);
    loadRequests(pendingFilters, 0);
  }

  function handleResetFilters() {
    setPendingFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setValidationError(null);
    loadRequests(EMPTY_FILTERS, 0);
  }

  function set<K extends keyof LeaveRequestFilters>(key: K, value: string) {
    setPendingFilters((prev) => ({ ...prev, [key]: value || undefined }));
  }

  async function handleApprove(id: number) {
    setActioningId(id);
    setError(null);
    try {
      await approveLeaveRequest(id);
      setActionSuccess("Leave request approved.");
      await loadRequests(filters, page);
    } catch (err) {
      setError(parseApiError(err, "Failed to approve leave request"));
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(id: number) {
    setActioningId(id);
    setError(null);
    try {
      await rejectLeaveRequest(id);
      setActionSuccess("Leave request rejected.");
      await loadRequests(filters, page);
    } catch (err) {
      setError(parseApiError(err, "Failed to reject leave request"));
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div>
      <PageHeader
        area="admin"
        title="Leave Requests"
        subtitle="Review and manage employee leave requests."
        action={
          <button
            className="btn-secondary-admin"
            onClick={() => loadRequests(filters, page)}
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
                <option value="PENDING">Pending</option>
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
              <label style={labelStyle}>From</label>
              <input
                className="form-input"
                type="date"
                value={pendingFilters.from ?? ""}
                onChange={(e) => set("from", e.target.value)}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>To</label>
              <input
                className="form-input"
                type="date"
                value={pendingFilters.to ?? ""}
                onChange={(e) => set("to", e.target.value)}
              />
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

      {/* Table */}
      <Card>
        <div style={cardHeaderStyle}>
          <h2 style={cardTitleStyle}>Leave Requests</h2>
          <p style={cardSubtitleStyle}>
            {loading ? "Loading…" : `${totalElements} request${totalElements !== 1 ? "s" : ""} total`}
          </p>
        </div>

        {loading && <p style={mutedTextStyle}>Loading leave requests…</p>}

        {!loading && error === null && requests.length === 0 && (
          <EmptyState message="No leave requests match the current filters." />
        )}

        {!loading && requests.length > 0 && (
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadRowStyle}>
                  <th style={thStyle}>Employee</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Start</th>
                  <th style={thStyle}>End</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Reason</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="table-row-hover">
                    <td style={tdStyle}>{req.employeeName}</td>
                    <td style={tdStyle}>{formatLeaveType(req.type)}</td>
                    <td style={tdStyle}>{formatDate(req.startDate)}</td>
                    <td style={tdStyle}>{formatDate(req.endDate)}</td>
                    <td style={tdStyle}>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ ...tdStyle, color: "var(--color-text-muted)", maxWidth: 260 }}>
                      {req.reason?.trim() || <span style={{ color: "var(--color-text-subtle)" }}>—</span>}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {req.status === "PENDING" && (
                        <div style={actionRowStyle}>
                          <button
                            className="btn-approve"
                            onClick={() => handleApprove(req.id)}
                            disabled={actioningId === req.id}
                          >
                            {actioningId === req.id ? "…" : "✓ Approve"}
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleReject(req.id)}
                            disabled={actioningId === req.id}
                          >
                            {actioningId === req.id ? "…" : "✕ Reject"}
                          </button>
                        </div>
                      )}
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
                onClick={() => loadRequests(filters, page - 1)}
                disabled={page === 0}
              >
                ← Previous
              </button>
              <button
                className="btn-secondary"
                onClick={() => loadRequests(filters, page + 1)}
                disabled={page >= totalPages - 1}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function formatLeaveType(type: string): string {
  return type === "SICK_LEAVE" ? "Sick Leave" : "Holiday";
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

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: "var(--space-2)",
  justifyContent: "flex-end",
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
