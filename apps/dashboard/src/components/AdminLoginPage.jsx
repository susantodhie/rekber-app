import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signOut } from '../lib/authClient';
import * as userService from '../services/userService';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || 'Login failed. Check your credentials.');
        setLoading(false);
        return;
      }

      // Check role
      try {
        const profileRes = await userService.getMyProfile();
        const profile = profileRes.data;
        
        if (profile.role === 'admin') {
          navigate('/admin/kyc', { replace: true });
        } else {
          await signOut();
          setError('Access denied. Admin privileges required.');
        }
      } catch (profileErr) {
        await signOut();
        setError('Error verifying access level.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      if (!error && loading) setLoading(false);
    }
  };

  return (
    <div className="bg-[#0b1325] font-body text-on-surface selection:bg-primary selection:text-on-primary min-h-screen flex flex-col overflow-x-hidden">
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 z-50 bg-transparent border-b border-surface-container/30 backdrop-blur-md">
        <div className="text-xl font-black tracking-tighter text-error font-headline uppercase">
          Rekberinsaja <span className="opacity-60 text-sm">Admin Portal</span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center pt-24 pb-20 px-4">
        <div className="relative w-full max-w-[420px]">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-error/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="glass-card shadow-lg shadow-black/50 border border-error/20 rounded-2xl p-8 md:p-10 relative z-10 bg-[#131b2d]/80">
            <div className="text-center mb-8">
              <span className="material-symbols-outlined text-4xl text-error mb-2 drop-shadow-[0_0_15px_rgba(255,82,82,0.3)]">admin_panel_settings</span>
              <h1 className="text-2xl font-black tracking-tighter text-on-surface font-headline uppercase">Admin Login</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-error mt-1 font-bold">Secure Access Only</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-xl text-error text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">warning</span>
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Admin Email</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-error transition-colors text-lg">mail</span>
                  <input
                    className="w-full bg-[#0b1325] border border-surface-container rounded-xl py-3.5 pl-12 pr-4 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-error/50 focus:border-error transition-all placeholder:text-slate-700"
                    placeholder="admin@rekber.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Password</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-error transition-colors text-lg">lock</span>
                  <input
                    className="w-full bg-[#0b1325] border border-surface-container rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-error/50 focus:border-error transition-all placeholder:text-slate-700"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 rounded-xl bg-error/20 border border-error text-error font-black text-xs tracking-widest uppercase hover:bg-error hover:text-white hover:shadow-[0_0_20px_rgba(255,82,82,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">login</span>
                    SECURE LOGIN
                  </>
                )}
              </button>
            </form>
            
            <button 
              onClick={() => navigate('/login')} 
              className="mt-6 w-full text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[10px]">arrow_back</span>
              Back to User Login
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
