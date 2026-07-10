import { createContext, useContext, useState, useCallback } from "react";
import { login as loginApi } from "../api/auth";

const AuthContext = createContext(null);

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));

  const payload = token ? decodeJwtPayload(token) : null;
  const userId = payload ? Number(payload.sub) : null;

  const login = useCallback(async (email, password) => {
    const res = await loginApi(email, password);
    const { access_token, role: userRole } = res.data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("role", userRole);
    setToken(access_token);
    setRole(userRole);
    return userRole;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
  }, []);

  const value = {
    token,
    role,
    userId,
    isAuthenticated: Boolean(token),
    isAdmin: role === "admin",
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
