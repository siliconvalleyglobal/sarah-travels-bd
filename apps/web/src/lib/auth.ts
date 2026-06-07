"use client";

export type AppRole = "CUSTOMER" | "AGENT" | "SUB_AGENT" | "ADMIN" | "SUPER_ADMIN";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Read role from JWT payload (client-side routing only — API still enforces auth). */
export function getTokenRole(): AppRole | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as { role?: AppRole };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function redirectToLogin(redirectPath?: string) {
  const q = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : "";
  window.location.href = `/login${q}`;
}
