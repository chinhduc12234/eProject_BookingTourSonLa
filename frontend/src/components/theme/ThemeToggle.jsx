import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ isDark, onToggle, compact = false }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            className={`relative inline-flex items-center justify-center rounded-full border transition-colors ${
                compact ? "h-10 w-10" : "h-11 w-11"
            }`}
            style={{
                borderColor: "var(--tv-border-strong)",
                background: "var(--tv-card-soft)",
                color: "var(--tv-text)",
            }}
        >
            <motion.span
                key={isDark ? "moon" : "sun"}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="inline-flex"
            >
                {isDark ? <Moon size={18} /> : <Sun size={18} />}
            </motion.span>
        </button>
    );
}
