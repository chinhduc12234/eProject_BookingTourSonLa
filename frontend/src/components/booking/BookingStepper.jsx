import { CheckCircle2 } from "lucide-react";

export default function BookingStepper({ steps, current }) {
    return (
        <ol className="grid gap-3 sm:grid-cols-5 sm:gap-0">
            {steps.map((step, idx) => {
                const isDone = idx < current;
                const isCurrent = idx === current;
                return (
                    <li key={step.label} className="flex items-center gap-3 sm:flex-col sm:items-start">
                        <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-0">
                            <div
                                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black"
                                style={{
                                    background: isDone
                                        ? "var(--tv-primary)"
                                        : isCurrent
                                        ? "var(--tv-gradient-primary)"
                                        : "var(--tv-bg-subtle)",
                                    color: isDone || isCurrent ? "#06281c" : "var(--tv-text-muted)",
                                    border: isCurrent ? "2px solid var(--tv-primary-deep)" : "none",
                                }}
                            >
                                {isDone ? <CheckCircle2 size={14} /> : idx + 1}
                            </div>
                        </div>
                        <div className="sm:mt-2">
                            <div
                                className="text-xs font-black uppercase tracking-widest"
                                style={{
                                    color: isCurrent
                                        ? "var(--tv-primary-deep)"
                                        : isDone
                                        ? "var(--tv-text)"
                                        : "var(--tv-text-soft)",
                                }}
                            >
                                Bước {idx + 1}
                            </div>
                            <div className="text-sm font-bold" style={{ color: "var(--tv-text)" }}>{step.label}</div>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
