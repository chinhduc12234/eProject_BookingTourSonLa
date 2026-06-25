import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, children, className = "" }) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="admin-modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-3 backdrop-blur-[8px] sm:p-5 md:p-6"
      role="presentation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className={`admin-modal-panel
          relative 
          w-full 
          bg-white 
          text-slate-900
          rounded-[32px] 
          border 
          border-slate-100 
          shadow-[0_20px_60px_rgba(0,0,0,0.15)] 
          p-6 
          md:p-8 
          transition-all 
          duration-300
          ${className ? className : "max-w-xl"}
        `}
      >
        <button
          type="button"
          onClick={onClose}
          className="admin-modal-close absolute right-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 sm:right-5 sm:top-5"
          aria-label="Đóng hộp thoại"
          title="Đóng"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {children}
      </div>
    </div>
  );
}
