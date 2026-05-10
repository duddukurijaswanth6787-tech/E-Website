import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import TailorLayout from './layouts/TailorLayout';
import { useAuthStore } from './store/authStore';
import { LoadingProgress } from './components/common/LoadingProgress';

// --- Lazy Loaded Pages ---

// User Side Pages
const HomePage = lazy(() => import('./pages/user/HomePage'));
const ShopPage = lazy(() => import('./pages/user/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/user/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/user/CartPage'));
const CheckoutPage = lazy(() => import('./pages/user/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/user/OrderSuccessPage'));
const CollectionsPage = lazy(() => import('./pages/user/CollectionsPage'));
const CustomBlousePage = lazy(() => import('./pages/user/CustomBlousePage'));

// User Dashboard Pages
const UserDashboard = lazy(() => import('./pages/user/dashboard/UserDashboard'));
const UserProfile = lazy(() => import('./pages/user/dashboard/UserProfile'));
const UserOrders = lazy(() => import('./pages/user/dashboard/UserOrders'));
const UserAddresses = lazy(() => import('./pages/user/dashboard/UserAddresses'));
const UserCustomRequests = lazy(() => import('./pages/user/dashboard/UserCustomRequests'));
const UserWishlist = lazy(() => import('./pages/user/dashboard/UserWishlist'));
const UserSettings = lazy(() => import('./pages/user/dashboard/UserSettings'));
const UserOrderDetail = lazy(() => import('./pages/user/dashboard/UserOrderDetail'));
const UserMeasurements = lazy(() => import('./pages/user/dashboard/UserMeasurements'));

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const OtpVerificationPage = lazy(() => import('./pages/auth/OtpVerificationPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const TailorLoginPage = lazy(() => import('./pages/auth/TailorLoginPage'));
const ManagerLoginPage = lazy(() => import('./pages/auth/ManagerLoginPage'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));

// Admin Side Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'));
const AdminCustomRequestsPage = lazy(() => import('./pages/admin/AdminCustomRequestsPage'));
const AdminCustomRequestDetailPage = lazy(() => import('./pages/admin/AdminCustomRequestDetailPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminCollectionsPage = lazy(() => import('./pages/admin/AdminCollectionsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage'));
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage'));
const AdminTailorsPage = lazy(() => import('./pages/admin/AdminTailorsPage'));
const AdminWorkflowsPage = lazy(() => import('./pages/admin/AdminWorkflowsPage'));
const AdminManagersPage = lazy(() => import('./pages/admin/AdminManagersPage'));
const AdminCustomBlouseOptionsPage = lazy(() => import('./pages/admin/AdminCustomBlouseOptionsPage'));

// Marketing ERP Phase 1, 2, 3 & 4
const MarketingDashboard = lazy(() => import('./pages/admin/marketing/MarketingDashboard'));
const HeroBannerAds = lazy(() => import('./pages/admin/marketing/HeroBannerAds'));
const PromoBlocks = lazy(() => import('./pages/admin/marketing/PromoBlocks'));
const StickyOffers = lazy(() => import('./pages/admin/marketing/StickyOffers'));
const ReviewModeration = lazy(() => import('./pages/admin/marketing/ReviewModeration'));
const InfluencerManager = lazy(() => import('./pages/admin/marketing/InfluencerManager'));
const BlogCMS = lazy(() => import('./pages/admin/marketing/BlogCMS'));
const AdPerformance = lazy(() => import('./pages/admin/marketing/AdPerformance'));
const ConversionFunnel = lazy(() => import('./pages/admin/marketing/ConversionFunnel'));
const BehaviorHeatmaps = lazy(() => import('./pages/admin/marketing/BehaviorHeatmaps'));
const OmnichannelEngine = lazy(() => import('./pages/admin/marketing/OmnichannelEngine'));
const AIMarketing = lazy(() => import('./pages/admin/marketing/AIMarketing'));
const CouponManagement = lazy(() => import('./pages/admin/marketing/CouponManagement'));
const FestivalEngine = lazy(() => import('./pages/admin/marketing/FestivalEngine'));
const SalesAnalytics = lazy(() => import('./pages/admin/marketing/SalesAnalytics'));

// Manager Pages
const ManagerLayout = lazy(() => import('./layouts/ManagerLayout'));
const ManagerDashboardOverview = lazy(() => import('./pages/admin/manager/ManagerDashboardOverview'));
const ManagerWorkflowsBoard = lazy(() => import('./pages/admin/manager/ManagerWorkflowsBoard'));
const ManagerTailorsPage = lazy(() => import('./pages/admin/manager/ManagerTailorsPage'));
const ManagerEscalationsPage = lazy(() => import('./pages/admin/manager/ManagerEscalationsPage'));
const ManagerAnalyticsPage = lazy(() => import('./pages/admin/manager/ManagerAnalyticsPage'));

// Tailor Dashboard Pages
const TailorDashboardOverview = lazy(() => import('./pages/admin/tailor/TailorDashboardOverview'));
const TailorTasksList = lazy(() => import('./pages/admin/tailor/TailorTasksList'));
const TailorTaskDetail = lazy(() => import('./pages/admin/tailor/TailorTaskDetail'));

// Static Pages
const AboutPageComp = lazy(() => import('./pages/user/StaticPages').then(m => ({ default: m.AboutPage })));
const ContactPageComp = lazy(() => import('./pages/user/StaticPages').then(m => ({ default: m.ContactPage })));

// --- Components ---

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
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin' || user.role === 'super_admin') return <Navigate to="/admin" replace />;
    if (user.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
    if (user.role === 'tailor') return <Navigate to="/tailor/dashboard" replace />;
    return <Navigate to="/my/profile" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <LoadingProgress />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* User Side Routes */}
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
          </Route>

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/otp-verification" element={<OtpVerificationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/tailor/login" element={<TailorLoginPage />} />
            <Route path="/manager/login" element={<ManagerLoginPage />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />

          {/* User Dashboard Routes (Protected) */}
          <Route path="/my" element={<ProtectedRoute allowedRoles={['customer']}><UserLayout /></ProtectedRoute>}>
            <Route index element={<UserDashboard />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="orders" element={<UserOrders />} />
            <Route path="orders/:id" element={<UserOrderDetail />} />
            <Route path="addresses" element={<UserAddresses />} />
            <Route path="wishlist" element={<UserWishlist />} />
            <Route path="measurements" element={<UserMeasurements />} />
            <Route path="custom-requests" element={<UserCustomRequests />} />
            <Route path="settings" element={<UserSettings />} />
          </Route>

          {/* Tailor Routes (Protected) */}
          <Route path="/tailor" element={<ProtectedRoute allowedRoles={['tailor']}><TailorLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<TailorDashboardOverview />} />
            <Route path="tasks" element={<TailorTasksList />} />
            <Route path="tasks/:id" element={<TailorTaskDetail />} />
          </Route>

          {/* Manager Routes (Protected) */}
          <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager']}><ManagerLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<ManagerDashboardOverview />} />
            <Route path="workflows" element={<ManagerWorkflowsBoard />} />
            <Route path="tailors" element={<ManagerTailorsPage />} />
            <Route path="escalations" element={<ManagerEscalationsPage />} />
            <Route path="analytics" element={<ManagerAnalyticsPage />} />
          </Route>

          {/* Admin Routes (Protected) */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="tailors" element={<AdminTailorsPage />} />
            <Route path="managers" element={<AdminManagersPage />} />
            <Route path="workflows" element={<AdminWorkflowsPage />} />
            <Route path="custom-requests" element={<AdminCustomRequestsPage />} />
            <Route path="custom-requests/:id" element={<AdminCustomRequestDetailPage />} />
            <Route path="custom-blouse-options" element={<AdminCustomBlouseOptionsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="collections" element={<AdminCollectionsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            
            {/* Marketing Hub (ERP M-1 to M-16) */}
            <Route path="marketing" element={<MarketingDashboard />} />
            <Route path="marketing/banners" element={<HeroBannerAds />} />
            <Route path="marketing/promo-blocks" element={<PromoBlocks />} />
            <Route path="marketing/sticky-offers" element={<StickyOffers />} />
            <Route path="marketing/reviews" element={<ReviewModeration />} />
            <Route path="marketing/influencers" element={<InfluencerManager />} />
            <Route path="marketing/blogs" element={<BlogCMS />} />
            <Route path="marketing/ads" element={<AdPerformance />} />
            <Route path="marketing/funnel" element={<ConversionFunnel />} />
            <Route path="marketing/behavior" element={<BehaviorHeatmaps />} />
            <Route path="marketing/delivery" element={<OmnichannelEngine />} />
            <Route path="marketing/ai" element={<AIMarketing />} />
            <Route path="marketing/coupons" element={<CouponManagement />} />
            <Route path="marketing/festivals" element={<FestivalEngine />} />
            <Route path="marketing/sales" element={<SalesAnalytics />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
