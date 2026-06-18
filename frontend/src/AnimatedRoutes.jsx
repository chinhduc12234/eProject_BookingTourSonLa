import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeTimelinePage from "./pages/employee/EmployeeTimelinePage";
import CustomerHome from "./pages/customer/CustomerHome";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import FaqPage from "./pages/public/FaqPage";

import ProtectedRoute from "./routes/ProtectedRoute";

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<CustomerHome />} />
        <Route path="/gioi-thieu" element={<AboutPage />} />
        <Route path="/lien-he" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee"
          element={
            <ProtectedRoute allowRoles={["EMPLOYEE"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/bookings/:bookingId/timeline"
          element={
            <ProtectedRoute allowRoles={["EMPLOYEE"]}>
              <EmployeeTimelinePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
