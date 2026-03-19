import { config } from "../config/env";

// ─── Auth helpers ────────────────────────────────────────────────────────────

function buildBasicAuth(username: string, password: string): string {
    return `Basic ${btoa(`${username}:${password}`)}`;
}

type UserRole = "employee" | "admin";

function getAuthHeader(role: UserRole): string {
    if (role === "admin") {
        return buildBasicAuth(config.admin.username, config.admin.password);
    }
    return buildBasicAuth(config.employee.username, config.employee.password);
}

// ─── Request options ─────────────────────────────────────────────────────────

export interface HttpOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    role?: UserRole;
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
        role = "employee",
        requireEmployeeId = false,
        queryParams,
    } = options;

    // Fail fast: employee endpoints need a valid employeeId
    if (requireEmployeeId) {
        if (!config.employee.employeeId) {
            throw new Error(
                "[http] VITE_EMPLOYEE_ID is required for this endpoint but is not set. " +
                "Add it to your .env file."
            );
        }
    }

    // Build headers — only add a header when the value is valid
    const requestHeaders: Record<string, string> = {};

    requestHeaders["Authorization"] = getAuthHeader(role);

    if (requireEmployeeId && config.employee.employeeId) {
        requestHeaders["X-EMPLOYEE-ID"] = config.employee.employeeId;
    }

    if (body !== undefined) {
        requestHeaders["Content-Type"] = "application/json";
    }

    // Merge any caller-supplied headers last so they can override if needed
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
