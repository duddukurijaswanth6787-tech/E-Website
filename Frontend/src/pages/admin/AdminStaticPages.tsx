import { ShoppingBag, Package, Users, FileText, Image as ImageIcon, Settings } from 'lucide-react';

export const AdminOrdersPage = () => (
  <div className="bg-[var(--admin-card)] p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-16 h-16 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center mb-4">
      <ShoppingBag size={32} />
    </div>
    <h2 className="text-2xl font-serif text-gray-900 mb-2">Order Management</h2>
    <p className="text-[var(--admin-text-secondary)] max-w-sm">
      This module will display a comprehensive list of all customer orders, custom blouse requests, and tracking status updates.
    </p>
  </div>
);

export const AdminProductsPage = () => (
  <div className="bg-[var(--admin-card)] p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-16 h-16 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center mb-4">
      <Package size={32} />
    </div>
    <h2 className="text-2xl font-serif text-gray-900 mb-2">Product Catalog</h2>
    <p className="text-[var(--admin-text-secondary)] max-w-sm">
      Add, edit, and manage sarees, blouses, and inventory levels from this central hub.
    </p>
  </div>
);

export const AdminCustomersPage = () => (
  <div className="bg-[var(--admin-card)] p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-16 h-16 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center mb-4">
      <Users size={32} />
    </div>
    <h2 className="text-2xl font-serif text-gray-900 mb-2">Customer Base</h2>
    <p className="text-[var(--admin-text-secondary)] max-w-sm">
      View registered users, order histories, and manage privileged status or blocking.
    </p>
  </div>
);

export const AdminContentPage = () => (
  <div className="bg-[var(--admin-card)] p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-16 h-16 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center mb-4">
      <FileText size={32} />
    </div>
    <h2 className="text-2xl font-serif text-gray-900 mb-2">CMS / Blogs</h2>
    <p className="text-[var(--admin-text-secondary)] max-w-sm">
      Write journal entries, manage SEO metadata, and configure policy pages dynamically.
    </p>
  </div>
);

export const AdminMediaPage = () => (
  <div className="bg-[var(--admin-card)] p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-16 h-16 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center mb-4">
      <ImageIcon size={32} />
    </div>
    <h2 className="text-2xl font-serif text-gray-900 mb-2">Media Library</h2>
    <p className="text-[var(--admin-text-secondary)] max-w-sm">
      Upload and manage high-resolution images for products, banners, and blog posts.
    </p>
  </div>
);

export const AdminSettingsPage = () => (
  <div className="bg-[var(--admin-card)] p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-16 h-16 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center mb-4">
      <Settings size={32} />
    </div>
    <h2 className="text-2xl font-serif text-gray-900 mb-2">Store Settings</h2>
    <p className="text-[var(--admin-text-secondary)] max-w-sm">
      Manage shipping rates, tax configurations, admin users, and global API keys.
    </p>
  </div>
);


