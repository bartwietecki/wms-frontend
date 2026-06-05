import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import keycloak from "./keycloak";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string;
  displayName: string;
  roles: string[];
  token: string | undefined;
  login: () => void;
  logout: () => void;
}

function formatDisplayName(raw: string): string {
  return raw
    .split(/[._-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    keycloak
      .init({
        onLoad: "check-sso",
        checkLoginIframe: false,
        pkceMethod: "S256",
      })
      .then((authenticated) => {
        setIsAuthenticated(authenticated);
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsLoading(false);
      });

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => keycloak.login());
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        username: keycloak.tokenParsed?.preferred_username ?? "",
        displayName: (() => {
          const tp = keycloak.tokenParsed;
          const given = tp?.given_name as string | undefined;
          const family = tp?.family_name as string | undefined;
          const preferred = tp?.preferred_username ?? "";
          return given && family ? `${given} ${family}` : formatDisplayName(preferred);
        })(),
        roles: (keycloak.realmAccess?.roles ?? []).map((r) => r.toLowerCase()),
        token: keycloak.token,
        login: () => keycloak.login(),
        logout: () => keycloak.logout(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
