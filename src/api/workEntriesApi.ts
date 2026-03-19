import { http } from "./http";
import type { CreateWorkEntryRequest, WorkEntry } from "./types";

export function getMyWorkEntries(from: string, to: string) {
  return http<WorkEntry[]>("/api/work-entries/my", {
    role: "employee",
    requireEmployeeId: true,
    queryParams: { from, to },
  });
}

export function createWorkEntry(request: CreateWorkEntryRequest) {
  return http<WorkEntry>("/api/work-entries", {
    method: "POST",
    body: JSON.stringify(request),
    role: "employee",
    requireEmployeeId: true,
  });
}
