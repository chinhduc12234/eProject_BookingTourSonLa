import { motion } from "framer-motion";

export default function CustomerHome() {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen w-full bg-white text-slate-900"
        >
            <div className="p-8">
                <h1 className="text-4xl font-bold">Customer Home</h1>
                <p className="mt-4 text-slate-600">
                    Chào mừng bạn đã quay trở lại với Sơn La Travel!
                </p>
            </div>
        </motion.div>
    );
}