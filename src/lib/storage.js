import { CLIENTS_STORAGE_KEY, API_KEY_STORAGE_KEY, THEME_STORAGE_KEY } from "./constants";
import { seedClients } from "./seedData";

// This is a local-only personal tool, so plain localStorage is enough —
// everything here lives in your browser and nowhere else.

export function loadClients() {
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch (e) {
    console.error("Failed to load clients from localStorage", e);
  }
  const seeded = seedClients();
  saveClients(seeded);
  return seeded;
}

export function saveClients(clients) {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
    return true;
  } catch (e) {
    console.error("Failed to save clients to localStorage", e);
    return false;
  }
}

export function loadApiKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function saveApiKey(key) {
  try {
    if (key) localStorage.setItem(API_KEY_STORAGE_KEY, key);
    else localStorage.removeItem(API_KEY_STORAGE_KEY);
    return true;
  } catch (e) {
    console.error("Failed to save API key to localStorage", e);
    return false;
  }
}

export function loadTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || "light";
  } catch {
    return "light";
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.error("Failed to save theme to localStorage", e);
  }
}
