import { config } from "../config/env";
import type { UserRole } from "./session";

/**
 * Verifies credentials against the backend by hitting a protected endpoint.
 * Returns the detected role on success, throws on failure.
 *
 * Strategy:
 *  1. Try admin endpoint first — if 200, role is "admin"
 *  2. Try employee endpoint — if 200, role is "employee"
 *  3. If both fail with 401/403, credentials are invalid
 */
export async function verifyCredentials(
  username: string,
  password: string,
  employeeId?: string
): Promise<UserRole> {
  const authHeader = `Basic ${btoa(`${username}:${password}`)}`;

  // Try admin
  try {
    const res = await fetch(`${config.apiBaseUrl}/api/admin/work-entries`, {
      method: "GET",
      headers: { Authorization: authHeader },
    });
    if (res.ok || res.status === 204) return "admin";
    if (res.status !== 401 && res.status !== 403) {
      // Unexpected error — still treat as admin if credentials were accepted
      // (e.g. empty list returns 200)
    }
  } catch {
    // network error — fall through
  }

  // Try employee
  const employeeHeaders: Record<string, string> = { Authorization: authHeader };
  if (employeeId) employeeHeaders["X-EMPLOYEE-ID"] = employeeId;

  try {
    const res = await fetch(`${config.apiBaseUrl}/api/work-entries/my?from=2000-01-01&to=2000-01-01`, {
      method: "GET",
      headers: employeeHeaders,
    });
    if (res.ok || res.status === 204) return "employee";
  } catch {
    // network error — fall through
  }

  throw new Error("Invalid username or password.");
}
