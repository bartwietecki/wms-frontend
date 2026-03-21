import { http } from "../http";
import type { WorkEntry } from "./types";

export function getAllWorkEntries() {
  return http<WorkEntry[]>("/api/admin/work-entries", {
    role: "admin",
  });
}

export function approveWorkEntry(id: number) {
  return http<WorkEntry>(`/api/admin/work-entries/${id}/approve`, {
    method: "POST",
    role: "admin",
  });
}

export function rejectWorkEntry(id: number) {
  return http<WorkEntry>(`/api/admin/work-entries/${id}/reject`, {
    method: "POST",
    role: "admin",
  });
}
