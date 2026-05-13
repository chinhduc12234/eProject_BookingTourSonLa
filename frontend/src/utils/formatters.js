/**
 * Định dạng tiền VND chuẩn cho UI.
 * @param {number|string} value
 * @returns {string}
 */
export function formatCurrency(value) {
    const num = typeof value === "number" ? value : Number(String(value).replace(/\D/g, ""));
    if (Number.isNaN(num) || num === 0) return "0₫";
    return new Intl.NumberFormat("vi-VN").format(num) + "₫";
}

/**
 * Định dạng tiền VND ngắn: 1.5tr, 990k.
 */
export function formatCurrencyShort(value) {
    const num = typeof value === "number" ? value : Number(String(value).replace(/\D/g, ""));
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}tr`;
    if (num >= 1_000) return `${Math.round(num / 1_000)}k`;
    return `${num}`;
}

/**
 * Định dạng ngày kiểu Việt Nam.
 */
export function formatDate(dateLike) {
    if (!dateLike) return "";
    const d = typeof dateLike === "string" ? new Date(`${dateLike}T00:00:00`) : new Date(dateLike);
    return new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(d);
}

export function formatDateShort(dateLike) {
    if (!dateLike) return "";
    const d = typeof dateLike === "string" ? new Date(`${dateLike}T00:00:00`) : new Date(dateLike);
    return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

/**
 * Tính số ngày còn lại tới một ngày khởi hành.
 */
export function daysFromNow(dateLike) {
    if (!dateLike) return 0;
    const d = typeof dateLike === "string" ? new Date(`${dateLike}T00:00:00`) : new Date(dateLike);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = d.getTime() - now.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function parsePriceNumber(price) {
    if (typeof price === "number") return price;
    return Number(String(price).replace(/\D/g, "")) || 0;
}

/**
 * Phát sinh mã booking dạng SLT-AB12CD34.
 */
export function generateBookingCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let suffix = "";
    for (let i = 0; i < 8; i += 1) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `SLT-${suffix}`;
}

/**
 * Slugify tiếng Việt cơ bản (đủ dùng cho mock).
 */
export function slugify(text) {
    return String(text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

export function truncate(text, length = 120) {
    if (!text || text.length <= length) return text;
    return `${text.slice(0, length).trim()}...`;
}
