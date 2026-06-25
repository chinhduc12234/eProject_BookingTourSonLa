import { motion } from "framer-motion";
import { ArrowRight, Award, HeartHandshake, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "./PublicLayout";
import { companyStats, companyValues, scenicGallery, scenicImages, teamGroups } from "./publicContent";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: "easeOut", delay: i * 0.08 },
    }),
};

export default function AboutPage() {
    return (
        <PublicLayout>
            {/* HERO */}
            <section className="relative overflow-hidden">
                <motion.div
                    initial={{ scale: 1.12 }}
                    animate={{ scale: 1.03 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('${scenicImages.sonLaLandscape}')`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#020617]/85 to-[#020617]/40" />
                <div className="absolute inset-0 bg-grid-fade opacity-50" />
                <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-[#7FB77E]/25 blur-[120px] animate-float-slow" />
                <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-[#A67C52]/25 blur-[120px] animate-float-slow" />

                <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
                    <motion.div initial="hidden" animate="show" variants={fadeUp}>
                        <span className="section-tag">
                            <Sparkles size={12} /> Giới thiệu
                        </span>
                    </motion.div>
                    <motion.h1
                        custom={1}
                        initial="hidden"
                        animate="show"
                        variants={fadeUp}
                        className="mt-5 max-w-4xl text-5xl font-black leading-[1.05] text-white sm:text-6xl lg:text-7xl"
                    >
                        Đội ngũ làm tour cho những hành trình{" "}
                        <span className="text-gradient-mountain animate-gradient-pan">
                            Tây Bắc
                        </span>{" "}
                        có chiều sâu.
                    </motion.h1>
                    <motion.p
                        custom={2}
                        initial="hidden"
                        animate="show"
                        variants={fadeUp}
                        className="mt-6 max-w-3xl text-lg leading-8 text-slate-200"
                    >
                        Chúng tôi xây dựng nền tảng đặt tour dựa trên kinh nghiệm điều hành
                        thực địa, mạng lưới đối tác địa phương và cách tư vấn gần với nhu cầu
                        thật của khách hàng.
                    </motion.p>

                    <motion.div
                        custom={3}
                        initial="hidden"
                        animate="show"
                        variants={fadeUp}
                        className="mt-8 flex flex-wrap gap-3"
                    >
                        <Link to="/tours" className="btn-primary text-sm">
                            Xem tour mở bán
                            <ArrowRight size={16} />
                        </Link>
                        <Link to="/lien-he" className="btn-outline text-sm">
                            Liên hệ tư vấn
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* STATS */}
            <section className="relative bg-gradient-to-b from-[#f7faf6] via-[#eef6ed] to-[#f7faf6] py-20 text-slate-900">
                <div className="absolute inset-0 bg-dots-fade opacity-40" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                        className="text-center max-w-2xl mx-auto"
                    >
                        <span className="section-tag-light mx-auto">
                            <Award size={12} /> Con số dẫn dắt
                        </span>
                        <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                            Hành trình{" "}
                            <span className="text-gradient-green">Tây Bắc Travel</span>
                        </h2>
                    </motion.div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {companyStats.map((item, idx) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.55, delay: idx * 0.1 }}
                                whileHover={{ y: -6 }}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-[#7FB77E]/50 hover:shadow-soft-green"
                            >
                                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#7FB77E]/25 to-[#A67C52]/15 blur-xl transition-all duration-500 group-hover:scale-150" />
                                <div className="relative text-5xl font-black text-gradient-green">
                                    {item.value}
                                </div>
                                <p className="relative mt-4 text-sm font-bold uppercase tracking-wider text-slate-600">
                                    {item.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* IMAGE STORY */}
            <section className="relative overflow-hidden bg-[#020617] py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-4 md:grid-cols-4">
                        {scenicGallery.map((item, idx) => (
                            <motion.figure
                                key={item.title}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.07 }}
                                className={[
                                    "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]",
                                    idx === 0 ? "md:col-span-2" : "",
                                ].join(" ")}
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    loading="lazy"
                                    className="h-72 w-full object-cover transition-transform duration-[1300ms] group-hover:scale-110"
                                />
                                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#020617]/90 to-transparent p-5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4a878]">
                                        {item.eyebrow}
                                    </div>
                                    <div className="mt-1 text-lg font-black text-white">
                                        {item.title}
                                    </div>
                                </figcaption>
                            </motion.figure>
                        ))}
                    </div>
                </div>
            </section>

            {/* VALUES */}
            <section className="relative overflow-hidden bg-[#020617] py-20">
                <div className="absolute inset-0 bg-grid-fade opacity-40" />
                <div className="absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-[#7FB77E]/15 blur-[120px]" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55 }}
                        >
                            <span className="section-tag">
                                <HeartHandshake size={12} /> Công ty
                            </span>
                            <h2 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">
                                Làm du lịch{" "}
                                <span className="text-gradient-gold">có trách nhiệm</span>{" "}
                                với khách hàng và địa phương.
                            </h2>
                            <p className="mt-5 text-sm leading-8 text-slate-300">
                                Tây Bắc Travel tập trung vào các sản phẩm tour Sơn La và vùng Tây
                                Bắc: nghỉ dưỡng cao nguyên, săn mây, văn hóa bản làng, tour gia
                                đình và tour doanh nghiệp. Mỗi lịch trình đều được thiết kế để cân
                                bằng giữa trải nghiệm, an toàn và thời gian nghỉ ngơi.
                            </p>
                            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#d4a878]">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9de09c]" />
                                Mạng lưới đối tác địa phương
                            </div>
                        </motion.div>

                        <div className="grid gap-5 md:grid-cols-3">
                            {companyValues.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={item.title}
                                        initial={{ opacity: 0, y: 24 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                        whileHover={{ y: -6 }}
                                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6 transition-all hover:border-[#7FB77E]/40"
                                    >
                                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#A67C52]/30 via-[#7FB77E]/15 to-transparent blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                        <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#A67C52]/15 text-[#d4a878]">
                                            <Icon size={26} />
                                        </span>
                                        <h3 className="relative mt-5 text-lg font-black text-white">
                                            {item.title}
                                        </h3>
                                        <p className="relative mt-3 text-sm leading-6 text-slate-300">
                                            {item.desc}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* TEAM */}
            <section className="relative bg-gradient-to-b from-[#f7faf6] via-[#eef6ed] to-[#f7faf6] py-20 text-slate-900">
                <div className="absolute inset-0 bg-dots-fade opacity-40" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                        className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
                    >
                        <div>
                            <span className="section-tag-light">
                                <Users size={12} /> Nhân lực
                            </span>
                            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                                Các nhóm vận hành cốt lõi
                            </h2>
                        </div>
                        <p className="max-w-md text-sm leading-7 text-slate-600">
                            Đội ngũ phối hợp ba mảng: điều hành, tư vấn và hướng dẫn viên địa
                            phương để đảm bảo trải nghiệm xuyên suốt cho khách hàng.
                        </p>
                    </motion.div>

                    <div className="mt-10 grid gap-5 md:grid-cols-3">
                        {teamGroups.map((item, idx) => (
                            <motion.article
                                key={item.role}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.55, delay: idx * 0.1 }}
                                whileHover={{ y: -8 }}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:border-[#7FB77E]/60 hover:shadow-soft-green"
                            >
                                <span className="absolute right-5 top-5 text-xs font-black text-[#7FB77E]/30">
                                    0{idx + 1}
                                </span>
                                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#edf7ec] to-[#c8e6c5] text-[#4f8f4d]">
                                    <Users size={22} />
                                </span>
                                <h3 className="mt-5 text-xl font-black">{item.role}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-600">
                                    {item.desc}
                                </p>
                                <div className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#4f8f4d] transition-all group-hover:translate-x-1">
                                    Tìm hiểu thêm <ArrowRight size={14} />
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[#020617] py-20">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1f17] via-[#04120d] to-[#0b1f17] p-10 sm:p-14"
                    >
                        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#7FB77E]/30 blur-[100px]" />
                        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#A67C52]/30 blur-[100px]" />
                        <div className="relative grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                            <div>
                                <span className="section-tag">
                                    <Sparkles size={12} /> Hợp tác cùng chúng tôi
                                </span>
                                <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
                                    Bạn đang tìm đối tác tour Tây Bắc{" "}
                                    <span className="text-gradient-mountain animate-gradient-pan">
                                        đáng tin cậy?
                                    </span>
                                </h2>
                                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                                    Gửi nhu cầu - đội ngũ Tây Bắc Travel sẽ phản hồi với lịch trình
                                    mẫu, báo giá minh bạch và phương án dự phòng phù hợp.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-end">
                                <Link to="/lien-he" className="btn-primary w-full text-sm md:justify-center">
                                    Gửi yêu cầu tư vấn
                                    <ArrowRight size={16} />
                                </Link>
                                <Link to="/tours" className="btn-outline w-full text-sm md:justify-center">
                                    Xem lịch khởi hành
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </PublicLayout>
    );
}
