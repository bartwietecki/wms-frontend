import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export default function Card({ children, style, className }: CardProps) {
  return (
    <div style={{ ...cardStyle, ...style }} className={className}>
      {children}
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-sm)",
  padding: "var(--space-6)",
};
