/**
 * LocalStorage wrapper an toàn — không phá kể cả khi user disable storage.
 */

export function readJSON(key, fallback = null) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

export function writeJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* ignore */
    }
}

export function removeKey(key) {
    try {
        localStorage.removeItem(key);
    } catch {
        /* ignore */
    }
}

export const STORAGE_KEYS = {
    theme: "sonla.theme",
    favorites: "sonla.favorites",
    bookings: "sonla.bookings",
    recentSearch: "sonla.recentSearch",
    profile: "sonla.profile",
    notifications: "sonla.notifications",
};
