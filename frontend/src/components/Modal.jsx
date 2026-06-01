export default function Modal({ open, onClose, children, className = "" }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="admin-modal-overlay fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[6px] flex items-center justify-center p-4 md:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
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
        {/* Nút đóng (X) */}
        <button
          onClick={onClose}
          className="
            absolute
            top-5
            right-5
            w-10
            h-10
            rounded-xl
            bg-white
            hover:bg-rose-100
            text-slate-500
            hover:text-rose-500
            transition-all
            flex
            items-center
            justify-center
            text-2xl
            font-bold
            z-[60]
            shadow-sm
          "        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}
