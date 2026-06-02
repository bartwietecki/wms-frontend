import { http } from "../http";
import type { AdminDashboard } from "./types";

export function getAdminDashboard() {
  return http<AdminDashboard>("/api/admin/dashboard");
}
