import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const NAV_ITEMS = [
  { to: "/employee/dashboard", icon: "▦", label: "Dashboard" },
  { to: "/employee/work-entries", icon: "📋", label: "My Work Logs" },
  { to: "/employee/leave-requests", icon: "🗓️", label: "Leave Requests" },
  { to: "/employee/reports", icon: "📊", label: "Monthly Reports" },
  { to: "/employee/profile", icon: "👤", label: "Profile" },
] as const;

export default function EmployeeLayout() {
  const { username, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        {/* Brand */}
        <Link to="/employee/dashboard" className="sidebar-brand">
          <div className="sidebar-brand-mark">▦</div>
          <div>
            <div className="sidebar-brand-text">WMS</div>
            <div className="sidebar-brand-role">Employee Panel</div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Workspace</div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {username && (
            <div className="sidebar-user">{username}</div>
          )}
          <button className="sidebar-logout" onClick={logout}>
            <span className="sidebar-link-icon">↩</span>
            Sign out
          </button>
        </div>
      </aside>

      <main className="shell-content">
        <Outlet />
      </main>
    </div>
  );
}
