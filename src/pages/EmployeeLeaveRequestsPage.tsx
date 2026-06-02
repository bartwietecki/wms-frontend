import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { getMyLeaveRequests, createLeaveRequest } from "../api/employee/leaveRequestsApi";
import { formatDate } from "../utils/time";
import type { LeaveRequest, LeaveRequestType } from "../api/employee/types";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";

export default function EmployeeLeaveRequestsPage() {
  // Form state
  const [type, setType] = useState<LeaveRequestType>("HOLIDAY");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // List state
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRequests() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyLeaveRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRequests(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!startDate || !endDate) {
      setSubmitError("Start date and end date are required.");
      return;
    }
    if (startDate > endDate) {
      setSubmitError("Start date must be on or before end date.");
      return;
    }
    if (reason.length > 500) {
      setSubmitError("Reason must be 500 characters or less.");
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    setSubmitSuccess(false);
    try {
      await createLeaveRequest({
        type,
        startDate,
        endDate,
        reason: reason.trim() || undefined,
      });
      setType("HOLIDAY");
      setStartDate("");
      setEndDate("");
      setReason("");
      setSubmitSuccess(true);
      await loadRequests();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        area="employee"
        title="Leave Requests"
        subtitle="Submit and track your leave requests."
      />

      {/* Create form */}
      <Card style={formCardStyle}>
        <h2 style={cardTitleStyle}>New Leave Request</h2>

        {submitError && <div style={errorStyle}>{submitError}</div>}
        {submitSuccess && <div style={successStyle}>Leave request submitted successfully.</div>}

        <form onSubmit={handleSubmit} style={formGridStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Type</label>
            <select
              className="form-input"
              value={type}
              onChange={(e) => { setType(e.target.value as LeaveRequestType); setSubmitSuccess(false); }}
              disabled={submitting}
            >
              <option value="HOLIDAY">Holiday</option>
              <option value="SICK_LEAVE">Sick Leave</option>
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Start Date</label>
            <input
              className="form-input"
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setSubmitSuccess(false); }}
              disabled={submitting}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>End Date</label>
            <input
              className="form-input"
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setSubmitSuccess(false); }}
              disabled={submitting}
              required
            />
          </div>

          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>
              Reason <span style={optionalStyle}>(optional, max 500 characters)</span>
            </label>
            <textarea
              className="form-input"
              style={{ resize: "vertical", minHeight: 80 }}
              value={reason}
              onChange={(e) => { setReason(e.target.value); setSubmitSuccess(false); }}
              rows={3}
              placeholder="Briefly describe the reason for your leave…"
              disabled={submitting}
              maxLength={500}
            />
            {reason.length > 400 && (
              <span style={charCountStyle}>{reason.length} / 500</span>
            )}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Leave Request"}
            </button>
          </div>
        </form>
      </Card>

      {/* My leave requests */}
      <Card>
        <div style={cardHeaderStyle}>
          <h2 style={cardTitleStyle}>My Leave Requests</h2>
          <p style={cardSubtitleStyle}>All your submitted leave requests.</p>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        {loading && <p style={mutedTextStyle}>Loading…</p>}

        {!loading && requests.length === 0 && (
          <EmptyState message="You have not submitted any leave requests yet." />
        )}

        {!loading && requests.length > 0 && (
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadRowStyle}>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Start</th>
                  <th style={thStyle}>End</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Reason</th>
                  <th style={thStyle}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="table-row-hover">
                    <td style={tdStyle}>{formatLeaveType(req.type)}</td>
                    <td style={tdStyle}>{formatDate(req.startDate)}</td>
                    <td style={tdStyle}>{formatDate(req.endDate)}</td>
                    <td style={tdStyle}>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ ...tdStyle, color: "var(--color-text-muted)", maxWidth: 280 }}>
                      {req.reason?.trim() || <span style={{ color: "var(--color-text-subtle)" }}>—</span>}
                    </td>
                    <td style={{ ...tdStyle, color: "var(--color-text-muted)" }}>
                      {formatDate(req.createdAt.slice(0, 10))}
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

function formatLeaveType(type: string): string {
  return type === "SICK_LEAVE" ? "Sick Leave" : "Holiday";
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const formCardStyle: CSSProperties = {
  maxWidth: 560,
  marginBottom: "var(--space-8)",
};

const cardTitleStyle: CSSProperties = {
  fontSize: "var(--font-size-md)",
  fontWeight: 600,
  color: "var(--color-text)",
  marginBottom: "var(--space-5)",
};

const cardHeaderStyle: CSSProperties = {
  marginBottom: "var(--space-5)",
};

const cardSubtitleStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-muted)",
  marginTop: "var(--space-1)",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "var(--space-4)",
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

const optionalStyle: CSSProperties = {
  fontWeight: 400,
  color: "var(--color-text-subtle)",
};

const charCountStyle: CSSProperties = {
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-subtle)",
  textAlign: "right",
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
