import { http } from "../http";
import type { CreateWorkEntryRequest, WorkEntry } from "./types";

export function getMyWorkEntries(from: string, to: string) {
  return http<WorkEntry[]>("/api/work-entries/my", {
    requireEmployeeId: true,
    queryParams: { from, to },
  });
}

export function createWorkEntry(request: CreateWorkEntryRequest) {
  return http<WorkEntry>("/api/work-entries", {
    method: "POST",
    body: JSON.stringify(request),
    requireEmployeeId: true,
  });
}
