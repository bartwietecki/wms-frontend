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

export const config = {
  apiBaseUrl: requireEnv("VITE_API_BASE_URL"),
} as const;
