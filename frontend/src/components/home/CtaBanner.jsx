import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Headphones, Phone } from "lucide-react";
import { siteImage } from "../../utils/images";

const BG = siteImage(
    "cta",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80",
);

export default function CtaBanner() {
    return (
        <section className="py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-3xl"
                    style={{
                        backgroundImage: `linear-gradient(135deg, rgba(13,32,24,0.85), rgba(13,32,24,0.6)), url('${BG}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="relative grid gap-6 p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur">
                                Sẵn sàng cho chuyến đi?
                            </span>
                            <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                                Cùng Tây Bắc Travel <br /> đến với Tây Bắc của bạn.
                            </h2>
                            <p className="mt-3 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
                                Đội tư vấn sẵn sàng hỗ trợ 24/7. Nhận tư vấn miễn phí, thiết kế tour riêng theo nhu cầu chỉ trong 24h.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    to="/tours"
                                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-[#06281c]"
                                    style={{ background: "linear-gradient(135deg, #7FB77E, #9de09c)" }}
                                >
                                    Đặt tour ngay <ArrowRight size={16} />
                                </Link>
                                <a
                                    href="tel:19006868"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur hover:bg-white/20"
                                >
                                    <Phone size={16} /> 1900 6868
                                </a>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur">
                                <Headphones size={20} />
                                <div className="mt-2 text-lg font-black">Tư vấn miễn phí 24/7</div>
                                <div className="mt-1 text-xs text-white/80">
                                    Gọi ngay hoặc gửi tin nhắn cho đội tư vấn. Phản hồi trung bình dưới 5 phút.
                                </div>
                            </div>
                            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur">
                                <div className="text-3xl font-black">-30%</div>
                                <div className="mt-1 text-xs text-white/80">Ưu đãi đặc biệt cho khách đặt sớm và đoàn từ 10 người.</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
