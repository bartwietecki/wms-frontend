import { http } from "../http";
import type { LeaveRequest, CreateLeaveRequestRequest } from "./types";

export function getMyLeaveRequests() {
  return http<LeaveRequest[]>("/api/leave-requests/my");
}

export function createLeaveRequest(request: CreateLeaveRequestRequest) {
  return http<LeaveRequest>("/api/leave-requests", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
