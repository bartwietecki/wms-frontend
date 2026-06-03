export function parseApiError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;
  const sep = err.message.indexOf(" — ");
  if (sep !== -1) {
    try {
      const parsed = JSON.parse(err.message.slice(sep + 3));
      if (typeof parsed.message === "string" && parsed.message.trim()) {
        return parsed.message;
      }
    } catch {
      // body is not JSON, fall through
    }
  }
  return err.message;
}
