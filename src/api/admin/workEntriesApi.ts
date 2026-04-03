import { http } from "../http";
import type { WorkEntry } from "./types";

export interface UpdateWorkEntryRequest {
  workDate: string;
  minutes: number;
  description: string;
}

export function getAllWorkEntries() {
  return http<WorkEntry[]>("/api/admin/work-entries");
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
