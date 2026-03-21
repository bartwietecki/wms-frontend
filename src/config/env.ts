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
  if (!value || typeof value !== "string" || value.trim() === "") return undefined;
  return value.trim();
}

export const config = {
  apiBaseUrl: requireEnv("VITE_API_BASE_URL"),
  // Optional fallback for employeeId — used when seeding the session at login.
  // In production this would come from the backend's login response.
  defaultEmployeeId: optionalEnv("VITE_EMPLOYEE_ID"),
} as const;
