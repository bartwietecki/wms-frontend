import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import keycloak from "../auth/keycloak";

export default function LoginPage() {
  const { isAuthenticated, isLoading, roles } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      keycloak.login();
    }
  }, [isLoading, isAuthenticated]);

  if (isAuthenticated) {
    const to = roles.includes("admin") ? "/admin/work-entries" : "/employee/dashboard";
    return <Navigate to={to} replace />;
  }

  return null;
}
