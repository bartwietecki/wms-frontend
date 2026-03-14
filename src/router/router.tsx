import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import EmployeePage from "../pages/EmployeePage";
import AdminReviewPage from "../pages/AdminReviewPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "employee/work-entries",
        element: <EmployeePage />,
      },
      {
        path: "admin/work-entries",
        element: <AdminReviewPage />,
      },
    ],
  },
]);