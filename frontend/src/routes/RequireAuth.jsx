import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

/**
 * Gate cho khu vực /account.
 * Khác ProtectedRoute hiện có: chỉ yêu cầu user đã đăng nhập,
 * không enforce role cụ thể (CUSTOMER hay role nào cũng OK).
 */
export default function RequireAuth({ children, redirectTo = "/login" }) {
    const location = useLocation();
    if (!isLoggedIn()) {
        return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
    }
    return children;
}
