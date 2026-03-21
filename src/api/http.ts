import { config } from "../config/env";
import { getSession } from "../auth/session";

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function buildBasicAuth(username: string, password: string): string {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

// ─── Request options ──────────────────────────────────────────────────────────

export interface HttpOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  /** Pass true for employee endpoints that require X-EMPLOYEE-ID */
  requireEmployeeId?: boolean;
  /** Appended to the URL as ?key=value pairs */
  queryParams?: Record<string, string>;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

export async function http<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const {
    method = "GET",
    headers: extraHeaders = {},
    body,
    requireEmployeeId = false,
    queryParams,
  } = options;

  const session = getSession();
  if (!session) {
    throw new Error("[http] No active session. Please log in.");
  }

  // Fail fast: employee endpoints need a valid employeeId
  if (requireEmployeeId && !session.employeeId) {
    throw new Error(
      "[http] This endpoint requires an Employee ID. " +
      "Make sure VITE_EMPLOYEE_ID is set or provided at login."
    );
  }

  // Build headers — only add a header when the value is valid
  const requestHeaders: Record<string, string> = {};

  requestHeaders["Authorization"] = buildBasicAuth(session.username, session.password);

  if (requireEmployeeId && session.employeeId) {
    requestHeaders["X-EMPLOYEE-ID"] = session.employeeId;
  }

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  Object.assign(requestHeaders, extraHeaders);

  // Build URL
  let url = `${config.apiBaseUrl}${path}`;
  if (queryParams && Object.keys(queryParams).length > 0) {
    url += "?" + new URLSearchParams(queryParams).toString();
  }

  // Dev logging — never log the raw password
  if (import.meta.env.DEV) {
    console.debug("[http]", method, url, {
      headerKeys: Object.keys(requestHeaders),
      hasAuth: "Authorization" in requestHeaders,
      hasEmployeeId: "X-EMPLOYEE-ID" in requestHeaders,
    });
  }

  // Execute request
  let response: Response;
  try {
    response = await fetch(url, { method, headers: requestHeaders, body });
  } catch (err) {
    throw new Error(`[http] Network error for ${method} ${url}: ${String(err)}`);
  }

  if (import.meta.env.DEV) {
    console.debug("[http] response", response.status, method, url);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "(no body)");
    throw new Error(`[http] HTTP ${response.status} ${response.statusText} — ${text}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await response.text().catch(() => "(unreadable)");
    throw new Error(`[http] Expected JSON but got "${contentType}": ${text}`);
  }

  return response.json() as Promise<T>;
}
