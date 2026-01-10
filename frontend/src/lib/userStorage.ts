// Simple helper to namespace localStorage data per logged-in user

type JSONValue = any;

const getCurrentUserId = (): string | null => {
  try {
    const explicitId = localStorage.getItem("user_id");
    if (explicitId) return explicitId;
    const userData = localStorage.getItem("user_data");
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed?.id) return String(parsed.id);
      if (parsed?.email) return String(parsed.email); // fallback to email if id missing
    }
  } catch {
    // ignore
  }
  return null;
};

const keyFor = (baseKey: string): string => {
  const uid = getCurrentUserId();
  return uid ? `${baseKey}:${uid}` : baseKey;
};

export const userStorage = {
  getItem(baseKey: string): string | null {
    return localStorage.getItem(keyFor(baseKey));
  },
  setItem(baseKey: string, value: string): void {
    localStorage.setItem(keyFor(baseKey), value);
  },
  removeItem(baseKey: string): void {
    localStorage.removeItem(keyFor(baseKey));
  },
  getJSON<T = JSONValue>(baseKey: string, fallback: T | null = null): T | null {
    const raw = this.getItem(baseKey);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  setJSON(baseKey: string, value: JSONValue): void {
    this.setItem(baseKey, JSON.stringify(value));
  },
  // Clean up legacy, non-namespaced keys to avoid cross-user leakage
  removeLegacyGlobals(): void {
    [
      "health_records",
      "prescribed_medicines",
      "prescribed_tests",
      "doctor_profile",
    ].forEach((k) => {
      try { localStorage.removeItem(k); } catch { /* noop */ }
    });
  },
  // Clear ALL cached data for the current user
  clearAllUserData(): void {
    const uid = getCurrentUserId();
    if (!uid) return;
    
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.endsWith(`:${uid}`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  },
};
