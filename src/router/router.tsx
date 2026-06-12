import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireRole } from "./guards";
import EmployeeLayout from "../components/layout/EmployeeLayout";
import AdminLayout from "../components/layout/AdminLayout";
import LoginPage from "../pages/LoginPage";
import EmployeePage from "../pages/EmployeePage";
import EmployeeDashboardPage from "../pages/EmployeeDashboardPage";
import EmployeeProfilePage from "../pages/EmployeeProfilePage";
import EmployeeLeaveRequestsPage from "../pages/EmployeeLeaveRequestsPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminReviewPage from "../pages/AdminReviewPage";
import AdminLeaveRequestsPage from "../pages/AdminLeaveRequestsPage";
import AdminEmployeesPage from "../pages/AdminEmployeesPage";
import EmployeeReportsPage from "../pages/EmployeeReportsPage";
import AdminReportsPage from "../pages/AdminReportsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    // Employee area (requires employee role)
    element: <RequireRole role="employee" />,
    children: [
      {
        element: <EmployeeLayout />,
        children: [
          { path: "/employee/dashboard", element: <EmployeeDashboardPage /> },
          { path: "/employee/work-entries", element: <EmployeePage /> },
          { path: "/employee/leave-requests", element: <EmployeeLeaveRequestsPage /> },
          { path: "/employee/reports", element: <EmployeeReportsPage /> },
          { path: "/employee/profile", element: <EmployeeProfilePage /> },
        ],
      },
    ],
  },
  {
    // Admin area (requires admin role)
    element: <RequireRole role="admin" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin/dashboard", element: <AdminDashboardPage /> },
          { path: "/admin/work-entries", element: <AdminReviewPage /> },
          { path: "/admin/leave-requests", element: <AdminLeaveRequestsPage /> },
          { path: "/admin/employees", element: <AdminEmployeesPage /> },
          { path: "/admin/reports", element: <AdminReportsPage /> },
        ],
      },
    ],
  },
  {
    // Root redirect (send to login, guards will redirect to correct area if already logged in)
    path: "/",
    element: <Navigate to="/login" replace />,
  },
]);
