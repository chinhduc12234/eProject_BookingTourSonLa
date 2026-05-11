import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { saveAuth } from "../../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { Mail, Lock, ArrowRight, Mountain, Leaf, Droplets } from "lucide-react";

const containerVars = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.3
        }
    },
    exit: { opacity: 0, transition: { duration: 0.3 } }
};

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } }
};

const floatAnim = {
    animate: {
        y: [0, -8, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

export default function LoginPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            return Swal.fire({
                icon: "warning",
                title: "Thiếu thông tin",
                text: "Vui lòng nhập đầy đủ email và mật khẩu",
                background: "#0b1f17",
                color: "#fff",
                confirmButtonColor: "#7FB77E",
            });
        }

        try {
            setLoading(true);
            const res = await axiosClient.post("/auth/login", form);
            saveAuth(res.data);

            await Swal.fire({
                icon: "success",
                title: "Thành công",
                text: "Chào mừng bạn trở lại!",
                background: "#0b1f17",
                color: "#fff",
                timer: 1500,
                showConfirmButton: false,
            });

            const role = res.data.role;
            if (role === "ADMIN") navigate("/admin");
            else if (role === "EMPLOYEE") navigate("/employee");
            else navigate("/");

        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Thất bại",
                text: err?.response?.data?.message || "Sai tài khoản hoặc mật khẩu",
                background: "#0b1f17",
                color: "#fff",
                confirmButtonColor: "#A67C52",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            variants={containerVars}
            initial="hidden"
            animate="show"
            exit="exit"
            className="min-h-screen relative flex items-center justify-center overflow-hidden"
        >
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1.05, opacity: 0.95 }}
                transition={{ duration: 2, ease: "easeOut" }}
                style={{
                    backgroundImage: "url('https://datviettour.com.vn/uploads/images/tin-tuc-SEO/mien-bac/danh-thang/du-lich-son-la-3.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/70 via-[#020617]/10 to-transparent z-[1]" />
            <div className="absolute inset-0 bg-[#7FB77E]/5 z-[1]" />

            <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-16 px-8">

                <div className="hidden lg:flex flex-col justify-center">
                    <motion.div variants={fadeInUp}>
                        <h1 className="text-8xl font-black text-white tracking-tighter leading-[0.9]">
                            TÂY BẮC <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7FB77E] to-white/80">
                                TRAVEL.
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p variants={fadeInUp} className="mt-8 text-xl text-slate-200 font-light max-w-md leading-relaxed drop-shadow-lg">
                        Khám phá vẻ đẹp hùng vĩ của núi rừng Tây Bắc. Nơi mây ngàn chạm ngõ hồn người.
                    </motion.p>

                    <motion.div className="mt-10 flex gap-4" variants={fadeInUp}>
                        {[
                            { icon: <Mountain size={16} />, label: "Núi rừng" },
                            { icon: <Leaf size={16} />, label: "Thiên nhiên" },
                            { icon: <Droplets size={16} />, label: "Sông hồ" }
                        ].map((tag, i) => (
                            <motion.div
                                key={i}
                                variants={floatAnim}
                                animate="animate"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-sm font-medium shadow-xl"
                            >
                                {tag.icon} {tag.label}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <div className="flex justify-center items-center">
                    <motion.div
                        variants={fadeInUp}
                        onMouseMove={handleMouseMove}
                        className="group relative w-full max-w-[450px]"
                    >
                        <motion.div
                            className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition duration-500 z-0"
                            style={{
                                background: useMotionTemplate`
                                    radial-gradient(
                                        500px circle at ${mouseX}px ${mouseY}px,
                                        rgba(127, 183, 126, 0.2),
                                        transparent 80%
                                    )
                                `,
                            }}
                        />

                        <div className="relative overflow-hidden rounded-[2.5rem] bg-black/40 backdrop-blur-2xl border border-white/10 p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            <motion.div variants={fadeInUp}>
                                <h2 className="text-4xl font-bold text-white mb-3">Đăng nhập</h2>
                                <p className="text-slate-300 mb-10 text-base">Hành trình của bạn bắt đầu tại đây.</p>
                            </motion.div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <motion.div variants={fadeInUp} className="relative flex items-center">
                                    <Mail className="absolute left-5 text-[#7FB77E] w-5 h-5" />
                                    <input
                                        type="email"
                                        placeholder="Email của bạn"
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/10 border border-white/15 text-white/95 outline-none focus:border-[#7FB77E] focus:bg-white/15 transition-all placeholder:text-white/60"
                                    />
                                </motion.div>

                                <motion.div variants={fadeInUp} className="relative flex items-center">
                                    <Lock className="absolute left-5 text-[#7FB77E] w-5 h-5" />
                                    <input
                                        type="password"
                                        placeholder="Mật khẩu"
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/10 border border-white/15 text-white/95 outline-none focus:border-[#7FB77E] focus:bg-white/15 transition-all placeholder:text-white/60"
                                    />
                                </motion.div>

                                <motion.button
                                    variants={fadeInUp}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                    className="w-full py-5 rounded-2xl font-black text-black bg-[#7FB77E] hover:bg-[#9de09c] flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(127,183,126,0.3)] disabled:opacity-50 mt-4 tracking-wider"
                                >
                                    {loading ? "ĐANG XỬ LÝ..." : "BẮT ĐẦU TRẢI NGHIỆM"}
                                    {!loading && <ArrowRight className="w-6 h-6" />}
                                </motion.button>
                            </form>

                            <motion.div variants={fadeInUp} className="mt-10 pt-8 border-t border-white/10 text-center">
                                <p className="text-slate-400 text-sm">
                                    Chưa có tài khoản?
                                    <Link to="/register" className="text-[#7FB77E] font-bold ml-2 hover:underline decoration-2 underline-offset-4">
                                        Đăng ký ngay
                                    </Link>
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}