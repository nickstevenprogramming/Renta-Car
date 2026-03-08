export function normalizeAdminFlag(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "1" || v === "true";
  }
  return false;
}

export function normalizeUser(user) {
  if (!user || typeof user !== "object") return null;
  const adminValue = user.esAdmin ?? user.es_admin ?? user.Es_Admin;
  return { ...user, esAdmin: normalizeAdminFlag(adminValue) };
}

export function saveUserSession(user, token) {
  const normalized = normalizeUser(user);
  if (token) localStorage.setItem("authToken", token);
  if (normalized) localStorage.setItem("usuario", JSON.stringify(normalized));
  return normalized;
}

export function clearUserSession() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("usuario");
}

export function getStoredUser() {
  const token = localStorage.getItem("authToken");
  const raw = localStorage.getItem("usuario");

  if (!token || !raw) return null;

  try {
    return normalizeUser(JSON.parse(raw));
  } catch {
    clearUserSession();
    return null;
  }
}

export function isAdminUser(user) {
  return !!user && normalizeAdminFlag(user.esAdmin);
}
