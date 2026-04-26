import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import { useAuthStore } from './store/authStore';
import { LoadingProgress } from './components/common/LoadingProgress';

// Lazy Loaded Pages
const HomePage = lazy(() => import('./pages/public/HomePage'));
const ShopPage = lazy(() => import('./pages/public/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/public/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/public/CartPage'));
const CheckoutPage = lazy(() => import('./pages/public/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/public/OrderSuccessPage'));
const CollectionsPage = lazy(() => import('./pages/public/CollectionsPage'));
const CustomBlousePage = lazy(() => import('./pages/public/CustomBlousePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const OtpVerificationPage = lazy(() => import('./pages/auth/OtpVerificationPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'));
const AdminCustomRequestsPage = lazy(() => import('./pages/admin/AdminCustomRequestsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminCollectionsPage = lazy(() => import('./pages/admin/AdminCollectionsPage'));
const AdminBannersPage = lazy(() => import('./pages/admin/AdminBannersPage'));
const AdminBlogsPage = lazy(() => import('./pages/admin/AdminBlogsPage'));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'));
const AdminShippingPage = lazy(() => import('./pages/admin/AdminShippingPage'));
const AdminSupportPage = lazy(() => import('./pages/admin/AdminSupportPage'));
const AdminCMSPage = lazy(() => import('./pages/admin/AdminCMSPage'));
const AdminSubcategorySupportPage = lazy(() => import('./pages/admin/AdminSubcategorySupportPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminMediaPage = lazy(() => import('./pages/admin/AdminMediaPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage'));
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage'));
const AdminAdminsPage = lazy(() => import('./pages/admin/AdminAdminsPage'));
const AdminRolesPage = lazy(() => import('./pages/admin/AdminRolesPage'));
const AdminNotificationsPage = lazy(() => import('./pages/admin/AdminNotificationsPage'));
const AdminWishlistInsightsPage = lazy(() => import('./pages/admin/AdminWishlistInsightsPage'));
const AdminOTPPage = lazy(() => import('./pages/admin/AdminOTPPage'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));

// Dashboard Pages
const UserDashboard = lazy(() => import('./pages/dashboard/UserDashboard'));
const UserProfile = lazy(() => import('./pages/dashboard/UserProfile'));
const UserOrders = lazy(() => import('./pages/dashboard/UserOrders'));
const UserAddresses = lazy(() => import('./pages/dashboard/UserAddresses'));
const UserCustomRequests = lazy(() => import('./pages/dashboard/UserCustomRequests'));
const UserWishlist = lazy(() => import('./pages/dashboard/UserWishlist'));
const UserSettings = lazy(() => import('./pages/dashboard/UserSettings'));
const UserOrderDetail = lazy(() => import('./pages/dashboard/UserOrderDetail'));

// Static Pages
const AboutPageComp = lazy(() => import('./pages/public/StaticPages').then(m => ({ default: m.AboutPage })));
const ContactPageComp = lazy(() => import('./pages/public/StaticPages').then(m => ({ default: m.ContactPage })));
const BlogsPageComp = lazy(() => import('./pages/public/StaticPages').then(m => ({ default: m.BlogsPage })));

// Loading Component
const PageLoader = () => (
   <div className="min-h-[60vh] flex items-center justify-center">
     <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-800 rounded-full animate-spin"></div>
   </div>
);

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <LoadingProgress />
      <Suspense fallback={<PageLoader />}>
        <Routes>
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
            <Route path="/about" element={<AboutPageComp />} />
            <Route path="/contact" element={<ContactPageComp />} />
            <Route path="/blogs" element={<BlogsPageComp />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/otp-verification" element={<OtpVerificationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/my" element={<ProtectedRoute allowedRoles={['customer']}><UserLayout /></ProtectedRoute>}>
            <Route index element={<UserDashboard />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="orders" element={<UserOrders />} />
            <Route path="orders/:id" element={<UserOrderDetail />} />
            <Route path="addresses" element={<UserAddresses />} />
            <Route path="wishlist" element={<UserWishlist />} />
            <Route path="custom-requests" element={<UserCustomRequests />} />
            <Route path="settings" element={<UserSettings />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminLayout /></ProtectedRoute>}>
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
            <Route path="otp" element={<AdminOTPPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
