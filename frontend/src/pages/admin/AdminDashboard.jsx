import { motion } from "framer-motion";

export default function AdminDashboard() {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen w-full bg-white text-slate-900"
        >
            <div className="p-8">
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                <p className="mt-4 text-slate-600">
                    Chào mừng bạn đã quay trở lại với Sơn La Travel! Đây là trang quản trị dành cho admin, nơi bạn có thể quản lý các tour, đặt chỗ và thông tin khách hàng.
                </p>
            </div>
        </motion.div>
    );
}