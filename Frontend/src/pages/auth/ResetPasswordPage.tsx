import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authService } from '../../api/services/auth.service';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email') || '';
    const otp = searchParams.get('otp') || '';
    const bypass = searchParams.get('bypass') === 'true';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            // If bypass is true, we send a dummy OTP or handle it as per backend instruction
            // In our backend logic, resetPassword checks setting. If setting disabled, it skips verifyOTP.
            const otpToSubmit = bypass ? 'BYPASS' : otp;
            await (authService as any).resetPassword(email, otpToSubmit, newPassword);
            toast.success('Security credentials updated. Proceed to login.');
            navigate('/login');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center text-primary-700 mx-auto mb-4 border border-primary-100">
                    <Shield size={32} />
                </div>
                <h1 className="text-3xl font-serif text-primary-950 mb-2">New Password</h1>
                <p className="text-gray-600 text-sm max-w-xs mx-auto">
                    Secure your account with a high-entropy passphrase.
                </p>
            </div>

            <form onSubmit={handleReset} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password *</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
                            placeholder="Min 6 characters"
                            required
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-gray-400" />
                        </div>
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-700"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
                            placeholder="Repeat new password"
                            required
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-gray-400" />
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary-950 text-white font-bold uppercase tracking-widest py-4 rounded hover:bg-primary-800 transition-colors shadow-soft disabled:opacity-70 flex justify-center items-center"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <span className="flex items-center tracking-widest uppercase">Update Password <ArrowRight className="ml-2" size={16} /></span>
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <Link to="/login" className="text-xs text-gray-400 hover:text-gray-600 underline">
                    Cancel and Return to Login
                </Link>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
