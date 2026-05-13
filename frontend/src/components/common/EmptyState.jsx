import { SearchX } from "lucide-react";

export default function EmptyState({ icon: Icon = SearchX, title, description, action }) {
    return (
        <div
            className="flex flex-col items-center justify-center rounded-2xl border px-6 py-16 text-center"
            style={{ borderColor: "var(--tv-border)", background: "var(--tv-card-soft)" }}
        >
            <span
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: "var(--tv-bg-strong)", color: "var(--tv-primary-deep)" }}
            >
                <Icon size={28} />
            </span>
            <h3 className="mt-5 text-xl font-black" style={{ color: "var(--tv-text)" }}>{title}</h3>
            {description && (
                <p className="mt-2 max-w-md text-sm leading-6" style={{ color: "var(--tv-text-muted)" }}>
                    {description}
                </p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
