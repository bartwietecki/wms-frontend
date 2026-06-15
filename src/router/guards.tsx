import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import keycloak from "../auth/keycloak";

type UserRole = "employee" | "admin";

export function RequireRole({ role }: { role: UserRole }) {
  const { isAuthenticated, isLoading, roles } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      keycloak.login();
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated) return null;

  if (!roles.includes(role)) {
    const redirect = roles.includes("admin") ? "/admin/dashboard" : "/employee/dashboard";
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}
