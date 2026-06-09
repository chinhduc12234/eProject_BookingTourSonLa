import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import CustomerHome from "./pages/customer/CustomerHome";
import AccountHomePage from "./pages/customer/AccountHomePage";
import BookingDetailPage from "./pages/customer/BookingDetailPage";
import BookingHistoryPage from "./pages/customer/BookingHistoryPage";
import BookingPaymentPage from "./pages/customer/BookingPaymentPage";
import ProfilePage from "./pages/customer/ProfilePage";
import TourBookingPage from "./pages/customer/TourBookingPage";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import FaqPage from "./pages/public/FaqPage";
import TourListPage from "./pages/public/TourListPage";
import TourDetailPublicPage from "./pages/public/TourDetailPublicPage";

import ProvincePage from "./pages/admin/ProvincePage";
import DistrictPage from "./pages/admin/DistrictPage";
import LocationPage from "./pages/admin/LocationPage";
import TourPage from "./pages/admin/TourPage";
import TourDetailPage from "./pages/admin/TourDetailPage";
import StaffPage from "./pages/admin/StaffPage";
import BookingPage from "./pages/admin/BookingPage";
import AdminBookingDetailPage from "./pages/admin/AdminBookingDetailPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* AUTH */}

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

        <Route path="/" element={<CustomerHome />} />
        <Route path="/tours" element={<TourListPage />} />
        <Route path="/tours/:id" element={<TourDetailPublicPage />} />
        <Route path="/booking" element={<TourListPage />} />
        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute allowRoles={["CUSTOMER"]}>
              <TourBookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:id/payment"
          element={
            <ProtectedRoute allowRoles={["CUSTOMER"]}>
              <BookingPaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tai-khoan"
          element={
            <ProtectedRoute allowRoles={["CUSTOMER"]}>
              <AccountHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tai-khoan/thong-tin"
          element={
            <ProtectedRoute allowRoles={["CUSTOMER"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tai-khoan/booking"
          element={
            <ProtectedRoute allowRoles={["CUSTOMER"]}>
              <BookingHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tai-khoan/booking/:bookingId"
          element={
            <ProtectedRoute allowRoles={["CUSTOMER"]}>
              <BookingDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/gioi-thieu" element={<AboutPage />} />
        <Route path="/lien-he" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />

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
          <Route path="bookings" element={<BookingPage />} />
          <Route path="bookings/:bookingId" element={<AdminBookingDetailPage />} />
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
}
