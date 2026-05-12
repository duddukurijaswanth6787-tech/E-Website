import { useState, useEffect } from 'react';
import { Shield, Save, RefreshCw, Key } from 'lucide-react';
import { settingsService, type Setting } from '../../api/services/settings.service';
import toast from 'react-hot-toast';

const AdminOTPPage = () => {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await settingsService.getAdminSettings('security');
            if (res.success) {
               // Filter for OTP related keys just in case
               const otpKeys = ['otp_signup_enabled', 'otp_login_enabled', 'otp_forgot_password_enabled', 'otp_admin_login_enabled'];
               const filtered = res.data.filter((s: any) => otpKeys.includes(s.key));
               setSettings(filtered);
            }
        } catch (e) {
            toast.error('Failed to load logical Security Matrix.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const toggleSetting = (key: string) => {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value: !s.value } : s));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = settings.map(s => ({
                key: s.key,
                value: s.value
            }));
            await settingsService.bulkUpsertAdminSettings(updates);
            toast.success('Security Matrix synchronized successfully');
        } catch (e) {
            toast.error('Failed to patch security overrides');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-[100vw] overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center gap-3">
                        <Shield className="w-6 h-6 text-primary-700" /> Identity Verification Gateways
                    </h1>
                    <p className="text-sm text-[var(--admin-text-secondary)]">Configure global OTP (One-Time Password) enforcement across all authentication vectors.</p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <button 
                        onClick={fetchSettings} 
                        disabled={loading}
                        className="p-2 text-gray-400 hover:text-primary-700 hover:bg-[var(--admin-card)] rounded border border-gray-200 shadow-sm transition-all"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={saving || loading}
                        className="flex items-center px-6 py-2.5 bg-primary-950 text-[var(--admin-text-primary)] text-sm font-bold tracking-widest uppercase rounded shadow hover:bg-primary-800 transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        ) : <Save size={16} className="mr-2" />}
                        Commit Changes
                    </button>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm flex items-start shadow-sm mb-6">
                <Shield size={18} className="mr-3 mt-0.5 opacity-70" />
                <div>
                   <span className="font-bold block">Security Notice: 2FA State Propagation</span>
                   Disabling OTP flows reduces security barriers but speeds up user lifecycles. Ensure legal compliance before toggling mandatory verification.
                </div>
            </div>

            {loading ? (
                <div className="py-24 flex justify-center items-center">
                     <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {settings.map((s) => (
                        <div key={s.key} className="bg-[var(--admin-card)] border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between group hover:border-primary-200 transition-all">
                            <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${s.value ? 'bg-primary-50 border-primary-100 text-primary-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                    <Key size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{s.label}</h3>
                                    <p className="text-xs text-[var(--admin-text-secondary)] mt-0.5 leading-relaxed">
                                        {(s as any).description || `Enforces OTP verification for ${s.label.toLowerCase().replace('enable ', '')}.`}
                                    </p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => toggleSetting(s.key)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${s.value ? 'bg-primary-700' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-[var(--admin-card)] transition-transform ${s.value ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {!loading && settings.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-gray-200 rounded-xl bg-[var(--admin-card)]">
                    <Shield size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-[var(--admin-text-secondary)] font-serif text-lg">No OTP Gates registered in the cluster.</p>
                    <button onClick={fetchSettings} className="mt-2 text-primary-700 font-bold uppercase text-xs tracking-widest underline underline-offset-4">Refresh Protocol</button>
                </div>
            )}
        </div>
    );
};

export default AdminOTPPage;


