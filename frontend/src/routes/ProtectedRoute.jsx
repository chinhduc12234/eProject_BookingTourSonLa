import { Navigate, useLocation } from "react-router-dom";
import { getRole, isLoggedIn } from "../utils/auth";

export default function ProtectedRoute({
    children,
    allowRoles,
}) {
    const location = useLocation();

    if (!isLoggedIn()) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    const role = getRole();

    if (!allowRoles.includes(role)) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
}
