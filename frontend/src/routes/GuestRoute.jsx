import { Navigate } from "react-router-dom";
import { getRole, isLoggedIn, roleHomePath } from "../utils/auth";

export default function GuestRoute({ children }) {
  if (isLoggedIn()) {
    return <Navigate to={roleHomePath(getRole())} replace />;
  }

  return children;
}

