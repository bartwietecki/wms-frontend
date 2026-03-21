import type { CSSProperties, ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  /** "employee" | "admin" — adds a left accent bar */
  area?: "employee" | "admin";
}

const areaAccent: Record<string, string> = {
  employee: "var(--color-employee-accent)",
  admin: "var(--color-admin-accent)",
};

export default function PageHeader({ title, subtitle, action, area }: PageHeaderProps) {
  return (
    <div style={wrapStyle}>
      <div style={leftStyle}>
        {area && (
          <div style={{ ...accentBarStyle, background: areaAccent[area] }} />
        )}
        <div>
          <h1 style={titleStyle}>{title}</h1>
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        </div>
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
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

const leftStyle: CSSProperties = {
  display: "flex",
  alignItems: "stretch",
  gap: "var(--space-4)",
};

const accentBarStyle: CSSProperties = {
  width: 4,
  borderRadius: 4,
  flexShrink: 0,
  minHeight: 36,
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
