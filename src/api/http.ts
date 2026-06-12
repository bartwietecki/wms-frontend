import { config } from "../config/env";
import keycloak from "../auth/keycloak";

export interface HttpOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  /** Appended to the URL as ?key=value pairs */
  queryParams?: Record<string, string>;
}

export async function http<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const {
    method = "GET",
    headers: extraHeaders = {},
    body,
    queryParams,
  } = options;

  if (!keycloak.authenticated) {
    throw new Error("[http] Not authenticated. Please log in.");
  }

  try {
    await keycloak.updateToken(30);
  } catch {
    keycloak.login();
    throw new Error("[http] Session expired. Redirecting to login.");
  }

  const requestHeaders: Record<string, string> = {};
  requestHeaders["Authorization"] = `Bearer ${keycloak.token}`;

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  Object.assign(requestHeaders, extraHeaders);

  let url = `${config.apiBaseUrl}${path}`;
  if (queryParams && Object.keys(queryParams).length > 0) {
    url += "?" + new URLSearchParams(queryParams).toString();
  }

  let response: Response;
  try {
    response = await fetch(url, { method, headers: requestHeaders, body });
  } catch (err) {
    throw new Error(`[http] Network error for ${method} ${url}: ${String(err)}`);
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
