import { http } from "../http";
import type { CreateWorkEntryRequest, WorkEntry } from "./types";

export interface UpdateWorkEntryRequest {
  workDate: string;
  minutes: number;
  description: string;
}

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

export function updateMyWorkEntry(id: number, request: UpdateWorkEntryRequest) {
  return http<WorkEntry>(`/api/work-entries/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
    requireEmployeeId: true,
  });
}

export function deleteMyWorkEntry(id: number) {
  return http<void>(`/api/work-entries/${id}`, {
    method: "DELETE",
    requireEmployeeId: true,
  });
}

/** Maps backend error codes to user-friendly messages. */
export function resolveWorkEntryError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("WORK_ENTRY_ACCESS_DENIED"))
    return "You don't have permission to modify this entry.";
  if (msg.includes("WORK_ENTRY_NOT_FOUND"))
    return "This work entry no longer exists.";
  if (msg.includes("400"))
    return "Only pending entries can be edited or deleted.";
  return msg || "Something went wrong. Please try again.";
}
