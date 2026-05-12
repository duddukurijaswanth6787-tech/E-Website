import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Trash2, 
  Clock, 
  RefreshCcw, 
  Database, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Settings2,
  Save,
  Zap
} from 'lucide-react';
import api from '../../../api/client';
import { GlassCard } from '../../../components/common/GlassCard';
import { toast } from 'react-hot-toast';

const RetentionSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [purging, setPurging] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/marketing/retention/settings');
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch retention settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/marketing/retention/settings', data.settings);
      toast.success('Retention settings updated');
      fetchSettings();
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const triggerCleanup = async () => {
    if (!window.confirm('Trigger manual cleanup of expired records?')) return;
    try {
      const res = await api.post('/marketing/retention/cleanup');
      toast.success(`Cleanup complete. Deleted ${res.data.data.deletedCount} records.`);
      fetchSettings();
    } catch (error) {
      toast.error('Cleanup failed');
    }
  };

  const emergencyPurge = async () => {
    if (!window.confirm('CRITICAL ACTION: This will delete ALL temporary activity records regardless of expiration. Proceed?')) return;
    setPurging(true);
    try {
      const res = await api.post('/marketing/retention/emergency-purge');
      toast.success(`Emergency purge complete. Cleared ${res.data.data.deletedCount} records.`);
      fetchSettings();
    } catch (error) {
      toast.error('Purge failed');
    } finally {
      setPurging(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <RefreshCcw className="animate-spin text-blue-500" size={32} />
    </div>
  );

  const { settings, metrics } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[var(--admin-text-primary)] tracking-tighter uppercase">
            Data Lifecycle & <span className="text-blue-500">Retention</span>
          </h1>
          <p className="text-[var(--admin-text-secondary)] text-sm font-medium mt-1 uppercase tracking-widest">
            Manage temporary social activity and storage optimization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={triggerCleanup}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <RefreshCcw size={14} /> Run Cleanup
          </button>
          <button 
            onClick={emergencyPurge}
            disabled={purging}
            className="px-6 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2"
          >
            <Trash2 size={14} /> {purging ? 'Purging...' : 'Emergency Purge'}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <Database size={20} />
            </div>
            <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">Total</span>
          </div>
          <h3 className="text-2xl font-black text-[var(--admin-text-primary)]">{metrics.totalCount}</h3>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-1 uppercase tracking-widest font-bold">Active Records</p>
        </GlassCard>

        <GlassCard className="p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">Expired</span>
          </div>
          <h3 className="text-2xl font-black text-[var(--admin-text-primary)]">{metrics.expiredCount}</h3>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-1 uppercase tracking-widest font-bold">Pending Deletion</p>
        </GlassCard>

        <GlassCard className="p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <CheckCircle size={20} />
            </div>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">Status</span>
          </div>
          <h3 className="text-lg font-black text-[var(--admin-text-primary)] uppercase tracking-tighter">
            {settings.enableAutoDelete ? 'Auto-Active' : 'Manual Only'}
          </h3>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-1 uppercase tracking-widest font-bold">Deletion Engine</p>
        </GlassCard>

        <GlassCard className="p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
              <BarChart3 size={20} />
            </div>
            <span className="text-[10px] font-black text-purple-500 bg-purple-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">Modules</span>
          </div>
          <h3 className="text-2xl font-black text-[var(--admin-text-primary)]">{metrics.moduleStats.length}</h3>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-1 uppercase tracking-widest font-bold">Active Module Pools</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                <Settings2 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[var(--admin-text-primary)] uppercase tracking-tighter">Retention Configuration</h2>
                <p className="text-xs text-[var(--admin-text-secondary)] uppercase tracking-widest font-bold">Customize how long temporary data persists</p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div>
                  <h4 className="text-sm font-black text-[var(--admin-text-primary)] uppercase tracking-tight">Enable Automatic Deletion</h4>
                  <p className="text-[10px] text-[var(--admin-text-secondary)] uppercase tracking-widest font-bold">Background jobs will purge expired records daily</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setData({ ...data, settings: { ...settings, enableAutoDelete: !settings.enableAutoDelete } })}
                  className={`w-12 h-6 rounded-full relative transition-all ${settings.enableAutoDelete ? 'bg-blue-600' : 'bg-white/10'}`}
                >
                  <motion.div 
                    animate={{ x: settings.enableAutoDelete ? 26 : 2 }}
                    className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-secondary)] mb-2 block">Global Retention Policy</label>
                  <select 
                    value={settings.globalRetentionDays}
                    onChange={(e) => setData({ ...data, settings: { ...settings, globalRetentionDays: parseInt(e.target.value) } })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none"
                  >
                    {[1, 3, 7, 15, 30, 90].map(d => <option key={d} value={d} className="bg-[var(--admin-bg)] text-white">{d} Days</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} /> Module Specific Rules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(settings.moduleSpecific).map(([key, val]) => (
                    <div key={key} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-primary)]">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <select 
                        value={val as number}
                        onChange={(e) => setData({ 
                          ...data, 
                          settings: { 
                            ...settings, 
                            moduleSpecific: { ...settings.moduleSpecific, [key]: parseInt(e.target.value) } 
                          } 
                        })}
                        className="bg-transparent text-blue-500 font-bold text-xs outline-none"
                      >
                        {[1, 3, 7, 15, 30].map(d => <option key={d} value={d} className="bg-[var(--admin-bg)] text-white">{d}d</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <RefreshCcw className="animate-spin" size={14} /> : <Save size={14} />}
                  Save Retention Policy
                </button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <GlassCard className="p-6 bg-rose-500/5 border-rose-500/20">
            <div className="flex items-center gap-3 mb-4 text-rose-500">
              <AlertTriangle size={20} />
              <h4 className="text-xs font-black uppercase tracking-widest">Emergency Zone</h4>
            </div>
            <p className="text-[10px] text-[var(--admin-text-secondary)] font-bold uppercase tracking-widest leading-relaxed mb-6">
              Use these controls to immediately flush all temporary marketing data. This will not affect orders, inventory, or permanent business records.
            </p>
            <button 
              onClick={emergencyPurge}
              className="w-full py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
            >
              Flush All Activities
            </button>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield size={20} className="text-blue-500" />
              <h4 className="text-xs font-black uppercase tracking-widest">Privacy Compliance</h4>
            </div>
            <ul className="space-y-3">
              {[
                'GDPR Compliant Expiration',
                'Automatic TTL Indexing',
                'Anonymous Social Proof',
                'Minimal Data Footprint'
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-widest">
                  <CheckCircle size={12} className="text-emerald-500" /> {item}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default RetentionSettingsPage;
