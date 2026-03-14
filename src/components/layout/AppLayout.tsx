import { Link, Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div>
      <header
        style={{
          padding: "16px",
          borderBottom: "1px solid #ddd",
          display: "flex",
          gap: "20px",
        }}
      >
        <strong>WMS</strong>

        <Link to="/employee/work-entries">Employee</Link>
        <Link to="/admin/work-entries">Admin</Link>
      </header>

      <main style={{ padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}