function requireEnv(key: string): string {
  const value = import.meta.env[key];
  if (value === undefined || value === null || typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `[config] Missing required environment variable: ${key}. ` +
      `Check your .env file and make sure it uses VITE_ prefix.`
    );
  }
  return value.trim();
}

export const config = {
  // Empty string is valid - nginx proxies /api/ internally, so no absolute base URL is needed.
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? "").trim(),
  keycloakUrl: requireEnv("VITE_KEYCLOAK_URL"),
  keycloakRealm: requireEnv("VITE_KEYCLOAK_REALM"),
  keycloakClientId: requireEnv("VITE_KEYCLOAK_CLIENT_ID"),
} as const;
