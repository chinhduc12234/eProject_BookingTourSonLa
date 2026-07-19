import { lazy, Suspense, useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminStatisticsPage = lazy(() => import("./pages/admin/AdminStatisticsPage"));
const EmployeeDashboard = lazy(() => import("./pages/employee/EmployeeDashboard"));
const EmployeeTimelinePage = lazy(() => import("./pages/employee/EmployeeTimelinePage"));
const CustomerHome = lazy(() => import("./pages/customer/CustomerHome"));
const AccountHomePage = lazy(() => import("./pages/customer/AccountHomePage"));
const BookingDetailPage = lazy(() => import("./pages/customer/BookingDetailPage"));
const BookingHistoryPage = lazy(() => import("./pages/customer/BookingHistoryPage"));
const BookingPaymentPage = lazy(() => import("./pages/customer/BookingPaymentPage"));
const ProfilePage = lazy(() => import("./pages/customer/ProfilePage"));
const TourBookingPage = lazy(() => import("./pages/customer/TourBookingPage"));
const PaymentPage = lazy(() => import("./pages/customer/PaymentPage"));
const ThankYouPage = lazy(() => import("./pages/customer/ThankYouPage"));
const AboutPage = lazy(() => import("./pages/public/AboutPage"));
const ContactPage = lazy(() => import("./pages/public/ContactPage"));
const FaqPage = lazy(() => import("./pages/public/FaqPage"));
const TourListPage = lazy(() => import("./pages/public/TourListPage"));
const TourDetailPublicPage = lazy(() => import("./pages/public/TourDetailPublicPage"));
const ProvincePage = lazy(() => import("./pages/admin/ProvincePage"));
const DistrictPage = lazy(() => import("./pages/admin/DistrictPage"));
const LocationPage = lazy(() => import("./pages/admin/LocationPage"));
const TourPage = lazy(() => import("./pages/admin/TourPage"));
const TourDetailPage = lazy(() => import("./pages/admin/TourDetailPage"));
const StaffPage = lazy(() => import("./pages/admin/StaffPage"));
const BookingPage = lazy(() => import("./pages/admin/BookingPage"));
const GroupTourManagementPage = lazy(() => import("./pages/admin/GroupTourManagementPage"));
const GroupTourDetailPage = lazy(() => import("./pages/admin/GroupTourDetailPage"));
const AdminBookingDetailPage = lazy(() => import("./pages/admin/AdminBookingDetailPage"));

function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <LoaderCircle aria-hidden="true" />
      <span>Đang mở trang...</span>
    </div>
  );
}

function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    if (hash) return;

    const scrollToPageTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToPageTop();
    const frameId = window.requestAnimationFrame(scrollToPageTop);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [pathname, search, hash]);

  return null;
}

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
        <Route
          path="/payment"
          element={
            <ProtectedRoute allowRoles={["CUSTOMER"]}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/thank-you"
          element={
            <ProtectedRoute allowRoles={["CUSTOMER"]}>
              <ThankYouPage />
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
        <Route
          path="/employee/bookings/:bookingId/timeline"
          element={
            <ProtectedRoute allowRoles={["EMPLOYEE"]}>
              <EmployeeTimelinePage />
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
          <Route path="statistics" element={<AdminStatisticsPage />} />
          <Route path="provinces" element={<ProvincePage />} />
          <Route path="districts" element={<DistrictPage />} />
          <Route path="locations" element={<LocationPage />} />
          <Route path="tours" element={<TourPage />} />
          <Route path="tours/:id" element={<TourDetailPage />} />
          <Route path="group-tours" element={<GroupTourManagementPage />} />
          <Route path="group-tours/:departureId" element={<GroupTourDetailPage />} />
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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4200,
          style: {
            border: "1px solid rgba(67, 91, 74, 0.18)",
            borderRadius: "14px",
            background: "#fffdf7",
            color: "#17251c",
            fontWeight: 700,
          },
        }}
      />
      <ScrollToTop />
      <Suspense fallback={<RouteLoading />}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  );
}
