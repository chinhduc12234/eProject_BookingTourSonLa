import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

// Auth (KHÔNG SỬA)
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Dashboard cho ADMIN / EMPLOYEE (KHÔNG SỬA)
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";

// Customer & public layout cũ (giữ làm fallback)
import CustomerHome from "./pages/customer/CustomerHome";
import AboutPage from "./pages/public/AboutPage";
import BookingPage from "./pages/public/BookingPage";
import ContactPage from "./pages/public/ContactPage";
import FaqPage from "./pages/public/FaqPage";
import TourDetailPage from "./pages/public/TourDetailPage";
import TourListPage from "./pages/public/TourListPage";

// Trang travel mới (Tây Bắc Travel)
import HomeTravelPage from "./pages/travel/HomeTravelPage";
import ToursPage from "./pages/travel/ToursPage";
import TourDetailNewPage from "./pages/travel/TourDetailNewPage";
import PromotionsPage from "./pages/travel/PromotionsPage";
import LastMinutePage from "./pages/travel/LastMinutePage";
import DestinationsPage from "./pages/travel/DestinationsPage";
import DestinationDetailPage from "./pages/travel/DestinationDetailPage";
import BlogPage from "./pages/travel/BlogPage";
import BlogDetailPage from "./pages/travel/BlogDetailPage";
import ContactTravelPage from "./pages/travel/ContactTravelPage";
import BookingFlowPage from "./pages/travel/BookingFlowPage";
import BookingSuccessPage from "./pages/travel/BookingSuccessPage";

// Account pages
import AccountProfilePage from "./pages/travel/AccountProfilePage";
import AccountBookingsPage from "./pages/travel/AccountBookingsPage";
import AccountFavoritesPage from "./pages/travel/AccountFavoritesPage";
import AccountPaymentsPage from "./pages/travel/AccountPaymentsPage";
import AccountNotificationsPage from "./pages/travel/AccountNotificationsPage";
import AccountSettingsPage from "./pages/travel/AccountSettingsPage";

// Route guards
import ProtectedRoute from "./routes/ProtectedRoute";
import RequireAuth from "./routes/RequireAuth";

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
                {/* Auth - KHÔNG SỬA */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Trang chủ */}
                <Route path="/" element={<CustomerHome />} />

                {/* Tây Bắc Travel routes mới */}
                <Route path="/tours" element={<ToursPage />} />
                <Route path="/tours/:slug" element={<TourDetailNewPage />} />
                <Route path="/promotions" element={<PromotionsPage />} />
                <Route path="/last-minute" element={<LastMinutePage />} />
                <Route path="/destinations" element={<DestinationsPage />} />
                <Route path="/destinations/:slug" element={<DestinationDetailPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/contact" element={<ContactTravelPage />} />
                <Route path="/booking/:tourSlug" element={<BookingFlowPage />} />
                <Route path="/booking-success/:bookingCode" element={<BookingSuccessPage />} />

                {/* Account (yêu cầu đăng nhập, không enforce role) */}
                <Route path="/account" element={<Navigate to="/account/profile" replace />} />
                <Route
                    path="/account/profile"
                    element={
                        <RequireAuth>
                            <AccountProfilePage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/account/bookings"
                    element={
                        <RequireAuth>
                            <AccountBookingsPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/account/favorites"
                    element={
                        <RequireAuth>
                            <AccountFavoritesPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/account/payments"
                    element={
                        <RequireAuth>
                            <AccountPaymentsPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/account/notifications"
                    element={
                        <RequireAuth>
                            <AccountNotificationsPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/account/settings"
                    element={
                        <RequireAuth>
                            <AccountSettingsPage />
                        </RequireAuth>
                    }
                />

                {/* Route cũ vẫn giữ để không phá link nội bộ / SEO */}
                <Route path="/tour" element={<TourListPage />} />
                <Route path="/tour/:slug" element={<TourDetailPage />} />
                <Route path="/dat-tour/:slug" element={<BookingPage />} />
                <Route path="/gioi-thieu" element={<AboutPage />} />
                <Route path="/lien-he" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />

                {/* Admin / Employee - KHÔNG SỬA */}
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

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" />
            <AnimatedRoutes />
        </BrowserRouter>
    );
}

export default App;
