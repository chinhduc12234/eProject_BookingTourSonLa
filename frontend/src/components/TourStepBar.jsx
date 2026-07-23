import { Check } from "lucide-react";

export default function TourStepBar({
  steps,
  current,
  setCurrent,
}) {

  return (
    <nav
      className="
        w-full
        mb-10
      "
      aria-label="Tiến trình chỉnh sửa tour"
    >

      <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
        <ol className="flex items-center justify-between gap-2">

          {steps.map((s, index) => {

            const done = index < current;
            const active = index === current;

            return (
              <li
                key={s.key}
                className="flex-1 flex items-center gap-2"
              >

                <button
                  type="button"
                  onClick={() => setCurrent(index)}
                  aria-current={active ? "step" : undefined}
                  aria-label={`${s.label}${done ? " — đã hoàn tất" : active ? " — bước hiện tại" : ""}`}
                  className="
                    flex
                    flex-col
                    items-center
                    flex-1
                    transition-all
                    duration-300
                  "
                >

                  <div
                    className={`
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      border-3
                      text-sm
                      font-black
                      transition-all
                      duration-300
                      mb-2
                      ${active
                        ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-300"
                        : done
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"}
                    `}
                  >
                    {done ? <Check size={19} strokeWidth={3} aria-hidden="true" /> : index + 1}
                  </div>

                  <span
                    className={`
                      text-center
                      text-xs
                      font-bold
                      leading-tight
                      transition-colors
                      duration-300
                      ${active ? "text-slate-900" : done ? "text-emerald-600" : "text-slate-400"}
                    `}
                  >
                    {s.label}
                  </span>

                </button>

                {index < steps.length - 1 && (
                  <div
                    className={`
                      hidden
                      sm:flex
                      flex-1
                      h-1
                      rounded-full
                      transition-all
                      duration-500
                      ${done ? "bg-emerald-500" : "bg-slate-200"}
                    `}
                    aria-hidden
                  />
                )}

              </li>
            );
          })}

        </ol>
      </div>

    </nav>
  );
}
