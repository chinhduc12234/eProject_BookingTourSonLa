import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import CustomerHome from "./pages/customer/CustomerHome";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import FaqPage from "./pages/public/FaqPage";

import ProvincePage from "./pages/admin/ProvincePage";
import DistrictPage from "./pages/admin/DistrictPage";
import LocationPage from "./pages/admin/LocationPage";
import TourPage from "./pages/admin/TourPage";
import TourDetailPage from "./pages/admin/TourDetailPage";
import StaffPage from "./pages/admin/StaffPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";

function AnimatedRoutes() {

  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
<<<<<<< Updated upstream

      <Routes
        location={location}
        key={location.pathname}
      >

        {/* AUTH */}

=======
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<CustomerHome />} />
        <Route path="/gioi-thieu" element={<AboutPage />} />
        <Route path="/lien-he" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
>>>>>>> Stashed changes
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />

        <Route
          path="/register"
          element={
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          }
        />

        {/* CUSTOMER */}

        <Route
          path="/"
          element={<CustomerHome />}
        />

        {/* EMPLOYEE */}

        <Route
          path="/employee"
          element={
            <ProtectedRoute allowRoles={["EMPLOYEE"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowRoles={["ADMIN"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >

          <Route index element={<AdminDashboard />} />
          <Route path="provinces" element={<ProvincePage />} />
          <Route path="districts" element={<DistrictPage />} />
          <Route path="locations" element={<LocationPage />} />
          <Route path="tours" element={<TourPage />} />
          <Route path="tours/:id" element={<TourDetailPage />} />
          <Route path="staff" element={<StaffPage />} />

        </Route>

      </Routes>

    </AnimatePresence>
  );
}

export default function App() {

  return (
    <BrowserRouter>

      <Toaster position="top-right" />

      <AnimatedRoutes />

    </BrowserRouter>
  );
<<<<<<< Updated upstream
}
=======
}

export default App;
>>>>>>> Stashed changes
