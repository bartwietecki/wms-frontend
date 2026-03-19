/**
 * Reads all VITE_* env vars and validates them at startup.
 * Throws early with a clear message rather than sending garbage headers.
 */

function requireEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value || typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `[config] Missing required environment variable: ${key}. ` +
      `Check your .env file and make sure it uses VITE_ prefix.`
    );
  }
  return value.trim();
}

function optionalEnv(key: string): string | undefined {
  const value = import.meta.env[key];
  if (!value || typeof value !== "string" || value.trim() === "") {
    return undefined;
  }
  return value.trim();
}

export const config = {
  apiBaseUrl: requireEnv("VITE_API_BASE_URL"),
  employee: {
    username: requireEnv("VITE_EMPLOYEE_USERNAME"),
    password: requireEnv("VITE_EMPLOYEE_PASSWORD"),
    employeeId: optionalEnv("VITE_EMPLOYEE_ID"),
  },
  admin: {
    username: requireEnv("VITE_ADMIN_USERNAME"),
    password: requireEnv("VITE_ADMIN_PASSWORD"),
  },
} as const;
