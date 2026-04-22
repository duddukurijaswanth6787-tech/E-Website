import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import { useAuthStore } from './store/authStore';
import HomePage from './pages/public/HomePage';
import ShopPage from './pages/public/ShopPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import CartPage from './pages/public/CartPage';
import CheckoutPage from './pages/public/CheckoutPage';
import OrderSuccessPage from './pages/public/OrderSuccessPage';
import CollectionsPage from './pages/public/CollectionsPage';
import CustomBlousePage from './pages/public/CustomBlousePage';
import { AboutPage, ContactPage, BlogsPage } from './pages/public/StaticPages';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OtpVerificationPage from './pages/auth/OtpVerificationPage';
import AdminDashboard from './pages/admin/AdminDashboard';
// All Static Placeholders Replaced natively.

import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminCustomRequestsPage from './pages/admin/AdminCustomRequestsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCollectionsPage from './pages/admin/AdminCollectionsPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminBlogsPage from './pages/admin/AdminBlogsPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminShippingPage from './pages/admin/AdminShippingPage';
import AdminSupportPage from './pages/admin/AdminSupportPage';
import AdminCMSPage from './pages/admin/AdminCMSPage';
import AdminSubcategorySupportPage from './pages/admin/AdminSubcategorySupportPage';

// Phase 4D Governance Routes
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminMediaPage from './pages/admin/AdminMediaPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminAdminsPage from './pages/admin/AdminAdminsPage';
import AdminRolesPage from './pages/admin/AdminRolesPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminWishlistInsightsPage from './pages/admin/AdminWishlistInsightsPage';

import AdminLogin from './pages/admin/AdminLogin';

import UserDashboard from './pages/dashboard/UserDashboard';
import UserOrders from './pages/dashboard/UserOrders';
import UserAddresses from './pages/dashboard/UserAddresses';
import UserCustomRequests from './pages/dashboard/UserCustomRequests';

// Temporary placeholders for incomplete pages
const Placeholder = ({ title }: { title: string }) => <div className="p-8 text-center text-xl mt-12 text-gray-500">{title} Under Construction</div>;

// Role-based Router Guard
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:slug" element={<ShopPage />} />
          <Route path="/category/:slug" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="/custom-blouse" element={<CustomBlousePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
        </Route>

        {/* CUSTOMER AUTH ROUTES */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/otp-verification" element={<OtpVerificationPage />} />
        </Route>

        {/* ADMIN AUTH ROOT */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* CUSTOMER DASHBOARD */}
        <Route 
          path="/my" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="orders/:id" element={<Placeholder title="Order Detail" />} />
          <Route path="addresses" element={<UserAddresses />} />
          <Route path="wishlist" element={<Placeholder title="Wishlist" />} />
          <Route path="custom-requests" element={<UserCustomRequests />} />
          <Route path="settings" element={<Placeholder title="Profile Settings" />} />
        </Route>

        {/* ADMIN DASHBOARD */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="custom-requests" element={<AdminCustomRequestsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="collections" element={<AdminCollectionsPage />} />
          <Route path="banners" element={<AdminBannersPage />} />
          <Route path="blogs" element={<AdminBlogsPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="shipping" element={<AdminShippingPage />} />
          <Route path="support" element={<AdminSupportPage />} />
          <Route path="categories/subcategory-support" element={<AdminSubcategorySupportPage />} />
          <Route path="content" element={<AdminCMSPage />} />
          
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          <Route path="admins" element={<AdminAdminsPage />} />
          <Route path="roles" element={<AdminRolesPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="wishlist-insights" element={<AdminWishlistInsightsPage />} />
          
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
