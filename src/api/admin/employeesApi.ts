import { http } from "../http";
import type { Employee, Page } from "./types";

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  employmentType: string;
  active: boolean;
}

// Update uses the same fields as create
export type UpdateEmployeeRequest = CreateEmployeeRequest;

export function getEmployees(page = 0, size = 20) {
  return http<Page<Employee>>("/api/admin/employees", {
    queryParams: { page: String(page), size: String(size) },
  });
}

export function createEmployee(request: CreateEmployeeRequest) {
  return http<Employee>("/api/admin/employees", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateEmployee(id: number, request: UpdateEmployeeRequest) {
  return http<Employee>(`/api/admin/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}
