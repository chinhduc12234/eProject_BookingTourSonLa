import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { User, Mail, Phone, Lock, ArrowRight, Sun, Wind, Cloud } from "lucide-react";

const containerVars = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
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
        y: [0, -10, 0],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
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
        let { left, top } = currentTarget.getBoundingClientRect();
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

    return (
        <motion.div
            variants={containerVars}
            initial="hidden"
            animate="show"
            exit="exit"
            className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#020617]"
        >
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1.05, opacity: 0.9 }}
                transition={{ duration: 2, ease: "easeOut" }}
                style={{
                    backgroundImage: "url('https://media-dwrm.mae.gov.vn/Image/6509b7f5-3d98-ec62-450e-890bfc931115/2025/7/11/muong-la-son-la_ab4356465f.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />

            <div className="absolute inset-0 bg-gradient-to-tr from-[#020617] via-[#020617]/40 to-transparent z-[1]" />

            <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-16 px-8">

                <div className="hidden lg:flex flex-col justify-center">
                    <motion.div variants={fadeInUp}>
                        <h1 className="text-7xl font-black text-white tracking-tight leading-[1.3]">
                            GIA NHẬP <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A67C52] to-[#7FB77E]">
                                CỘNG ĐỒNG.
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p variants={fadeInUp} className="mt-8 text-xl text-slate-200 font-light max-w-md leading-relaxed">
                        Đăng ký tài khoản để nhận những ưu đãi đặc biệt và lưu giữ hành trình chinh phục vùng cao.
                    </motion.p>

                    <motion.div className="mt-10 flex gap-4" variants={fadeInUp}>
                        {[
                            { icon: <Sun size={16} />, label: "Nắng vàng" },
                            { icon: <Wind size={16} />, label: "Gió đại ngàn" },
                            { icon: <Cloud size={16} />, label: "Mây trắng" }
                        ].map((tag, i) => (
                            <motion.div
                                key={i}
                                variants={floatAnim}
                                animate="animate"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-sm font-medium"
                            >
                                {tag.icon} {tag.label}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* RIGHT FORM (Đăng ký) */}
                <div className="flex justify-center items-center">
                    <motion.div
                        variants={fadeInUp}
                        onMouseMove={handleMouseMove}
                        className="group relative w-full max-w-[480px]"
                    >
                        {/* Spotlight Effect */}
                        <motion.div
                            className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition duration-500 z-0"
                            style={{
                                background: useMotionTemplate`
                                    radial-gradient(
                                        500px circle at ${mouseX}px ${mouseY}px,
                                        rgba(166, 124, 82, 0.2),
                                        transparent 80%
                                    )
                                `,
                            }}
                        />

                        {/* Glass Card */}
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-black/40 backdrop-blur-2xl border border-white/10 p-10 shadow-2xl">
                            <motion.div variants={fadeInUp}>
                                <h2 className="text-3xl font-bold text-white mb-2">Tạo tài khoản</h2>
                                <p className="text-slate-400 mb-8 text-sm font-medium">Bắt đầu hành trình của bạn ngay hôm nay.</p>
                            </motion.div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Họ tên */}
                                <motion.div variants={fadeInUp} className="relative flex items-center">
                                    <User className="absolute left-5 text-[#A67C52] w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Họ và tên của bạn"
                                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#A67C52] focus:bg-white/10 transition-all"
                                    />
                                </motion.div>

                                {/* Email */}
                                <motion.div variants={fadeInUp} className="relative flex items-center">
                                    <Mail className="absolute left-5 text-[#A67C52] w-5 h-5" />
                                    <input
                                        type="email"
                                        placeholder="Địa chỉ Email"
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#A67C52] focus:bg-white/10 transition-all"
                                    />
                                </motion.div>

                                {/* Số điện thoại */}
                                <motion.div variants={fadeInUp} className="relative flex items-center">
                                    <Phone className="absolute left-5 text-[#A67C52] w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Số điện thoại"
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#A67C52] focus:bg-white/10 transition-all"
                                    />
                                </motion.div>

                                {/* Mật khẩu */}
                                <motion.div variants={fadeInUp} className="relative flex items-center">
                                    <Lock className="absolute left-5 text-[#A67C52] w-5 h-5" />
                                    <input
                                        type="password"
                                        placeholder="Mật khẩu"
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#A67C52] focus:bg-white/10 transition-all"
                                    />
                                </motion.div>

                                <motion.button
                                    variants={fadeInUp}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                    className="w-full py-4 rounded-2xl font-bold text-white bg-[#A67C52] hover:bg-[#c29161] flex items-center justify-center gap-2 transition-all shadow-lg mt-4"
                                >
                                    {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ NGAY"}
                                    {!loading && <ArrowRight className="w-5 h-5" />}
                                </motion.button>
                            </form>

                            <motion.div variants={fadeInUp} className="mt-8 pt-6 border-t border-white/10 text-center">
                                <p className="text-slate-400 text-sm font-medium">
                                    Đã có tài khoản rồi?
                                    <Link to="/login" className="text-[#7FB77E] font-bold ml-2 hover:underline">
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