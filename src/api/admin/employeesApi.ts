import { http } from "../http";
import type { Employee, Page } from "./types";

export function getEmployees(page = 0, size = 20) {
  return http<Page<Employee>>("/api/admin/employees", {
    queryParams: { page: String(page), size: String(size) },
  });
}
