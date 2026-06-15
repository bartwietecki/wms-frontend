import { createContext } from "react";

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string;
  displayName: string;
  roles: string[];
  token: string | undefined;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
