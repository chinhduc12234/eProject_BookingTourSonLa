import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumb({ items = [] }) {
    return (
        <nav className="flex flex-wrap items-center gap-2 text-xs font-bold" aria-label="Breadcrumb">
            <Link to="/" className="inline-flex items-center gap-1 hover:opacity-80" style={{ color: "var(--tv-text-muted)" }}>
                <Home size={13} />
                Trang chủ
            </Link>
            {items.map((item, idx) => (
                <span key={`${item.label}-${idx}`} className="inline-flex items-center gap-2">
                    <ChevronRight size={12} style={{ color: "var(--tv-text-soft)" }} />
                    {item.to ? (
                        <Link to={item.to} className="hover:opacity-80" style={{ color: "var(--tv-text-muted)" }}>
                            {item.label}
                        </Link>
                    ) : (
                        <span style={{ color: "var(--tv-primary-deep)" }}>{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
