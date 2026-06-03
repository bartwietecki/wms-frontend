import type { CSSProperties } from "react";

export type AppStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";

interface StatusBadgeProps {
  status: AppStatus;
}

const styles: Record<AppStatus, CSSProperties> = {
  PENDING: {
    background: "var(--color-warning-bg)",
    color: "var(--color-warning-text)",
    border: "1px solid var(--color-warning-border)",
  },
  SUBMITTED: {
    background: "var(--color-warning-bg)",
    color: "var(--color-warning-text)",
    border: "1px solid var(--color-warning-border)",
  },
  APPROVED: {
    background: "var(--color-success-bg)",
    color: "var(--color-success-text)",
    border: "1px solid var(--color-success-border)",
  },
  REJECTED: {
    background: "var(--color-danger-bg)",
    color: "var(--color-danger-text)",
    border: "1px solid var(--color-danger-border)",
  },
};

const labels: Record<AppStatus, string> = {
  PENDING: "Pending",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span style={{ ...badgeBase, ...styles[status] }}>
      {labels[status]}
    </span>
  );
}

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
