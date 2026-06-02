import { http } from "../http";
import type { LeaveRequest, Page } from "./types";

export interface LeaveRequestFilters {
  status?: string;
  employeeId?: string;
  from?: string;
  to?: string;
}

export function getLeaveRequests(filters: LeaveRequestFilters = {}, page = 0, size = 20) {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.status) params.status = filters.status;
  if (filters.employeeId) params.employeeId = filters.employeeId;
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;

  return http<Page<LeaveRequest>>("/api/admin/leave-requests", { queryParams: params });
}

export function approveLeaveRequest(id: number) {
  return http<LeaveRequest>(`/api/admin/leave-requests/${id}/approve`, { method: "POST" });
}

export function rejectLeaveRequest(id: number) {
  return http<LeaveRequest>(`/api/admin/leave-requests/${id}/reject`, { method: "POST" });
}
