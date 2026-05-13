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

const errorMessages = {
    "Email already exists": "Email da ton tai",
    "Phone already exists": "So dien thoai da ton tai",
    "Full name is required": "Vui long nhap ho va ten",
    "Email is required": "Vui long nhap email",
    "Email is invalid": "Email khong dung dinh dang",
    "Phone is required": "Vui long nhap so dien thoai",
    "Phone number is invalid": "So dien thoai khong dung dinh dang",
    "Password is required": "Vui long nhap mat khau",
    "Password must be at least 6 characters": "Mat khau phai co it nhat 6 ky tu"
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

    function getErrorMessage(err) {
        const apiMessage = err?.response?.data?.message;

        if (apiMessage && errorMessages[apiMessage]) {
            return errorMessages[apiMessage];
        }

        if (err?.message === "Network Error") {
            return "Khong ket noi duoc toi backend";
        }

        return apiMessage || "Khong the tao tai khoan";
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const payload = {
            fullName: form.fullName.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim(),
            password: form.password,
        };

        if (!payload.fullName || !payload.email || !payload.phone || !payload.password) {
            return Swal.fire({
                icon: "warning",
                title: "Thieu thong tin",
                text: "Vui long dien day du tat ca cac truong",
                background: "#0b1f17",
                color: "#fff",
                confirmButtonColor: "#7FB77E",
            });
        }

        try {
            setLoading(true);
            await axiosClient.post("/auth/register", payload);

            await Swal.fire({
                icon: "success",
                title: "Dang ky thanh cong",
                text: "Chao mung ban gia nhap Son La Travel",
                background: "#0b1f17",
                color: "#fff",
                confirmButtonColor: "#7FB77E",
            });

            navigate("/login");
        } catch (err) {
            await Swal.fire({
                icon: "error",
                title: "Loi dang ky",
                text: getErrorMessage(err),
                background: "#0b1f17",
                color: "#fff",
                confirmButtonColor: "#A67C52",
            });
        } finally {
            setLoading(false);
        }
    }

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
                            GIA NHAP <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A67C52] to-[#7FB77E]">
                                CONG DONG.
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p variants={fadeInUp} className="mt-8 text-xl text-slate-200 font-light max-w-md leading-relaxed">
                        Dang ky tai khoan de nhan uu dai dac biet va luu giu hanh trinh chinh phuc vung cao.
                    </motion.p>

                    <motion.div className="mt-10 flex gap-4" variants={fadeInUp}>
                        {[
                            { icon: <Sun size={16} />, label: "Nang vang" },
                            { icon: <Wind size={16} />, label: "Gio dai ngan" },
                            { icon: <Cloud size={16} />, label: "May trang" }
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

                <div className="flex justify-center items-center">
                    <motion.div
                        variants={fadeInUp}
                        onMouseMove={handleMouseMove}
                        className="group relative w-full max-w-[480px]"
                    >
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

                        <div className="relative overflow-hidden rounded-[2.5rem] bg-black/40 backdrop-blur-2xl border border-white/10 p-10 shadow-2xl">
                            <motion.div variants={fadeInUp}>
                                <h2 className="text-3xl font-bold text-white mb-2">Tao tai khoan</h2>
                                <p className="text-slate-400 mb-8 text-sm font-medium">Bat dau hanh trinh cua ban ngay hom nay.</p>
                            </motion.div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <motion.div variants={fadeInUp} className="relative flex items-center">
                                    <User className="absolute left-5 text-[#A67C52] w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Ho va ten cua ban"
                                        value={form.fullName}
                                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#A67C52] focus:bg-white/10 transition-all"
                                    />
                                </motion.div>

                                <motion.div variants={fadeInUp} className="relative flex items-center">
                                    <Mail className="absolute left-5 text-[#A67C52] w-5 h-5" />
                                    <input
                                        type="email"
                                        placeholder="Dia chi email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#A67C52] focus:bg-white/10 transition-all"
                                    />
                                </motion.div>

                                <motion.div variants={fadeInUp} className="relative flex items-center">
                                    <Phone className="absolute left-5 text-[#A67C52] w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="So dien thoai"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#A67C52] focus:bg-white/10 transition-all"
                                    />
                                </motion.div>

                                <motion.div variants={fadeInUp} className="relative flex items-center">
                                    <Lock className="absolute left-5 text-[#A67C52] w-5 h-5" />
                                    <input
                                        type="password"
                                        placeholder="Mat khau"
                                        value={form.password}
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
                                    {loading ? "DANG XU LY..." : "DANG KY NGAY"}
                                    {!loading && <ArrowRight className="w-5 h-5" />}
                                </motion.button>
                            </form>

                            <motion.div variants={fadeInUp} className="mt-8 pt-6 border-t border-white/10 text-center">
                                <p className="text-slate-400 text-sm font-medium">
                                    Da co tai khoan roi?
                                    <Link to="/login" className="text-[#7FB77E] font-bold ml-2 hover:underline">
                                        Dang nhap
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
