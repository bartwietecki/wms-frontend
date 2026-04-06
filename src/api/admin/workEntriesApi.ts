import { http } from "../http";
import type { WorkEntry } from "./types";
import type { Page } from "./types";

export interface UpdateWorkEntryRequest {
  workDate: string;
  minutes: number;
  description: string;
}

export interface WorkEntryFilters {
  status?: string;
  employeeId?: string;
  from?: string;
  to?: string;
}

export function getWorkEntries(filters: WorkEntryFilters = {}, page = 0, size = 20) {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.status) params.status = filters.status;
  if (filters.employeeId) params.employeeId = filters.employeeId;
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;

  return http<Page<WorkEntry>>("/api/admin/work-entries", { queryParams: params });
}

export function approveWorkEntry(id: number) {
  return http<WorkEntry>(`/api/admin/work-entries/${id}/approve`, {
    method: "POST",
  });
}

export function rejectWorkEntry(id: number) {
  return http<WorkEntry>(`/api/admin/work-entries/${id}/reject`, {
    method: "POST",
  });
}

export function updateWorkEntry(id: number, request: UpdateWorkEntryRequest) {
  return http<WorkEntry>(`/api/admin/work-entries/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export function deleteWorkEntry(id: number) {
  return http<void>(`/api/admin/work-entries/${id}`, {
    method: "DELETE",
  });
}
