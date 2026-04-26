import { useEffect, useState } from 'react';
import { Users, ShoppingBag, TrendingUp, Package, IndianRupee, AlertCircle } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { analyticsService } from '../../api/services/analytics.service';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [hasLiveMetrics, setHasLiveMetrics] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
    recentOrders: [] as any[],
    pendingBlouseRequests: 0,
    lowStockProducts: 0,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
       try {
         const metricsRes = await analyticsService.getDashboardMetrics();
         const m = (metricsRes as any)?.data;

         setDashboardData({
           revenue: Number(m?.totalRevenue ?? 0),
           orders: Number(m?.totalOrders ?? 0),
           customers: Number(m?.totalUsers ?? 0),
           products: Number(m?.totalProducts ?? 0),
           recentOrders: Array.isArray(m?.recentOrders) ? m.recentOrders.slice(0, 5) : [],
           pendingBlouseRequests: Number(m?.pendingBlouseRequests ?? 0),
           lowStockProducts: Number(m?.lowStockProducts ?? 0),
         });
         setHasLiveMetrics(true);
       } catch (e) {
         // No backend metrics yet (or unauthorized) — show empty/real defaults instead of fake demo numbers.
         setHasLiveMetrics(false);
         setDashboardData({
           revenue: 0,
           orders: 0,
           customers: 0,
           products: 0,
           recentOrders: [],
           pendingBlouseRequests: 0,
           lowStockProducts: 0,
         });
       } finally {
         setLoading(false);
       }
    };
    fetchDashboard();
  }, []);

  const stats = [
    { label: 'Total Revenue', value: `₹${dashboardData.revenue.toLocaleString('en-IN')}`, increase: hasLiveMetrics ? 'Live' : 'No data', icon: <IndianRupee size={24} className="text-primary-700" /> },
    { label: 'Active Orders', value: dashboardData.orders, increase: hasLiveMetrics ? 'Live' : 'No data', icon: <ShoppingBag size={24} className="text-primary-700" /> },
    { label: 'Total Customers', value: dashboardData.customers, increase: hasLiveMetrics ? 'Live' : 'No data', icon: <Users size={24} className="text-primary-700" /> },
    { label: 'Products', value: dashboardData.products, increase: hasLiveMetrics ? 'Live' : 'No data', icon: <Package size={24} className="text-primary-700" /> },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1">Overview Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back. Here is what's happening with your store today.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 flex items-start justify-between transition-all hover:shadow-md hover:border-primary-100 group">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <div className="flex items-center mt-2 text-sm text-green-600 font-medium">
                <TrendingUp size={14} className="mr-1" />
                <span>{stat.increase}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100/50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              Recent Orders
            </h3>
            <button className="text-[0.65rem] font-black text-primary-700 hover:text-primary-800 tracking-widest uppercase px-3 py-1 bg-primary-50 rounded-full transition-colors">View All</button>
          </div>
          <div className="flex-grow">
            <DataTable 
               embedded
               searchable={false}
               columns={[
                 { header: 'Order ID', accessor: (row: any) => <span className="font-medium text-primary-900">#{row._id ? row._id.substring(0,8).toUpperCase() : row.id}</span> },
                 { header: 'Date', accessor: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : row.date },
                 { header: 'Amount', accessor: (row: any) => `₹${row.totalAmount ? row.totalAmount.toLocaleString('en-IN') : row.amount}` },
                 { header: 'Status', accessor: (row: any) => {
                     const status = row.orderStatus || row.status;
                     const colors: Record<string, string> = {
                        DELIVERED: 'bg-green-50 text-green-800 border-green-200',
                        PROCESSING: 'bg-blue-50 text-blue-800 border-blue-200',
                        default: 'bg-yellow-50 text-yellow-800 border-yellow-200'
                     };
                     const colorClasses = colors[status] || colors.default;
                     return <span className={`px-2.5 py-1 rounded border text-[0.6rem] font-bold tracking-widest uppercase ${colorClasses}`}>{status}</span>;
                 }}
               ]} 
               data={dashboardData.recentOrders}
               loading={loading}
            />
          </div>
        </div>

        {/* Quick Actions / Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <AlertCircle size={20} className="mr-2 text-primary-700" /> Critical Pulse
          </h3>
          <div className="space-y-4 px-2">
            <div className="flex items-start space-x-3 p-4 bg-red-50/50 rounded-xl border border-red-100 text-sm transition-all hover:bg-red-50 hover:shadow-sm">
              <AlertCircle className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-black text-red-900 text-[0.65rem] tracking-widest uppercase">Custom Blouse Request</p>
                <p className="text-red-700 mt-1 leading-relaxed">
                  {dashboardData.pendingBlouseRequests > 0
                    ? `${dashboardData.pendingBlouseRequests} request(s) waiting for design approval.`
                    : 'No pending requests.'}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-yellow-50/50 rounded-xl border border-yellow-100 text-sm transition-all hover:bg-yellow-50 hover:shadow-sm">
              <AlertCircle className="w-5 h-5 mt-0.5 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="font-black text-yellow-900 text-[0.65rem] tracking-widest uppercase">Low Stock Alert</p>
                <p className="text-yellow-700 mt-1 leading-relaxed">
                  {dashboardData.lowStockProducts > 0
                    ? `${dashboardData.lowStockProducts} product(s) are low on stock.`
                    : 'No low-stock alerts.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
