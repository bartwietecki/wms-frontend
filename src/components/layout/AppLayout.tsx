import { NavLink, Outlet, useLocation } from "react-router-dom";
import type { CSSProperties } from "react";

const AREAS = [
  {
    to: "/employee/work-entries",
    label: "Employee Panel",
    description: "Submit and track your work logs",
    accent: "var(--color-employee-accent)",
    tint: "var(--color-employee-tint)",
  },
  {
    to: "/admin/work-entries",
    label: "Admin Panel",
    description: "Review and manage work submissions",
    accent: "var(--color-admin-accent)",
    tint: "var(--color-admin-tint)",
  },
] as const;

export default function AppLayout() {
  const location = useLocation();
  const activeArea = AREAS.find((a) => location.pathname.startsWith(a.to.split("/").slice(0, 2).join("/")));

  return (
    <div style={shellStyle}>
      {/* Top navbar */}
      <header style={navbarStyle}>
        <div style={navbarInnerStyle}>
          <div style={brandStyle}>
            <span style={brandMarkStyle}>▦</span>
            <span style={brandTextStyle}>WMS</span>
          </div>

          <div style={dividerStyle} />

          <nav style={navStyle}>
            {AREAS.map((area) => (
              <NavLink
                key={area.to}
                to={area.to}
                style={({ isActive }) => ({
                  ...navLinkStyle,
                  ...(isActive ? { ...navLinkActiveStyle, background: `${area.accent}22`, color: "#fff" } : {}),
                })}
              >
                {area.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Area context bar */}
      {activeArea && (
        <div style={{ ...areaBarStyle, borderBottomColor: activeArea.accent }}>
          <div style={areaBarInnerStyle}>
            <span style={{ ...areaBarDotStyle, background: activeArea.accent }} />
            <span style={areaBarLabelStyle}>{activeArea.label}</span>
            <span style={areaBarSepStyle}>·</span>
            <span style={areaBarDescStyle}>{activeArea.description}</span>
          </div>
        </div>
      )}

      <main style={mainStyle}>
        <div style={contentStyle}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// Styles 

const shellStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const navbarStyle: CSSProperties = {
  height: "var(--navbar-height)",
  background: "var(--color-primary)",
  boxShadow: "0 1px 4px rgba(0,0,0,.15)",
  position: "sticky",
  top: 0,
  zIndex: 100,
};

const navbarInnerStyle: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 var(--space-6)",
  height: "100%",
  display: "flex",
  alignItems: "center",
  gap: "var(--space-5)",
};

const brandStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
  flexShrink: 0,
};

const brandMarkStyle: CSSProperties = {
  fontSize: 18,
  color: "#fff",
  opacity: 0.85,
};

const brandTextStyle: CSSProperties = {
  fontSize: "var(--font-size-lg)",
  fontWeight: 800,
  color: "#fff",
  letterSpacing: "-0.01em",
};

const dividerStyle: CSSProperties = {
  width: 1,
  height: 20,
  background: "rgba(255,255,255,0.25)",
  flexShrink: 0,
};

const navStyle: CSSProperties = {
  display: "flex",
  gap: "var(--space-1)",
};

const navLinkStyle: CSSProperties = {
  padding: "6px 14px",
  borderRadius: "var(--radius-sm)",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  color: "rgba(255,255,255,0.75)",
  transition: "background 0.15s, color 0.15s",
};

const navLinkActiveStyle: CSSProperties = {
  color: "#fff",
};

// Area context bar — thin strip below navbar showing current area
const areaBarStyle: CSSProperties = {
  background: "var(--color-surface)",
  borderBottom: "2px solid",
  borderBottomColor: "var(--color-primary)", // overridden inline
};

const areaBarInnerStyle: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "6px var(--space-6)",
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
};

const areaBarDotStyle: CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: "50%",
  flexShrink: 0,
};

const areaBarLabelStyle: CSSProperties = {
  fontSize: "var(--font-size-xs)",
  fontWeight: 700,
  color: "var(--color-text)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const areaBarSepStyle: CSSProperties = {
  color: "var(--color-text-subtle)",
  fontSize: "var(--font-size-xs)",
};

const areaBarDescStyle: CSSProperties = {
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-muted)",
};

const mainStyle: CSSProperties = {
  flex: 1,
  padding: "var(--space-8) var(--space-6)",
};

const contentStyle: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
};
