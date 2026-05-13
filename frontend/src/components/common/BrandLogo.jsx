export const BRAND_NAME = "Tây Bắc Travel";
export const BRAND_TAGLINE = "Khám phá Tây Bắc";
export const BRAND_LOGO_SRC = "/logo-tay-bac-travel.png";

const sizeClass = {
    sm: "h-12 w-14",
    md: "h-14 w-16",
    lg: "h-20 w-24",
    xl: "h-36 w-44",
};

export default function BrandLogo({ size = "md", className = "", showText = true, dark = false }) {
    return (
        <span className={`inline-flex items-center gap-3 ${className}`}>
            <span
                className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1 shadow-sm ${sizeClass[size] || sizeClass.md}`}
            >
                <img
                    src={BRAND_LOGO_SRC}
                    alt={BRAND_NAME}
                    className="h-full w-full object-contain"
                    loading="eager"
                />
            </span>
            {showText && (
                <span className="flex flex-col leading-tight">
                    <span className={`font-black tracking-tight ${size === "sm" ? "text-base" : "text-lg"} ${dark ? "text-white" : ""}`} style={dark ? undefined : { color: "var(--tv-text)" }}>
                        {BRAND_NAME}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={dark ? { color: "#A67C52" } : { color: "var(--tv-accent)" }}>
                        {BRAND_TAGLINE}
                    </span>
                </span>
            )}
        </span>
    );
}
