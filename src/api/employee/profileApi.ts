import { http } from "../http";
import type { EmployeeProfile, UpdateProfileRequest } from "./types";

export function getProfile() {
  return http<EmployeeProfile>("/api/employee/profile");
}

export function updateProfile(request: UpdateProfileRequest) {
  return http<EmployeeProfile>("/api/employee/profile", {
    method: "PUT",
    body: JSON.stringify(request),
  });
}
