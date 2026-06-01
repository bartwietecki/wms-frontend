import { http } from "../http";
import type { EmployeeDashboard } from "./types";

export function getDashboard() {
  return http<EmployeeDashboard>("/api/employee/dashboard");
}
