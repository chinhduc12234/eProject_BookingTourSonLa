import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { saveAuth } from "../../utils/auth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import {
    ArrowRight,
    Droplets,
    Eye,
    EyeOff,
    Leaf,
    Lock,
    Mail,
    Mountain,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { photoCredits, scenicImages } from "../public/publicContent";
import { getApiErrorMessage } from "../../utils/apiError";

const containerVars = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.25 },
    },
    exit: { opacity: 0, transition: { duration: 0.3 } },
};

const fadeInUp = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } },
};

const floatAnim = {
    animate: {
        y: [0, -8, 0],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
};

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const authMessage = sessionStorage.getItem("auth_message");

        if (!authMessage) return;

        sessionStorage.removeItem("auth_message");
        Swal.fire({
            icon: "info",
            title: "Cần đăng nhập lại",
            text: authMessage,
            background: "#0b1f17",
            color: "#fff",
            confirmButtonColor: "#7FB77E",
        });
    }, []);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top } = currentTarget.getBoundingClientRect();
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
            const returnLocation = location.state?.from;
            const returnToBooking =
                role === "CUSTOMER" &&
                returnLocation?.pathname?.startsWith("/booking/")
                    ? `${returnLocation.pathname}${returnLocation.search || ""}${returnLocation.hash || ""}`
                    : null;

            if (role === "ADMIN") navigate("/admin");
            else if (role === "EMPLOYEE") navigate("/employee");
            else if (returnToBooking) navigate(returnToBooking, { replace: true });
            else navigate("/");
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Thất bại",
                text: getApiErrorMessage(err, "Sai tài khoản hoặc mật khẩu"),
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
            className="relative flex min-h-screen items-center justify-center overflow-hidden"
        >
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1.05, opacity: 0.95 }}
                transition={{ duration: 2, ease: "easeOut" }}
                style={{
                    backgroundImage: `url('${scenicImages.mocChauTea}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />

            <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#020617] via-[#020617]/85 to-[#020617]/40" />
            <div className="absolute inset-0 z-[1] bg-grid-fade opacity-50" />
            <div className="absolute -top-32 left-1/4 z-[1] h-80 w-80 rounded-full bg-[#7FB77E]/25 blur-[120px] animate-float-slow" />
            <div className="absolute -bottom-32 right-1/4 z-[1] h-80 w-80 rounded-full bg-[#A67C52]/25 blur-[120px] animate-float-slow" />

            <Link
                to="/"
                className="absolute left-6 top-6 z-20 inline-flex items-center transition"
                aria-label="Tây Bắc Travel"
            >
                <img
                    src="/logo-main-tay-bac.png"
                    alt="Tây Bắc Travel"
                    className="h-16 w-40 object-contain drop-shadow-[0_12px_28px_rgba(127,183,126,0.45)]"
                />
            </Link>

            <div className="relative z-10 grid w-full max-w-6xl gap-16 px-6 sm:px-8 lg:grid-cols-2">
                {/* LEFT */}
                <div className="hidden flex-col justify-center lg:flex">
                    <motion.div variants={fadeInUp}>
                        <span className="section-tag">
                            <Sparkles size={12} /> Đăng nhập hệ thống
                        </span>
                    </motion.div>
                    <motion.h1
                        variants={fadeInUp}
                        className="mt-6 text-7xl font-black leading-[0.95] tracking-tighter text-white sm:text-8xl"
                    >
                        TÂY BẮC <br />
                        <span className="text-gradient-mountain animate-gradient-pan">
                            TRAVEL.
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={fadeInUp}
                        className="mt-8 max-w-md text-xl font-light leading-relaxed text-slate-200 drop-shadow-lg"
                    >
                        Khám phá vẻ đẹp hùng vĩ của núi rừng Tây Bắc. Nơi mây ngàn chạm ngõ hồn
                        người.
                    </motion.p>

                    <motion.div className="mt-10 flex flex-wrap gap-3" variants={fadeInUp}>
                        {[
                            { icon: <Mountain size={14} />, label: "Núi rừng" },
                            { icon: <Leaf size={14} />, label: "Thiên nhiên" },
                            { icon: <Droplets size={14} />, label: "Sông hồ" },
                        ].map((tag, i) => (
                            <motion.div
                                key={i}
                                variants={floatAnim}
                                animate="animate"
                                style={{ animationDelay: `${i * 0.3}s` }}
                                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white shadow-xl backdrop-blur-md"
                            >
                                {tag.icon} {tag.label}
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div
                        variants={fadeInUp}
                        className="mt-10 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
                            <ShieldCheck size={18} />
                        </span>
                        <div>
                            <div className="text-xs font-bold uppercase tracking-widest text-[#d4a878]">
                                Phiên đăng nhập
                            </div>
                            <div className="text-sm font-bold text-white">
                                Dành cho khách hàng, nhân viên và quản trị viên
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT FORM */}
                <div className="flex items-center justify-center">
                    <motion.div
                        variants={fadeInUp}
                        onMouseMove={handleMouseMove}
                        className="group relative w-full max-w-[460px]"
                    >
                        <motion.div
                            className="pointer-events-none absolute -inset-px z-0 rounded-[2.5rem] opacity-0 transition duration-500 group-hover:opacity-100"
                            style={{
                                background: useMotionTemplate`
                                    radial-gradient(
                                        500px circle at ${mouseX}px ${mouseY}px,
                                        rgba(127, 183, 126, 0.22),
                                        transparent 80%
                                    )
                                `,
                            }}
                        />
                        <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-br from-[#7FB77E]/30 via-transparent to-[#A67C52]/30 opacity-60 blur-2xl" />

                        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#020617]/65 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-12">
                            <motion.div variants={fadeInUp}>
                                <span className="section-tag">
                                    <Sparkles size={12} /> Chào mừng trở lại
                                </span>
                                <h2 className="mt-4 text-4xl font-black text-white">
                                    Đăng nhập
                                </h2>
                                <p className="mt-2 text-base text-slate-300">
                                    Hành trình của bạn bắt đầu tại đây.
                                </p>
                            </motion.div>

                            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
                                <motion.div variants={fadeInUp} className="relative">
                                    <label
                                        htmlFor="login-email"
                                        className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]"
                                    >
                                        Email
                                    </label>
                                    <div className="relative flex items-center">
                                        <Mail
                                            className="absolute left-5 h-5 w-5 text-[#9de09c]"
                                            aria-hidden="true"
                                        />
                                        <input
                                            id="login-email"
                                            type="email"
                                            name="email"
                                            autoComplete="email"
                                            required
                                            autoFocus
                                            maxLength={255}
                                            placeholder="Email của bạn"
                                            value={form.email}
                                            onChange={(e) =>
                                                setForm({ ...form, email: e.target.value })
                                            }
                                            className="w-full rounded-2xl border border-white/15 bg-white/[0.08] py-4 pl-14 pr-5 text-white outline-none transition-all placeholder:text-white/45 focus:border-[#7FB77E] focus:bg-[#7FB77E]/10 focus:ring-4 focus:ring-[#7FB77E]/20"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeInUp} className="relative">
                                    <label
                                        htmlFor="login-password"
                                        className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]"
                                    >
                                        Mật khẩu
                                    </label>
                                    <div className="relative flex items-center">
                                        <Lock
                                            className="absolute left-5 h-5 w-5 text-[#9de09c]"
                                            aria-hidden="true"
                                        />
                                        <input
                                            id="login-password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            autoComplete="current-password"
                                            required
                                            maxLength={255}
                                            placeholder="Mật khẩu"
                                            value={form.password}
                                            onChange={(e) =>
                                                setForm({ ...form, password: e.target.value })
                                            }
                                            className="w-full rounded-2xl border border-white/15 bg-white/[0.08] py-4 pl-14 pr-14 text-white outline-none transition-all placeholder:text-white/45 focus:border-[#7FB77E] focus:bg-[#7FB77E]/10 focus:ring-4 focus:ring-[#7FB77E]/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((value) => !value)}
                                            className="absolute right-2 inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9de09c]"
                                            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                            aria-pressed={showPassword}
                                        >
                                            {showPassword ? (
                                                <EyeOff size={19} aria-hidden="true" />
                                            ) : (
                                                <Eye size={19} aria-hidden="true" />
                                            )}
                                        </button>
                                    </div>
                                </motion.div>

                                <motion.button
                                    type="submit"
                                    variants={fadeInUp}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                    className="relative mt-2 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#9de09c] via-[#7FB77E] to-[#4f8f4d] bg-[length:200%_200%] bg-[position:0%_50%] py-5 font-black tracking-wider text-[#020617] shadow-[0_10px_30px_rgba(127,183,126,0.4)] transition-all hover:bg-[position:100%_50%] disabled:opacity-50"
                                >
                                    {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
                                    {!loading && <ArrowRight className="h-6 w-6" />}
                                </motion.button>
                            </form>

                            <motion.div
                                variants={fadeInUp}
                                className="mt-10 border-t border-white/10 pt-8 text-center"
                            >
                                <p className="text-sm text-slate-400">
                                    Chưa có tài khoản?
                                    <Link
                                        to="/register"
                                        className="ml-2 font-bold text-[#9de09c] underline-offset-4 hover:underline"
                                    >
                                        Đăng ký ngay
                                    </Link>
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
            <a
                href={photoCredits.find((item) => item.label.includes("Đồi chè"))?.url}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-4 left-6 z-20 text-[10px] font-semibold text-white/65 underline-offset-4 hover:text-white hover:underline"
            >
                Ảnh: đồi chè Mộc Châu · Wikimedia Commons
            </a>
        </motion.div>
    );
}
