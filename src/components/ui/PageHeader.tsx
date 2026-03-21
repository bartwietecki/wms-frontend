import type { CSSProperties, ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div style={wrapStyle}>
      <div>
        <h1 style={titleStyle}>{title}</h1>
        {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

const wrapStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "var(--space-4)",
  marginBottom: "var(--space-6)",
};

const titleStyle: CSSProperties = {
  fontSize: "var(--font-size-xl)",
  fontWeight: 700,
  color: "var(--color-text)",
};

const subtitleStyle: CSSProperties = {
  marginTop: "var(--space-1)",
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-muted)",
};
