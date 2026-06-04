import { config } from "../config/env";
import keycloak from "../auth/keycloak";

export async function downloadPdf(path: string, fallbackFilename: string): Promise<void> {
  if (!keycloak.authenticated) {
    throw new Error("Not authenticated. Please log in.");
  }
  try {
    await keycloak.updateToken(30);
  } catch {
    keycloak.login();
    throw new Error("Session expired. Redirecting to login.");
  }

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    headers: { Authorization: `Bearer ${keycloak.token}` },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "(no body)");
    let message = `Download failed (HTTP ${response.status})`;
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed.message === "string" && parsed.message.trim()) {
        message = parsed.message;
      }
    } catch { /* body is not JSON */ }
    throw new Error(message);
  }

  const disposition = response.headers.get("content-disposition") ?? "";
  let filename = fallbackFilename;
  const match = disposition.match(/filename[^;=\n]*=(["']?)([^"';\n]*)\1/);
  if (match?.[2]?.trim()) {
    filename = match[2].trim();
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
