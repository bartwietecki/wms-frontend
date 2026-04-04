import type { CSSProperties } from "react";
import type { Employee } from "../../api/admin/types";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
  totalElements: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export default function EmployeeTable({
  employees,
  loading,
  totalElements,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  return (
    <Card>
      <div style={cardHeaderStyle}>
        <div>
          <h2 style={cardTitleStyle}>Employees</h2>
          <p style={cardSubtitleStyle}>
            {loading ? "Loading…" : `${totalElements} employee${totalElements !== 1 ? "s" : ""} total`}
          </p>
        </div>
      </div>

      {loading && <p style={mutedTextStyle}>Loading employees…</p>}

      {!loading && employees.length === 0 && (
        <EmptyState message="No employees found." />
      )}

      {!loading && employees.length > 0 && (
        <>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadRowStyle}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Position</th>
                  <th style={thStyle}>Employment Type</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="table-row-hover">
                    <td style={tdStyle}>
                      <span style={nameStyle}>{emp.firstName} {emp.lastName}</span>
                    </td>
                    <td style={{ ...tdStyle, color: "var(--color-text-muted)" }}>{emp.email}</td>
                    <td style={tdStyle}>{emp.position}</td>
                    <td style={tdStyle}>{emp.employmentType}</td>
                    <td style={tdStyle}>
                      <span style={emp.active ? activeBadgeStyle : inactiveBadgeStyle}>
                        {emp.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div style={actionRowStyle}>
                        <button className="btn-edit" onClick={() => onEdit(emp)}>
                          ✎ Edit
                        </button>
                        <button className="btn-danger" onClick={() => onDelete(emp)}>
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={paginationStyle}>
              <button
                className="btn-secondary"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 0}
              >
                ← Previous
              </button>
              <span style={pageInfoStyle}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="btn-secondary"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages - 1}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

const cardHeaderStyle: CSSProperties = {
  marginBottom: "var(--space-5)",
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

const nameStyle: CSSProperties = {
  fontWeight: 500,
  color: "var(--color-text)",
};

const badgeBase: CSSProperties = {
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: 999,
  fontSize: "var(--font-size-xs)",
  fontWeight: 600,
  letterSpacing: "0.02em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const activeBadgeStyle: CSSProperties = {
  ...badgeBase,
  background: "var(--color-success-bg)",
  color: "var(--color-success-text)",
  border: "1px solid var(--color-success-border)",
};

const inactiveBadgeStyle: CSSProperties = {
  ...badgeBase,
  background: "var(--color-bg)",
  color: "var(--color-text-muted)",
  border: "1px solid var(--color-border)",
};

const paginationStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "var(--space-3)",
  marginTop: "var(--space-5)",
  paddingTop: "var(--space-4)",
  borderTop: "1px solid var(--color-border)",
};

const pageInfoStyle: CSSProperties = {
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-muted)",
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: "var(--space-2)",
  justifyContent: "flex-end",
};
