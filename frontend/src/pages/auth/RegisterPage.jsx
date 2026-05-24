import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import {
    ArrowRight,
    Cloud,
    Lock,
    Mail,
    Phone,
    Sparkles,
    Sun,
    User,
    Wind,
} from "lucide-react";

const containerVars = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
    exit: { opacity: 0, transition: { duration: 0.3 } },
};

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } },
};

const floatAnim = {
    animate: {
        y: [0, -10, 0],
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
};

export default function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
    });

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.fullName || !form.email || !form.phone || !form.password) {
            return Swal.fire({
                icon: "warning",
                title: "Thiếu thông tin",
                text: "Vui lòng điền đầy đủ tất cả các trường",
                background: "#0b1f17",
                color: "#fff",
                confirmButtonColor: "#7FB77E",
            });
        }

        try {
            setLoading(true);
            await axiosClient.post("/auth/register", form);
            await Swal.fire({
                icon: "success",
                title: "Đăng ký thành công",
                text: "Chào mừng bạn gia nhập gia đình Sơn La Travel!",
                background: "#0b1f17",
                color: "#fff",
                confirmButtonColor: "#7FB77E",
            });
            navigate("/login");
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Lỗi đăng ký",
                text: err?.response?.data?.message || "Không thể tạo tài khoản",
                background: "#0b1f17",
                color: "#fff",
                confirmButtonColor: "#A67C52",
            });
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { key: "fullName", icon: User, type: "text", placeholder: "Họ và tên của bạn", label: "Họ và tên" },
        { key: "email", icon: Mail, type: "email", placeholder: "Địa chỉ Email", label: "Email" },
        { key: "phone", icon: Phone, type: "text", placeholder: "Số điện thoại", label: "Số điện thoại" },
        { key: "password", icon: Lock, type: "password", placeholder: "Mật khẩu", label: "Mật khẩu" },
    ];

    return (
        <motion.div
            variants={containerVars}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617]"
        >
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1.05, opacity: 0.9 }}
                transition={{ duration: 2, ease: "easeOut" }}
                style={{
                    backgroundImage:
                        "url('https://media-dwrm.mae.gov.vn/Image/6509b7f5-3d98-ec62-450e-890bfc931115/2025/7/11/muong-la-son-la_ab4356465f.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />

            <div className="absolute inset-0 z-[1] bg-gradient-to-tr from-[#020617] via-[#020617]/60 to-transparent" />
            <div className="absolute inset-0 z-[1] bg-grid-fade opacity-40" />
            <div className="absolute -top-20 right-1/4 z-[1] h-80 w-80 rounded-full bg-[#A67C52]/25 blur-[120px] animate-float-slow" />
            <div className="absolute -bottom-20 left-1/4 z-[1] h-80 w-80 rounded-full bg-[#7FB77E]/25 blur-[120px] animate-float-slow" />

            <Link
                to="/"
                className="absolute left-6 top-6 z-20 inline-flex items-center transition"
                aria-label="Tây Bắc Travel"
            >
                <img
                    src="/logo-main-tay-bac.png"
                    alt="Tây Bắc Travel"
                    className="h-16 w-40 object-contain drop-shadow-[0_12px_28px_rgba(166,124,82,0.45)]"
                />
            </Link>

            <div className="relative z-10 grid w-full max-w-6xl gap-16 px-6 sm:px-8 lg:grid-cols-2">
                {/* LEFT INTRO */}
                <div className="hidden flex-col justify-center lg:flex">
                    <motion.div variants={fadeInUp}>
                        <span className="section-tag">
                            <Sparkles size={12} /> Tạo tài khoản
                        </span>
                    </motion.div>
                    <motion.h1
                        variants={fadeInUp}
                        className="mt-6 text-6xl font-black leading-[1.05] tracking-tight text-white sm:text-7xl"
                    >
                        GIA NHẬP <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4a878] to-[#9de09c]">
                            CỘNG ĐỒNG.
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={fadeInUp}
                        className="mt-8 max-w-md text-xl font-light leading-relaxed text-slate-200"
                    >
                        Đăng ký tài khoản để nhận những ưu đãi đặc biệt và lưu giữ hành trình
                        chinh phục vùng cao.
                    </motion.p>

                    <motion.div className="mt-10 flex flex-wrap gap-3" variants={fadeInUp}>
                        {[
                            { icon: <Sun size={14} />, label: "Nắng vàng" },
                            { icon: <Wind size={14} />, label: "Gió đại ngàn" },
                            { icon: <Cloud size={14} />, label: "Mây trắng" },
                        ].map((tag, i) => (
                            <motion.div
                                key={i}
                                variants={floatAnim}
                                animate="animate"
                                style={{ animationDelay: `${i * 0.4}s` }}
                                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md"
                            >
                                {tag.icon} {tag.label}
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div variants={fadeInUp} className="mt-10 grid gap-3">
                        {[
                            "Lưu hành trình và yêu thích",
                            "Nhận lịch khởi hành mới hằng tuần",
                            "Ưu đãi riêng cho thành viên",
                        ].map((line, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur-md"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#A67C52]/20 text-[#d4a878]">
                                    ✓
                                </span>
                                <span className="text-sm font-medium text-slate-200">
                                    {line}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* RIGHT FORM */}
                <div className="flex items-center justify-center">
                    <motion.div
                        variants={fadeInUp}
                        onMouseMove={handleMouseMove}
                        className="group relative w-full max-w-[480px]"
                    >
                        <motion.div
                            className="pointer-events-none absolute -inset-px z-0 rounded-[2.5rem] opacity-0 transition duration-500 group-hover:opacity-100"
                            style={{
                                background: useMotionTemplate`
                                    radial-gradient(
                                        500px circle at ${mouseX}px ${mouseY}px,
                                        rgba(166, 124, 82, 0.22),
                                        transparent 80%
                                    )
                                `,
                            }}
                        />
                        <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-br from-[#A67C52]/30 via-transparent to-[#7FB77E]/30 opacity-60 blur-2xl" />

                        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#020617]/65 p-10 shadow-2xl backdrop-blur-2xl">
                            <motion.div variants={fadeInUp}>
                                <span className="section-tag">
                                    <Sparkles size={12} /> Khởi đầu
                                </span>
                                <h2 className="mt-4 text-3xl font-black text-white">
                                    Tạo tài khoản
                                </h2>
                                <p className="mt-2 text-sm font-medium text-slate-400">
                                    Bắt đầu hành trình của bạn ngay hôm nay.
                                </p>
                            </motion.div>

                            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                                {fields.map((field) => {
                                    const Icon = field.icon;
                                    return (
                                        <motion.div key={field.key} variants={fadeInUp}>
                                            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-[#d4a878]">
                                                {field.label}
                                            </label>
                                            <div className="relative flex items-center">
                                                <Icon className="absolute left-5 h-5 w-5 text-[#d4a878]" />
                                                <input
                                                    type={field.type}
                                                    placeholder={field.placeholder}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            [field.key]: e.target.value,
                                                        })
                                                    }
                                                    className="w-full rounded-2xl border border-white/15 bg-white/[0.06] py-4 pl-14 pr-5 text-white outline-none transition-all placeholder:text-white/40 focus:border-[#A67C52] focus:bg-[#A67C52]/10 focus:ring-4 focus:ring-[#A67C52]/15"
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                <motion.button
                                    variants={fadeInUp}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4a878] via-[#A67C52] to-[#7a5a3a] py-4 font-bold text-white shadow-[0_10px_30px_rgba(166,124,82,0.4)] transition-all hover:brightness-110 disabled:opacity-50"
                                >
                                    {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ NGAY"}
                                    {!loading && <ArrowRight className="h-5 w-5" />}
                                </motion.button>
                            </form>

                            <motion.div
                                variants={fadeInUp}
                                className="mt-8 border-t border-white/10 pt-6 text-center"
                            >
                                <p className="text-sm font-medium text-slate-400">
                                    Đã có tài khoản rồi?
                                    <Link
                                        to="/login"
                                        className="ml-2 font-bold text-[#9de09c] hover:underline"
                                    >
                                        Đăng nhập
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
