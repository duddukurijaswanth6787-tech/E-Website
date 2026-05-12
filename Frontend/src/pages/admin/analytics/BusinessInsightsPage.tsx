import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, 
  ArrowDownRight, Download, Activity, 
  CheckCircle, AlertCircle, RefreshCcw
} from 'lucide-react';
import api from '../../../api/client';
import { format } from 'date-fns';



const BusinessInsightsPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.get('/analytics/executive-insights');
        setData(res.data.data);
      } catch (error) {
        console.error('Failed to fetch insights:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [timeRange]);

  const handleExport = async (type: 'orders' | 'customers') => {
    try {
      const response = await api.get(`/analytics/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Failed to export ${type}:`, error);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const stats = [
    { label: 'Total Revenue', value: `₹${data?.financials?.reduce((acc: any, curr: any) => acc + curr.revenue, 0).toLocaleString() || 0}`, icon: DollarSign, trend: '+12.5%', trendUp: true, color: 'blue' },
    { label: 'Total Orders', value: data?.financials?.reduce((acc: any, curr: any) => acc + curr.orders, 0) || 0, icon: ShoppingBag, trend: '+8.2%', trendUp: true, color: 'emerald' },
    { label: 'Avg Order Value', value: `₹${Math.round(data?.financials?.[0]?.avgOrderValue || 0).toLocaleString()}`, icon: Activity, trend: '-2.1%', trendUp: false, color: 'amber' },
    { label: 'Customer Retention', value: `${data?.retention?.retentionRate || 0}%`, icon: Users, trend: '+5.4%', trendUp: true, color: 'purple' },
  ];

  return (
    <div className="p-8 bg-gray-50/50 dark:bg-gray-950/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Business Intelligence</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Enterprise Analytics & Operational Reports</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-gray-900 p-1 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeRange === range 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button 
            onClick={() => handleExport('orders')}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            <Download size={14} /> Export Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-${stat.color}-500/10 transition-all duration-500`} />
            <div className="flex items-center justify-between mb-4 relative">
              <div className={`p-3 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-2xl`}>
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</h3>
            <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Revenue Growth Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Revenue Analysis</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Growth performance over time</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl">
              <TrendingUp size={20} className="text-blue-500" />
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.financials}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(val) => format(new Date(val), 'MMM d')}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">Conversion Funnel</h3>
          <div className="space-y-6">
            {data?.funnel?.map((step: any, idx: number) => (
              <div key={idx} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{step.stage}</span>
                  <span className="text-[10px] font-black text-blue-600 uppercase">{step.count} Units</span>
                </div>
                <div className="h-4 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${step.percentage}%` }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                  />
                </div>
                <div className="mt-1 text-right">
                  <span className="text-[9px] font-black text-gray-400 uppercase">{step.percentage}% Rate</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Optimization Tip</h4>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              Your "Add to Cart" to "Successful Order" conversion is at {data?.funnel?.[2]?.percentage}%. Consider abandoned cart recovery automation.
            </p>
          </div>
        </div>
      </div>

      {/* Operational Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Workforce Productivity */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-purple-500/10 text-purple-500 rounded-[24px]">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight">Workforce Productivity</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Production line efficiency</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-3xl">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Completion Time</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                {Math.round(data?.workforce?.avgCompletionDays || 0)} Days
              </p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-3xl">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">On-Time Delivery</p>
              <p className="text-2xl font-black text-emerald-500 tracking-tighter">
                {Math.round((data?.workforce?.onTimeRate || 0) * 100)}%
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
              <div className="flex items-center gap-3">
                <CheckCircle size={18} className="text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Total Tasks Handled</span>
              </div>
              <span className="text-lg font-black text-emerald-700">{data?.workforce?.totalTasks || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} className="text-rose-500" />
                <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Active Delays</span>
              </div>
              <span className="text-lg font-black text-rose-700">{data?.workforce?.delayedTasks || 0}</span>
            </div>
          </div>
        </div>

        {/* Retention Analysis */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-amber-500/10 text-amber-500 rounded-[24px]">
              <RefreshCcw size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight">Customer Retention</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Loyalty and repeat behavior</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-[200px] h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Repeat', value: data?.retention?.repeat },
                      { name: 'New', value: data?.retention?.new }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Repeat Customers</span>
                </div>
                <span className="text-sm font-black text-gray-900 dark:text-white">{data?.retention?.repeat || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">New Customers</span>
                </div>
                <span className="text-sm font-black text-gray-900 dark:text-white">{data?.retention?.new || 0}</span>
              </div>
              <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">Retention Rate</span>
                  <span className="text-2xl font-black text-blue-600 tracking-tighter">{data?.retention?.retentionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInsightsPage;
