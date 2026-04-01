import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../../auth/session";

const NAV_ITEMS = [
  { to: "/admin/work-entries", icon: "✅", label: "Work Entry Review" },
  { to: "/admin/employees",    icon: "👥", label: "Employees" },
] as const;

export default function AdminLayout() {
  const navigate = useNavigate();
  const session = getSession();

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">▦</div>
          <div>
            <div className="sidebar-brand-text">WMS</div>
            <div className="sidebar-brand-role">Admin Panel</div>
          </div>
        </div>

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
          {session && (
            <div className="sidebar-user">{session.username}</div>
          )}
          <button className="sidebar-logout" onClick={handleLogout}>
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
