import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const NAV_ITEMS = [
  { to: "/admin/dashboard", icon: "▦", label: "Dashboard" },
  { to: "/admin/work-entries", icon: "✅", label: "Work Entry Review" },
  { to: "/admin/leave-requests", icon: "🗓️", label: "Leave Requests" },
  { to: "/admin/reports", icon: "📊", label: "Monthly Reports" },
  { to: "/admin/employees", icon: "👥", label: "Employees" },
] as const;

export default function AdminLayout() {
  const { displayName, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        {/* Brand */}
        <Link to="/admin/dashboard" className="sidebar-brand">
          <div className="sidebar-brand-mark">⚙️</div>
          <div>
            <div className="sidebar-brand-text">WMS</div>
            <div className="sidebar-brand-role">Admin Panel</div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Management</div>
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
          {displayName && (
            <div className="sidebar-user">{displayName}</div>
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
