import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireRole } from "./guards";
import EmployeeLayout from "../components/layout/EmployeeLayout";
import AdminLayout from "../components/layout/AdminLayout";
import LoginPage from "../pages/LoginPage";
import EmployeePage from "../pages/EmployeePage";
import AdminReviewPage from "../pages/AdminReviewPage";
import AdminEmployeesPage from "../pages/AdminEmployeesPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    // Employee area — requires employee role
    element: <RequireRole role="employee" />,
    children: [
      {
        element: <EmployeeLayout />,
        children: [
          { path: "/employee/work-entries", element: <EmployeePage /> },
        ],
      },
    ],
  },
  {
    // Admin area — requires admin role
    element: <RequireRole role="admin" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin/work-entries", element: <AdminReviewPage /> },
          { path: "/admin/employees", element: <AdminEmployeesPage /> },
        ],
      },
    ],
  },
  {
    // Root redirect — send to login, guards will redirect to correct area if already logged in
    path: "/",
    element: <Navigate to="/login" replace />,
  },
]);
