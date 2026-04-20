import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import { useSession, authClient, signIn } from '../lib/authClient';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // If already logged in, redirect to dashboard
  const { data: session } = useSession();
  React.useEffect(() => {
    if (session && !success) {
      navigate('/', { replace: true });
    }
  }, [session, navigate, success]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }
    if (!agreed) {
      setError('Anda harus menyetujui Syarat & Ketentuan');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://rekberinsaja-api-production.up.railway.app/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registrasi gagal");
      }



      setSuccess('Registrasi berhasil! Mengalihkan ke Halaman Login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err?.message || err?.error || err?.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary selection:text-on-primary min-h-screen flex flex-col overflow-x-hidden bg-mesh">
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 z-50 bg-transparent">
        <div className="text-2xl font-black tracking-tighter text-teal-400 dark:text-teal-300 font-headline">
          Rekberinsaja.com
        </div>
        <div className="flex gap-4">
          <button className="text-slate-400 hover:text-teal-300 transition-colors scale-95 active:scale-90 flex items-center gap-1 text-sm font-medium">
            <span className="material-symbols-outlined text-lg">language</span>
            Bahasa
          </button>
          <button className="text-slate-400 hover:text-teal-300 transition-colors scale-95 active:scale-90 flex items-center gap-1 text-sm font-medium">
            <span className="material-symbols-outlined text-lg">help</span>
            Bantuan
          </button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center pt-24 pb-20 px-4">
        <div className="relative w-full max-w-[480px]">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="glass-card ghost-border rounded-3xl p-8 md:p-10 shadow-2xl relative z-10">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black tracking-tighter text-primary font-headline mb-1 uppercase">Rekberinsaja.com</h1>
              <p className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-[#00c9a7] to-[#44e5c2] bg-clip-text text-transparent drop-shadow-sm">Aman Dulu, Baru Deal.</p>
            </div>

            <div className="flex mb-8 bg-surface-container-lowest/50 p-1 rounded-xl ghost-border">
              <button onClick={() => navigate('/login')} className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:text-on-surface transition-all rounded-lg">Masuk</button>
              <button className="flex-1 py-2.5 text-sm font-bold bg-primary-container text-on-primary-container shadow-lg shadow-primary/20 rounded-lg">Daftar</button>
            </div>

            <button
              type="button"
              onClick={async () => {
                await signIn.social({
                  provider: 'google',
                  callbackURL: window.location.origin + '/',
                });
              }}
              className="w-full mb-6 flex items-center justify-center gap-3 py-3 px-4 rounded-xl ghost-border bg-surface hover:bg-surface-container transition-colors shadow-sm text-sm font-bold text-on-surface group"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Daftar dengan Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-container ghost-border"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-[#121c2d] px-4 text-on-surface-variant font-bold tracking-widest uppercase">atau dengan email</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-xs font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-xs font-medium">
                {success}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Full Name</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors text-lg pointer-events-none">person</span>
                  <input className="w-full bg-surface-container-lowest border-0 ghost-border rounded-xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all placeholder:text-slate-600" placeholder="Nama Lengkap Anda" type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors text-lg pointer-events-none">mail</span>
                  <input className="w-full bg-surface-container-lowest border-0 ghost-border rounded-xl py-4 pl-12 pr-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all placeholder:text-slate-600" placeholder="nama@email.com" type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Password</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors text-lg pointer-events-none">lock</span>
                    <input className="w-full bg-surface-container-lowest border-0 ghost-border rounded-xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all placeholder:text-slate-600" placeholder="••••••••" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required minLength={8} />
                    <button type="button" onClick={togglePassword} className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-on-surface-variant hover:text-on-surface transition-colors">
                      <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Confirm</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors text-lg pointer-events-none">verified_user</span>
                    <input className="w-full bg-surface-container-lowest border-0 ghost-border rounded-xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all placeholder:text-slate-600" placeholder="••••••••" type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength={8} />
                    <button type="button" onClick={toggleConfirmPassword} className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-on-surface-variant hover:text-on-surface transition-colors">
                      <span className="material-symbols-outlined">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <div className="flex items-center h-5">
                  <input className="w-4 h-4 rounded-sm bg-surface-container-lowest border-outline-variant text-primary focus:ring-primary/40 ring-offset-surface focus:ring-offset-0" id="terms" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                </div>
                <label className="text-xs text-on-surface-variant leading-tight" htmlFor="terms">
                  I agree to the <a className="text-secondary hover:underline" href="#">Terms &amp; Conditions</a> and Privacy Policy of Rekberinsaja.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-black text-sm tracking-widest uppercase shadow-[0_10px_30px_-10px_rgba(68,229,194,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(68,229,194,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'MEMPROSES...' : 'DAFTAR SEKARANG'}
              </button>
            </form>

            <p className="mt-10 text-center text-xs font-medium text-on-surface-variant">
              Sudah punya akun? <a className="text-primary hover:text-secondary transition-colors font-bold ml-1 cursor-pointer" onClick={() => navigate('/login')}>Masuk</a>
            </p>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 w-full flex flex-col md:flex-row justify-between items-center px-8 py-6 z-50 text-slate-500 bg-transparent">
        <div className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500 mb-2 md:mb-0">
          © 2026 Rekberinsaja.com. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500 hover:text-teal-300 transition-all opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
          <a className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500 hover:text-teal-300 transition-all opacity-80 hover:opacity-100" href="#">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};

export default RegisterPage;
