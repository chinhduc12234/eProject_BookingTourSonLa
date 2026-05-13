import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function Gallery({ images = [], title = "" }) {
    const [index, setIndex] = useState(0);
    const [open, setOpen] = useState(false);

    const safeImages = images.length ? images : [];

    if (!safeImages.length) return null;

    const next = () => setIndex((i) => (i + 1) % safeImages.length);
    const prev = () => setIndex((i) => (i - 1 + safeImages.length) % safeImages.length);

    return (
        <>
            <div className="grid gap-2 md:grid-cols-[1.7fr_1fr]">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="relative h-[280px] overflow-hidden rounded-2xl md:h-[420px] tv-image-hover"
                >
                    <img src={safeImages[0]} alt={title} className="h-full w-full object-cover" loading="lazy" />
                </button>
                <div className="grid grid-cols-2 gap-2 md:grid-rows-2">
                    {safeImages.slice(1, 5).map((src, i) => (
                        <button
                            key={`${src}-${i}`}
                            type="button"
                            onClick={() => {
                                setIndex(i + 1);
                                setOpen(true);
                            }}
                            className="relative h-32 overflow-hidden rounded-2xl md:h-auto tv-image-hover"
                        >
                            <img src={src} alt={`${title}-${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                            {i === 3 && safeImages.length > 5 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-bold text-white">
                                    +{safeImages.length - 5} ảnh
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur p-4"
                        onClick={() => setOpen(false)}
                    >
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpen(false);
                            }}
                            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
                        >
                            <X size={18} />
                        </button>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                prev();
                            }}
                            className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
                            aria-label="Ảnh trước"
                        >
                            <ChevronLeft size={22} />
                        </button>

                        <motion.img
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            src={safeImages[index]}
                            alt={title}
                            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                next();
                            }}
                            className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
                            aria-label="Ảnh tiếp theo"
                        >
                            <ChevronRight size={22} />
                        </button>

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-xs font-bold text-white">
                            {index + 1} / {safeImages.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
