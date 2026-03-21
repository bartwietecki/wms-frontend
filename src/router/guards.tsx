import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, hasRole } from "../auth/session";
import type { UserRole } from "../auth/session";

/** Redirects to /login if no active session. */
export function RequireAuth() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

/** Redirects to /login if session doesn't match the required role. */
export function RequireRole({ role }: { role: UserRole }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!hasRole(role)) {
    // Logged in but wrong role — send them to their own area
    const session = JSON.parse(sessionStorage.getItem("wms_session") ?? "{}");
    const redirect = session.role === "admin" ? "/admin/work-entries" : "/employee/work-entries";
    return <Navigate to={redirect} replace />;
  }
  return <Outlet />;
}
