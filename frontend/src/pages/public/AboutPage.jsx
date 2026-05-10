import { motion } from "framer-motion";
import PublicLayout from "./PublicLayout";
import { companyStats, companyValues, teamGroups } from "./publicContent";

export default function AboutPage() {
    return (
        <PublicLayout>
            <section className="relative overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "url('https://media-dwrm.mae.gov.vn/Image/6509b7f5-3d98-ec62-450e-890bfc931115/2025/7/11/muong-la-son-la_ab4356465f.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
                <div className="absolute inset-0 bg-[#020617]/75" />
                <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <p className="text-sm font-black uppercase text-[#7FB77E]">Giới thiệu</p>
                        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight text-white sm:text-6xl">
                            Đội ngũ làm tour cho những hành trình Tây Bắc có chiều sâu.
                        </h1>
                        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
                            Chúng tôi xây dựng nền tảng booking tour dựa trên kinh nghiệm điều hành thực địa, mạng lưới
                            đối tác địa phương và cách tư vấn gần với nhu cầu thật của khách hàng.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="bg-[#f7faf6] py-16 text-slate-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-6 md:grid-cols-3">
                        {companyStats.map((item) => (
                            <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="text-4xl font-black text-[#4f8f4d]">{item.value}</div>
                                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#020617] py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                        <div>
                            <p className="text-sm font-black uppercase text-[#7FB77E]">Công ty</p>
                            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                                Làm du lịch có trách nhiệm với khách hàng và địa phương.
                            </h2>
                            <p className="mt-5 text-sm leading-7 text-slate-300">
                                Tây Bắc Travel tập trung vào các sản phẩm tour Sơn La và vùng Tây Bắc: nghỉ dưỡng cao
                                nguyên, săn mây, văn hóa bản làng, tour gia đình và tour doanh nghiệp. Mỗi lịch trình đều
                                được thiết kế để cân bằng giữa trải nghiệm, an toàn và thời gian nghỉ ngơi.
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            {companyValues.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                                        <Icon className="text-[#A67C52]" size={28} />
                                        <h3 className="mt-5 text-lg font-black text-white">{item.title}</h3>
                                        <p className="mt-3 text-sm leading-6 text-slate-300">{item.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[#f7faf6] py-16 text-slate-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <p className="text-sm font-black uppercase text-[#4f8f4d]">Nhân lực</p>
                            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Các nhóm vận hành cốt lõi</h2>
                        </div>
                    </div>
                    <div className="mt-8 grid gap-5 md:grid-cols-3">
                        {teamGroups.map((item) => (
                            <article key={item.role} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="text-xl font-black">{item.role}</h3>
                                <p className="mt-4 text-sm leading-7 text-slate-600">{item.desc}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
