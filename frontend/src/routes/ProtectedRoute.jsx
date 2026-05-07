import { Navigate } from "react-router-dom";
import { getRole, isLoggedIn } from "../utils/auth";

export default function ProtectedRoute({
    children,
    allowRoles,
}) {

    if (!isLoggedIn()) {
        return <Navigate to="/login" />;
    }

    const role = getRole();

    if (!allowRoles.includes(role)) {
        return <Navigate to="/login" />;
    }

    return children;
}