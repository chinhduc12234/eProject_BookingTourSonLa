/**
 * Auto-discover ảnh từ src/assets/images/* (xem README ở thư mục đó).
 *
 * Cách dùng:
 *   - Tour:         pickTourImages(slug, fallbackArray)
 *   - Destination:  pickDestinationImage(id, fallbackUrl)
 *   - Blog:         pickBlogImage(slug, fallbackUrl)
 *   - Hero / site:  siteImage(key, fallbackUrl)
 *
 * Quy tắc:
 *   - Nếu user có thả ảnh vào thư mục tương ứng → dùng ảnh đó.
 *   - Nếu không → dùng fallback (thường là URL Unsplash đã set sẵn).
 *
 * Vite tự build hash filename cho mỗi ảnh khi production build.
 */

/* ---------------------------- TOUR IMAGES ---------------------------- */

const tourModules = import.meta.glob(
    "../assets/images/tours/**/*.{jpg,jpeg,png,webp,avif,gif}",
    { eager: true, query: "?url", import: "default" },
);

const tourImageMap = {};
Object.entries(tourModules).forEach(([path, url]) => {
    const match = path.match(/\/tours\/([^/]+)\/([^/]+)$/);
    if (!match) return;
    const slug = match[1];
    if (!tourImageMap[slug]) tourImageMap[slug] = [];
    tourImageMap[slug].push({ name: match[2], url });
});

Object.keys(tourImageMap).forEach((slug) => {
    tourImageMap[slug].sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
    tourImageMap[slug] = tourImageMap[slug].map((entry) => entry.url);
});

export function pickTourImages(slug, fallback = []) {
    const local = tourImageMap[slug];
    return local && local.length ? local : fallback;
}

export function hasLocalTourImages(slug) {
    return Boolean(tourImageMap[slug] && tourImageMap[slug].length);
}

/* ------------------------ DESTINATION IMAGES ------------------------ */

const destinationModules = import.meta.glob(
    "../assets/images/destinations/*.{jpg,jpeg,png,webp,avif,gif}",
    { eager: true, query: "?url", import: "default" },
);

const destinationImageMap = {};
Object.entries(destinationModules).forEach(([path, url]) => {
    const match = path.match(/\/destinations\/([^/]+)\.[^.]+$/);
    if (match) destinationImageMap[match[1]] = url;
});

export function pickDestinationImage(id, fallback = "") {
    return destinationImageMap[id] || fallback;
}

/* --------------------------- BLOG IMAGES ---------------------------- */

const blogModules = import.meta.glob(
    "../assets/images/blogs/*.{jpg,jpeg,png,webp,avif,gif}",
    { eager: true, query: "?url", import: "default" },
);

const blogImageMap = {};
Object.entries(blogModules).forEach(([path, url]) => {
    const match = path.match(/\/blogs\/([^/]+)\.[^.]+$/);
    if (match) blogImageMap[match[1]] = url;
});

export function pickBlogImage(slug, fallback = "") {
    return blogImageMap[slug] || fallback;
}

/* ---------------------------- HERO / SITE --------------------------- */

const heroModules = import.meta.glob(
    "../assets/images/hero/*.{jpg,jpeg,png,webp,avif,gif}",
    { eager: true, query: "?url", import: "default" },
);

const heroImageMap = {};
Object.entries(heroModules).forEach(([path, url]) => {
    const match = path.match(/\/hero\/([^/]+)\.[^.]+$/);
    if (match) heroImageMap[match[1]] = url;
});

export function siteImage(key, fallback = "") {
    return heroImageMap[key] || fallback;
}

/* --------------------------- AVATARS -------------------------------- */

const avatarModules = import.meta.glob(
    "../assets/images/avatars/*.{jpg,jpeg,png,webp,avif,gif}",
    { eager: true, query: "?url", import: "default" },
);

const avatarImageMap = {};
Object.entries(avatarModules).forEach(([path, url]) => {
    const match = path.match(/\/avatars\/([^/]+)\.[^.]+$/);
    if (match) avatarImageMap[match[1]] = url;
});

export function pickAvatar(key, fallback = "") {
    return avatarImageMap[key] || fallback;
}

/* --------------------------- DEBUG HELPER --------------------------- */

if (typeof window !== "undefined") {
    // Cho phép gõ `window.__sonlaImages` trong DevTools để kiểm tra ảnh đã đăng ký.
    window.__sonlaImages = {
        tours: tourImageMap,
        destinations: destinationImageMap,
        blogs: blogImageMap,
        hero: heroImageMap,
        avatars: avatarImageMap,
    };
}
