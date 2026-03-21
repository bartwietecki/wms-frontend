import type { CSSProperties } from "react";

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div style={wrapStyle}>
      <span style={iconStyle}>📭</span>
      <p style={textStyle}>{message}</p>
    </div>
  );
}

const wrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "var(--space-3)",
  padding: "var(--space-10) var(--space-6)",
  color: "var(--color-text-muted)",
};

const iconStyle: CSSProperties = {
  fontSize: 32,
};

const textStyle: CSSProperties = {
  fontSize: "var(--font-size-md)",
  color: "var(--color-text-muted)",
};
