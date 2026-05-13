import { useCallback, useEffect, useState } from "react";
import { readJSON, writeJSON, STORAGE_KEYS } from "../utils/storage";

/**
 * Quản lý theme dark/light cho phạm vi travel (scoped attribute).
 * Mặc định = dark (để đồng bộ mood với login).
 */
export function useTheme() {
    const [theme, setTheme] = useState(() => readJSON(STORAGE_KEYS.theme, "dark"));

    useEffect(() => {
        writeJSON(STORAGE_KEYS.theme, theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((current) => (current === "dark" ? "light" : "dark"));
    }, []);

    return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
}
