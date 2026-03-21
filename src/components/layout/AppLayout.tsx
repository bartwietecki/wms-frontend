import { NavLink, Outlet } from "react-router-dom";
import type { CSSProperties } from "react";

export default function AppLayout() {
  return (
    <div style={shellStyle}>
      <header style={navbarStyle}>
        <div style={navbarInnerStyle}>
          {/* Brand */}
          <div style={brandStyle}>
            <span style={brandIconStyle}>▦</span>
            <span style={brandTextStyle}>WMS</span>
          </div>

          {/* Nav links */}
          <nav style={navStyle}>
            <AppNavLink to="/employee/work-entries" label="Employee Panel" />
            <AppNavLink to="/admin/work-entries" label="Admin Panel" />
          </nav>
        </div>
      </header>

      <main style={mainStyle}>
        <div style={contentStyle}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function AppNavLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...navLinkStyle,
        ...(isActive ? navLinkActiveStyle : {}),
      })}
    >
      {label}
    </NavLink>
  );
}

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
  gap: "var(--space-8)",
};

const brandStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
  marginRight: "var(--space-4)",
};

const brandIconStyle: CSSProperties = {
  fontSize: 20,
  color: "#fff",
  opacity: 0.9,
};

const brandTextStyle: CSSProperties = {
  fontSize: "var(--font-size-lg)",
  fontWeight: 800,
  color: "#fff",
  letterSpacing: "-0.01em",
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
  color: "rgba(255,255,255,0.8)",
  transition: "background 0.15s, color 0.15s",
};

const navLinkActiveStyle: CSSProperties = {
  background: "rgba(255,255,255,0.18)",
  color: "#fff",
};

const mainStyle: CSSProperties = {
  flex: 1,
  padding: "var(--space-8) var(--space-6)",
};

const contentStyle: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
};
