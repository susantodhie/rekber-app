import React, { useState } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('masuk');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    setFormData({ name: '', email: '', password: '' });
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        console.error('Invalid JSON response:', text);
        throw new Error('Terjadi kesalahan pada server (Respons tidak valid).');
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Terjadi kesalahan saat registrasi.');
      }

      setSuccess('Registrasi berhasil! Silakan masuk dengan akun Anda.');
      setTimeout(() => {
        handleTabSwitch('masuk');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    // Assuming you'd want a similar login stub to ensure it's not totally broken
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        console.error('Invalid JSON response:', text);
        throw new Error('Terjadi kesalahan pada server (Respons tidak valid).');
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login gagal.');
      }

      setSuccess('Login berhasil! Mengalihkan...');
      // Usually redirect here
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (activeTab === 'daftar') {
      handleRegister(e);
    } else {
      handleLogin(e);
    }
  };

  return (
    <>
      {/* Top Navigation */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 z-50 pointer-events-none">
        <div className="flex flex-col pointer-events-auto">
          <h1 className="text-2xl font-black tracking-tighter text-teal-400 dark:text-teal-300 font-headline">Rekberinsaja.com</h1>
          <span className="text-[10px] font-['JetBrains_Mono'] tracking-[0.2em] uppercase text-secondary/60 -mt-1">The Digital Vault</span>
        </div>
        <div className="flex gap-4 pointer-events-auto">
          <button title="Help" className="material-symbols-outlined text-slate-400 hover:text-teal-300 transition-colors cursor-pointer">help</button>
          <button title="Language" className="material-symbols-outlined text-slate-400 hover:text-teal-300 transition-colors cursor-pointer">language</button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="relative z-10 w-full max-w-md px-6 py-12 mx-auto mt-16 md:mt-0 min-h-screen flex items-center justify-center pointer-events-auto">
        {/* Central Login Card */}
        <div className="glass-panel rounded-xl shadow-2xl overflow-hidden outline outline-1 outline-outline-variant/20 p-8 w-full max-w-md bg-surface-container/90 relative z-20">
          {/* Auth Tabs */}
          <div className="flex mb-8 gap-4">
            <button 
              onClick={() => handleTabSwitch('masuk')}
              className={`flex-1 pb-3 text-sm font-bold tracking-widest uppercase border-b-2 transition-all ${
                activeTab === 'masuk' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant/40 hover:text-on-surface-variant'
              }`}
            >
              Masuk
            </button>
            <button 
              onClick={() => handleTabSwitch('daftar')}
              className={`flex-1 pb-3 text-sm font-bold tracking-widest uppercase border-b-2 transition-all ${
                activeTab === 'daftar' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant/40 hover:text-on-surface-variant'
              }`}
            >
              Daftar
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-xs font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-teal-400/10 border border-teal-400/20 rounded-lg text-teal-400 text-xs font-medium">
                {success}
              </div>
            )}

            {activeTab === 'daftar' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-widest text-on-surface-variant uppercase ml-1">Nama Lengkap</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline-variant group-focus-within:text-secondary transition-colors">person</span>
                  </div>
                  <input 
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all placeholder:text-on-surface-variant/30" 
                    placeholder="Nama Lengkap Anda" 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-widest text-on-surface-variant uppercase ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant group-focus-within:text-secondary transition-colors">alternate_email</span>
                </div>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all placeholder:text-on-surface-variant/30" 
                  placeholder="nama@email.com" 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-xs font-semibold tracking-widest text-on-surface-variant uppercase">Password</label>
                {activeTab === 'masuk' && (
                  <button type="button" className="text-[10px] font-bold text-secondary/60 hover:text-secondary uppercase tracking-tighter transition-colors">Lupa Password?</button>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant group-focus-within:text-secondary transition-colors">lock</span>
                </div>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-4 pl-12 pr-12 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all placeholder:text-on-surface-variant/30" 
                  placeholder="••••••••" 
                  type={showPassword ? 'text' : 'password'} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer">
                  <span className={`material-symbols-outlined transition-colors ${showPassword ? 'text-secondary' : 'text-outline-variant hover:text-on-surface'}`}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Primary CTA */}
            <button disabled={loading} type="submit" className="w-full py-4 mt-2 bg-gradient-to-r from-primary-container to-secondary-container rounded-lg text-on-primary font-black tracking-[0.2em] text-sm uppercase shadow-[0_0_20px_rgba(68,229,194,0.3)] hover:shadow-[0_0_30px_rgba(68,229,194,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'MEMPROSES...' : (activeTab === 'masuk' ? 'MASUK' : 'DAFTAR SEKARANG')}
              {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
            </button>

            {activeTab === 'masuk' && (
              <>
                {/* Social Divider */}
                <div className="flex items-center gap-4 py-2">
                  <div className="h-[1px] flex-1 bg-outline-variant/20"></div>
                  <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">atau masuk dengan</span>
                  <div className="h-[1px] flex-1 bg-outline-variant/20"></div>
                </div>

                {/* Social Actions */}
                <div className="grid grid-cols-3 gap-3">
                  <button type="button" onClick={() => console.log('Google login')} className="flex items-center justify-center py-3 bg-surface-container-high rounded-lg hover:bg-surface-container-highest border border-outline-variant/10 transition-colors">
                    <img alt="Google" className="w-5 h-5 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGxOtkkWi4eY6yShTXo83fbll8m2e4mV3Ulw_AfvtPnnCs4-gLrz9-jKfAMLP9sw_pbMes597-EYQ09g3K_bZO3OeLqqslMV9vFNNOryf7Glrq6PgR3ppucGJjYE0j0XCr1WKMFdAkDCDuEk96lasaR01or8ESVbk9uDml3UQDgwqVE-6aMBLYLbQv6i5N5y7bC5SajqSjHPzt8UJUqbZ8a-u5D9FXsIS954jX1q8T8GtjmZNefMCZOGZhapuKHZBSAdR8utD6Qxw" />
                  </button>
                  <button type="button" onClick={() => console.log('Apple login')} className="flex items-center justify-center py-3 bg-surface-container-high rounded-lg hover:bg-surface-container-highest border border-outline-variant/10 transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant/70" style={{fontVariationSettings: "'FILL' 1"}}>ios</span>
                  </button>
                  <button type="button" onClick={() => console.log('Social login')} className="flex items-center justify-center py-3 bg-surface-container-high rounded-lg hover:bg-surface-container-highest border border-outline-variant/10 transition-colors">
                    <span className="material-symbols-outlined text-blue-400" style={{fontVariationSettings: "'FILL' 1"}}>social_leaderboard</span>
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Card Footer */}
          <div className="mt-8 pt-6 border-t border-outline-variant/10 text-center relative z-30">
            {activeTab === 'masuk' ? (
              <p className="text-xs text-on-surface-variant/60 font-medium">
                Belum punya akun? 
                <button onClick={() => handleTabSwitch('daftar')} className="text-secondary font-bold hover:underline transition-all decoration-secondary/30 underline-offset-4 ml-1">Daftar Sekarang</button>
              </p>
            ) : (
              <p className="text-xs text-on-surface-variant/60 font-medium">
                Sudah punya akun? 
                <button onClick={() => handleTabSwitch('masuk')} className="text-secondary font-bold hover:underline transition-all decoration-secondary/30 underline-offset-4 ml-1">Masuk</button>
              </p>
            )}
          </div>
        </div>

        {/* Trust Badge */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 mt-8 flex items-center justify-center gap-2 text-[10px] font-['JetBrains_Mono'] text-on-surface-variant/40 uppercase tracking-widest pointer-events-none">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          Sistem Keamanan Berlapis Aktif
        </div>
      </main>

      {/* Visual Accents - Ensure pointer-events-none so they don't block clicks */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full flex flex-col md:flex-row justify-between items-center px-8 py-6 z-50 text-slate-500 font-['Inter'] text-xs uppercase tracking-widest pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="text-teal-400 font-bold">REKBERINSAJA</span>
          <span className="hidden md:inline opacity-30">|</span>
          <p>© 2024 Rekberinsaja.com. Secured by Digital Vault.</p>
        </div>
        <div className="flex gap-6 mt-4 md:mt-0 pointer-events-auto">
          <a className="hover:text-teal-300 transition-all opacity-80 hover:opacity-100 cursor-pointer" href="#">Privacy Policy</a>
          <a className="hover:text-teal-300 transition-all opacity-80 hover:opacity-100 cursor-pointer" href="#">Terms of Service</a>
          <a className="hover:text-teal-300 transition-all opacity-80 hover:opacity-100 cursor-pointer" href="#">Security Architecture</a>
        </div>
      </footer>
    </>
  )
}

export default App
