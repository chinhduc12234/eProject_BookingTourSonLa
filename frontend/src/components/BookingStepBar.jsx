import { CheckCircle2, Circle, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";

export default function BookingStepBar({ steps = [], current = 0 }) {
  return (
    <div className="booking-flow-panel rounded-2xl border border-white/10 bg-[#07120f]/88 p-3 shadow-soft-dark backdrop-blur-xl">
      <div className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
        {steps.map((step, index) => {
          const active = index === current;
          const done = index < current;
          const disabled = Boolean(step.disabled);
          const Icon = disabled ? LockKeyhole : done ? CheckCircle2 : Circle;

          const content = (
            <>
              <span
                className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                  active
                    ? "border-[#9de09c] bg-[#9de09c] text-[#020617]"
                    : done
                      ? "border-[#7FB77E]/70 bg-[#7FB77E]/20 text-[#9de09c]"
                      : disabled
                        ? "border-white/10 bg-white/[0.03] text-slate-500"
                        : "border-white/10 bg-white/[0.05] text-slate-300",
                ].join(" ")}
              >
                <Icon size={18} />
              </span>
              <span className="min-w-0">
                <span
                  className={[
                    "block text-xs font-black uppercase tracking-widest",
                    active ? "text-[#9de09c]" : "text-slate-400",
                  ].join(" ")}
                >
                  Bước {index + 1}
                </span>
                <span
                  className={[
                    "mt-0.5 block text-sm font-black leading-5",
                    disabled ? "text-slate-500" : "text-white",
                  ].join(" ")}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="mt-1 block text-xs leading-5 text-slate-400">
                    {step.description}
                  </span>
                )}
              </span>
            </>
          );

          const className = [
            "flex min-h-[5.25rem] w-full min-w-[240px] items-start gap-3 rounded-xl border p-3 text-left transition md:min-w-0",
            active
              ? "border-[#7FB77E]/60 bg-[#7FB77E]/14"
              : done
                ? "border-[#7FB77E]/30 bg-[#7FB77E]/8 hover:border-[#7FB77E]/50"
                : "border-white/10 bg-white/[0.025] hover:border-[#7FB77E]/35",
            disabled ? "cursor-not-allowed opacity-60 hover:border-white/10" : "",
          ].join(" ");

          if (disabled) {
            return (
              <div
                key={step.key || step.label}
                className={className}
                aria-current={active ? "step" : undefined}
              >
                {content}
              </div>
            );
          }

          if (step.href) {
            return (
              <Link
                key={step.key || step.label}
                to={step.href}
                className={className}
                aria-current={active ? "step" : undefined}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={step.key || step.label}
              type="button"
              onClick={step.onClick}
              className={className}
              aria-current={active ? "step" : undefined}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
