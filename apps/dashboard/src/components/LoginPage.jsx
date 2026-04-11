import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, useSession } from '../lib/authClient';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect to dashboard
  const { data: session } = useSession();
  React.useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || 'Login gagal. Periksa email dan password Anda.');
      } else {
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary selection:text-on-primary min-h-screen flex flex-col overflow-x-hidden bg-mesh">
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 z-50 bg-transparent">
        <div className="text-2xl font-black tracking-tighter text-teal-400 dark:text-teal-300 font-headline">
          Rekberinsaja.com
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center pt-24 pb-20 px-4">
        <div className="relative w-full max-w-[480px]">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="glass-card ghost-border rounded-3xl p-8 md:p-10 shadow-2xl relative z-10">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black tracking-tighter text-primary font-headline mb-1 uppercase">Rekberinsaja.com</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-mono">The Digital Vault</p>
            </div>

            <div className="flex mb-8 bg-surface-container-lowest/50 p-1 rounded-xl ghost-border">
              <button className="flex-1 py-2.5 text-sm font-bold bg-primary-container text-on-primary-container shadow-lg shadow-primary/20 rounded-lg">Masuk</button>
              <button onClick={() => navigate('/register')} className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:text-on-surface transition-all rounded-lg">Daftar</button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-xs font-medium">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors text-lg pointer-events-none">mail</span>
                  <input
                    className="w-full bg-surface-container-lowest border-0 ghost-border rounded-xl py-4 pl-12 pr-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all placeholder:text-slate-600"
                    placeholder="nama@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Password</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors text-lg pointer-events-none">lock</span>
                  <input
                    className="w-full bg-surface-container-lowest border-0 ghost-border rounded-xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-on-surface-variant hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-black text-sm tracking-widest uppercase shadow-[0_10px_30px_-10px_rgba(68,229,194,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(68,229,194,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'MEMPROSES...' : 'MASUK'}
              </button>
            </form>

            <p className="mt-10 text-center text-xs font-medium text-on-surface-variant">
              Belum punya akun? <a className="text-primary hover:text-secondary transition-colors font-bold ml-1 cursor-pointer" onClick={() => navigate('/register')}>Daftar</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
