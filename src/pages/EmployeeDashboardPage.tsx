import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../api/employee/dashboardApi";
import { getMyWorkEntries } from "../api/employee/workEntriesApi";
import type { EmployeeDashboard, WorkEntry } from "../api/employee/types";
import { getToday, getMonthStart, formatHours, formatDate } from "../utils/time";
import { parseApiError } from "../utils/apiError";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";

const RECENT_LIMIT = 5;

export default function EmployeeDashboardPage() {
  const [data, setData] = useState<EmployeeDashboard | null>(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError] = useState<string | null>(null);

  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entriesError, setEntriesError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setDashError(parseApiError(err, "Failed to load dashboard")))
      .finally(() => setDashLoading(false));

    getMyWorkEntries(getMonthStart(), getToday())
      .then((all) => {
        const sorted = [...all].sort((a, b) => b.workDate.localeCompare(a.workDate));
        setEntries(sorted.slice(0, RECENT_LIMIT));
      })
      .catch((err) => setEntriesError(parseApiError(err, "Failed to load entries")))
      .finally(() => setEntriesLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        area="employee"
        title="Dashboard"
        subtitle="Your work summary for the current month."
      />

      {dashError && <div style={errorStyle}>{dashError}</div>}

      {dashLoading ? (
        <div style={loadingStyle}>Loading…</div>
      ) : data ? (
        <>
          <div style={sectionLabelStyle}>This month overview</div>
          <div style={gridStyle}>
            <StatCard label="Hours This Month" value={data.totalHoursThisMonth.toFixed(1)} unit="h" />
            <StatCard label="Pending Entries" value={data.pendingEntriesCount} accent="warning" />
            <StatCard label="Approved Entries" value={data.approvedEntriesCount} accent="success" />
            <StatCard label="Rejected Entries" value={data.rejectedEntriesCount} accent="danger" />
            <StatCard label="Leave Days Remaining" value={data.leaveDaysRemaining} unit="days" />
          </div>
        </>
      ) : null}

      <div style={bottomRowStyle}>
        <Card style={recentCardStyle}>
          <div style={cardHeaderRowStyle}>
            <div style={cardTitleStyle}>Recent Work Entries</div>
            <Link to="/employee/work-entries" style={viewAllStyle}>
              View All Work Logs →
            </Link>
          </div>

          {entriesError && <div style={errorStyle}>{entriesError}</div>}

          {entriesLoading ? (
            <div style={loadingStyle}>Loading…</div>
          ) : entries.length === 0 ? (
            <EmptyState message="No work entries this month." />
          ) : (
            <div>
              {entries.map((entry, i) => (
                <div
                  key={entry.id}
                  style={{ ...entryRowStyle, borderTop: i === 0 ? "none" : "1px solid var(--color-border)" }}
                >
                  <div style={entryDateStyle}>{formatDate(entry.workDate)}</div>
                  <div style={entryHoursStyle}>{formatHours(entry.minutes)}</div>
                  <div style={entryDescStyle}>
                    {entry.description || <span style={{ color: "var(--color-text-subtle)" }}>—</span>}
                  </div>
                  <StatusBadge status={entry.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card style={actionsCardStyle}>
          <div style={cardTitleStyle}>Quick Actions</div>
          <div style={actionsListStyle}>
            <Link to="/employee/work-entries" className="btn-primary" style={actionLinkStyle}>
              + Add Work Entry
            </Link>
            <Link to="/employee/work-entries" className="btn-secondary" style={actionLinkStyle}>
              View Work Logs
            </Link>
            <Link to="/employee/leave-requests" className="btn-secondary" style={actionLinkStyle}>
              View Leave Requests
            </Link>
            <Link to="/employee/reports" className="btn-secondary" style={actionLinkStyle}>
              View Monthly Reports
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Sub-components

interface StatCardProps {
  label: string;
  value: number | string;
  unit?: string;
  accent?: "warning" | "success" | "danger";
}

function StatCard({ label, value, unit, accent }: StatCardProps) {
  const accentColor = accent ? accentMap[accent] : "var(--color-primary)";
  return (
    <Card style={statCardStyle}>
      <div style={{ ...accentBarStyle, background: accentColor }} />
      <div style={valueStyle}>
        {value}
        {unit && <span style={unitStyle}> {unit}</span>}
      </div>
      <div style={labelStyle}>{label}</div>
    </Card>
  );
}

const accentMap: Record<string, string> = {
  warning: "var(--color-warning-text)",
  success: "var(--color-success-text)",
  danger: "var(--color-danger-text)",
};

// Styles

const sectionLabelStyle: CSSProperties = {
  fontSize: "var(--font-size-xs)",
  fontWeight: 600,
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: "var(--space-3)",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: "var(--space-4)",
  marginBottom: "var(--space-6)",
};

const statCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-2)",
};

const accentBarStyle: CSSProperties = {
  width: 32,
  height: 4,
  borderRadius: 4,
  marginBottom: "var(--space-2)",
};

const valueStyle: CSSProperties = {
  fontSize: "var(--font-size-xl)",
  fontWeight: 700,
  color: "var(--color-text)",
  lineHeight: 1.2,
};

const unitStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  color: "var(--color-text-muted)",
};

const labelStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-muted)",
};

const bottomRowStyle: CSSProperties = {
  display: "flex",
  gap: "var(--space-4)",
  alignItems: "flex-start",
};

const recentCardStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const actionsCardStyle: CSSProperties = {
  width: 220,
  flexShrink: 0,
};

const cardHeaderRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "var(--space-4)",
};

const cardTitleStyle: CSSProperties = {
  fontSize: "var(--font-size-md)",
  fontWeight: 600,
  color: "var(--color-text)",
};

const viewAllStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-primary)",
  textDecoration: "none",
  fontWeight: 500,
};

const entryRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-4)",
  padding: "var(--space-3) 0",
};

const entryDateStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  fontWeight: 600,
  color: "var(--color-text)",
  whiteSpace: "nowrap",
  width: 100,
  flexShrink: 0,
};

const entryHoursStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-muted)",
  whiteSpace: "nowrap",
  width: 60,
  flexShrink: 0,
};

const entryDescStyle: CSSProperties = {
  flex: 1,
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-muted)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const actionsListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-3)",
  marginTop: "var(--space-4)",
};

const actionLinkStyle: CSSProperties = {
  textDecoration: "none",
  justifyContent: "center",
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

const loadingStyle: CSSProperties = {
  color: "var(--color-text-muted)",
  fontSize: "var(--font-size-sm)",
  marginBottom: "var(--space-6)",
};
