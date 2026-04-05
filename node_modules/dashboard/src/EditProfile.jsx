import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopAppBar from './components/TopAppBar';
import MobileBottomNav from './components/MobileBottomNav';
import { useMyProfile, useUpdateProfile, useSetPin } from './hooks/useUser';

const EditProfile = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useMyProfile();
  const updateMutation = useUpdateProfile();
  const pinMutation = useSetPin();

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    phone: '',
  });

  const [pinData, setPinData] = useState({
    pin: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Sync profile data once loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        fullName: profile.fullName || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateMutation.mutateAsync(formData);
      setMessage('Profil berhasil diperbarui');
    } catch (err) {
      setError(err?.error || err?.message || 'Gagal memperbarui profil');
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (pinData.pin.length !== 6) {
      setError('PIN harus 6 digit');
      return;
    }
    
    try {
      await pinMutation.mutateAsync(pinData.pin);
      setMessage('PIN Transaksi berhasil diatur');
      setPinData({ pin: '' });
    } catch (err) {
      setError(err?.error || err?.message || 'Gagal mengatur PIN');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b1325]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#0b1325] text-on-surface">
      <Sidebar />
      <main className="flex-1 md:ml-[260px] min-h-screen pb-24 md:pb-12 overflow-y-auto">
        <TopAppBar />
        
        <div className="px-6 py-8 max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/profile')} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h2 className="text-3xl font-black text-on-surface tracking-tight">Edit Profil</h2>
              <p className="text-sm text-on-surface-variant">Perbarui informasi dasar dan keamanan akun</p>
            </div>
          </div>

          {message && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary font-bold text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error font-bold text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* General Profile Section */}
            <div className="glass-card p-8 rounded-3xl border border-surface-container">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                Informasi Dasar
              </h3>
              
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 mb-2">Nama Lengkap</label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-3 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 mb-2">Username</label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-3 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 mb-2">Nomor Telepon</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="08123456789"
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-3 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </form>
            </div>

            {/* Security Section */}
            <div className="glass-card p-8 rounded-3xl border border-surface-container h-fit">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">lock</span>
                Keamanan
              </h3>
              
              <form onSubmit={handlePinSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 mb-2">Atur Ulang PIN Transaksi</label>
                  <p className="text-xs text-on-surface-variant mb-4">Gunakan 6 digit angka untuk mengamankan transaksi Anda.</p>
                  <input
                    type="password"
                    maxLength={6}
                    value={pinData.pin}
                    onChange={(e) => setPinData({ pin: e.target.value.replace(/\D/g, '') })}
                    placeholder="••••••"
                    className="w-full tracking-[1em] text-center bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-3 text-2xl font-mono font-bold text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={pinMutation.isPending || pinData.pin.length !== 6}
                  className="w-full bg-surface-container-highest border border-outline-variant/20 hover:border-primary/50 text-on-surface py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50"
                >
                  {pinMutation.isPending ? 'Menyimpan...' : 'Simpan PIN Baru'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default EditProfile;
