import { useCallback, useEffect, useState } from "react";
import { readJSON, writeJSON, STORAGE_KEYS } from "../utils/storage";

export function useFavorites() {
    const [favorites, setFavorites] = useState(() => readJSON(STORAGE_KEYS.favorites, []));

    useEffect(() => {
        writeJSON(STORAGE_KEYS.favorites, favorites);
    }, [favorites]);

    const isFavorite = useCallback((slug) => favorites.includes(slug), [favorites]);

    const toggleFavorite = useCallback((slug) => {
        setFavorites((current) =>
            current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug],
        );
    }, []);

    const clearFavorites = useCallback(() => setFavorites([]), []);

    return { favorites, isFavorite, toggleFavorite, clearFavorites };
}
