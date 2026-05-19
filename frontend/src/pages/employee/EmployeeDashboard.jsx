import { motion } from "framer-motion";

export default function EmployeeDashboard() {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen w-full bg-white text-slate-900"
        >
            <div className="p-8">
                <h1 className="text-4xl font-bold">
                    Chào mừng bạn tới Trang Nhân viên!
                </h1>
                <p className="mt-4 text-slate-600">
                    Đây là khu vực dành riêng cho nhân viên của Sơn La Travel. Tại đây bạn có thể xem thông tin, quản lý đặt chỗ, và thực hiện các công việc được giao.
                </p>
            </div>
        </motion.div>
    );
}