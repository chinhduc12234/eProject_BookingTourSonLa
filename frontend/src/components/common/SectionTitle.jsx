import { motion } from "framer-motion";

export default function SectionTitle({
    eyebrow,
    title,
    description,
    align = "left",
    action,
}) {
    const isCenter = align === "center";
    return (
        <div
            className={`flex flex-col gap-4 md:flex-row md:items-end ${
                isCenter ? "md:justify-center md:text-center" : "md:justify-between"
            }`}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`max-w-2xl ${isCenter ? "mx-auto" : ""}`}
            >
                {eyebrow && <p className="tv-section-title">{eyebrow}</p>}
                <h2 className="mt-2 text-3xl font-black leading-tight md:text-4xl" style={{ color: "var(--tv-text)" }}>
                    {title}
                </h2>
                {description && (
                    <p className="mt-3 text-base leading-7" style={{ color: "var(--tv-text-muted)" }}>
                        {description}
                    </p>
                )}
            </motion.div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
