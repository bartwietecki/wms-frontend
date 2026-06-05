import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboard } from "../api/admin/dashboardApi";
import { getWorkEntries } from "../api/admin/workEntriesApi";
import type { AdminDashboard, WorkEntry } from "../api/admin/types";
import { formatHours, formatDate } from "../utils/time";
import { parseApiError } from "../utils/apiError";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";

const PENDING_LIMIT = 5;

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entriesError, setEntriesError] = useState<string | null>(null);

  useEffect(() => {
    getAdminDashboard()
      .then(setData)
      .catch((err) => setError(parseApiError(err, "Failed to load dashboard")))
      .finally(() => setLoading(false));

    getWorkEntries({ status: "PENDING" }, 0, PENDING_LIMIT)
      .then((page) => {
        const sorted = [...page.content].sort((a, b) => b.workDate.localeCompare(a.workDate));
        setEntries(sorted);
      })
      .catch((err) => setEntriesError(parseApiError(err, "Failed to load entries")))
      .finally(() => setEntriesLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        area="admin"
        title="Dashboard"
        subtitle="Overview of pending actions and workforce status."
      />

      {error && <div style={errorStyle}>{error}</div>}

      {loading ? (
        <div style={loadingStyle}>Loading…</div>
      ) : data ? (
        <>
          <div style={sectionLabelStyle}>Current overview</div>
          <div style={gridStyle}>
            <StatCard
              label="Pending Approvals"
              value={data.pendingApprovalsCount}
              accent="warning"
              to="/admin/work-entries?status=PENDING"
            />
            <StatCard
              label="Active Employees"
              value={data.activeEmployeesCount}
              accent="success"
              to="/admin/employees?active=true"
            />
            <StatCard
              label="Employees on Leave Today"
              value={data.employeesOnLeaveToday}
              to="/admin/leave-requests"
            />
          </div>
        </>
      ) : null}

      <div style={bottomRowStyle}>
        <Card style={recentCardStyle}>
          <div style={cardHeaderRowStyle}>
            <div style={cardTitleStyle}>Recent Pending Entries</div>
            <Link to="/admin/work-entries?status=PENDING" style={viewAllStyle}>
              Review all pending →
            </Link>
          </div>

          {entriesError && <div style={entriesErrorStyle}>{entriesError}</div>}

          {entriesLoading ? (
            <div style={loadingStyle}>Loading…</div>
          ) : entries.length === 0 ? (
            <EmptyState message="No pending entries. All caught up!" />
          ) : (
            <div>
              {entries.map((entry, i) => (
                <div
                  key={entry.id}
                  style={{
                    ...entryRowStyle,
                    borderTop: i === 0 ? "none" : "1px solid var(--color-border)",
                  }}
                >
                  <div style={entryNameStyle}>{entry.employeeName}</div>
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
            <ActionCard
              to="/admin/work-entries"
              title="Review Work Entries"
              description="Check and approve pending submissions"
            />
            <ActionCard
              to="/admin/employees"
              title="Manage Employees"
              description="View and manage employee records"
            />
            <ActionCard
              to="/admin/leave-requests"
              title="Manage Leave Requests"
              description="Review and approve employee leave requests"
            />
            <ActionCard
              to="/admin/reports"
              title="Review Monthly Reports"
              description="Approve or reject submitted monthly reports"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

// StatCard

interface StatCardProps {
  label: string;
  value: number;
  accent?: "warning" | "success";
  to?: string;
}

function StatCard({ label, value, accent, to }: StatCardProps) {
  const accentColor = accent ? accentMap[accent] : "var(--color-admin-accent)";
  const [hovered, setHovered] = useState(false);

  const content = (
    <>
      <div style={{ ...accentBarStyle, background: accentColor }} />
      <div style={valueStyle}>{value}</div>
      <div style={labelStyle}>{label}</div>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        style={{ ...statCardStyle, ...linkCardBase, ...(hovered ? linkCardHovered : {}) }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {content}
      </Link>
    );
  }

  return <Card style={statCardStyle}>{content}</Card>;
}

// ActionCard

function ActionCard({ to, title, description }: {
  to: string;
  title: string;
  description: string;
}) {
  return (
    <Link to={to} className="btn-secondary-admin" style={actionCardOverride}>
      <div>{title}</div>
      <div style={actionDescStyle}>{description}</div>
    </Link>
  );
}

const accentMap: Record<string, string> = {
  warning: "var(--color-warning-text)",
  success: "var(--color-success-text)",
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
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "var(--space-4)",
  marginBottom: "var(--space-6)",
};

const statCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-2)",
};

const linkCardBase: CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-sm)",
  padding: "var(--space-6)",
  textDecoration: "none",
  cursor: "pointer",
  transition: "border-color 0.15s ease, background 0.15s ease",
};

const linkCardHovered: CSSProperties = {
  background: "var(--color-admin-tint)",
  borderColor: "var(--color-admin-border)",
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

const labelStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-muted)",
};

const bottomRowStyle: CSSProperties = {
  display: "flex",
  gap: "var(--space-4)",
  alignItems: "stretch",
};

const recentCardStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const actionsCardStyle: CSSProperties = {
  width: 260,
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
  color: "var(--color-admin-accent)",
  textDecoration: "none",
  fontWeight: 500,
};

const entryRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-4)",
  padding: "var(--space-3) 0",
};

const entryNameStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  fontWeight: 600,
  color: "var(--color-text)",
  whiteSpace: "nowrap",
  width: 130,
  flexShrink: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const entryDateStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-muted)",
  whiteSpace: "nowrap",
  width: 90,
  flexShrink: 0,
};

const entryHoursStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-muted)",
  whiteSpace: "nowrap",
  width: 50,
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

const actionCardOverride: CSSProperties = {
  display: "block",
  padding: "var(--space-4)",
  whiteSpace: "normal",
  textDecoration: "none",
  width: "100%",
};

const actionDescStyle: CSSProperties = {
  fontSize: "var(--font-size-xs)",
  fontWeight: 400,
  color: "var(--color-text-muted)",
  marginTop: 2,
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

const entriesErrorStyle: CSSProperties = {
  ...errorStyle,
  marginBottom: "var(--space-3)",
};

const loadingStyle: CSSProperties = {
  color: "var(--color-text-muted)",
  fontSize: "var(--font-size-sm)",
  marginBottom: "var(--space-4)",
};
