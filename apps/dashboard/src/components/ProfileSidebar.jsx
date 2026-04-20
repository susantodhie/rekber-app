import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ProfileSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Highlight menu based on current path
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <aside className="hidden md:flex flex-col sticky left-0 top-20 p-4 h-[calc(100vh-5rem)] w-[260px] border-r border-[#3c4a45]/20 bg-[#0b1325] z-40">
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
        </div>
        <div>
          <h3 className="font-['Inter'] font-black text-[#00c9a7] text-sm leading-tight">Rekberinsaja</h3>
          <p className="text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-[#00c9a7] to-[#44e5c2] bg-clip-text text-transparent mt-0.5">Aman Dulu, Baru Deal.</p>
        </div>
      </div>
      
      <nav className="space-y-1 flex-1">
        <button onClick={() => navigate('/transactions')} className={`w-full flex items-center gap-3 px-4 py-3 font-['Inter'] text-sm transition-all duration-300 ease-in-out rounded-lg group ${isActive('/transactions') && location.pathname !== '/transactions/new' ? 'text-[#00c9a7] bg-[#171f32] border-l-4 border-[#00c9a7] font-bold' : 'text-[#bacac3] font-medium opacity-70 hover:bg-[#171f32] hover:text-[#a2e7ff]'}`}>
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">security</span> Transaksi Escrow
        </button>

        <button onClick={() => navigate('/transactions')} className={`w-full flex items-center gap-3 px-4 py-3 font-['Inter'] text-sm transition-all duration-300 ease-in-out rounded-lg group text-[#bacac3] font-medium opacity-70 hover:bg-[#171f32] hover:text-[#a2e7ff]`}>
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">swap_horiz</span> Riwayat Transaksi
        </button>

        <button onClick={() => navigate('/kyc')} className={`w-full flex items-center gap-3 px-4 py-3 font-['Inter'] text-sm transition-all duration-300 ease-in-out rounded-lg group ${isActive('/kyc') ? 'text-[#00c9a7] bg-[#171f32] border-l-4 border-[#00c9a7] font-bold' : 'text-[#bacac3] font-medium opacity-70 hover:bg-[#171f32] hover:text-[#a2e7ff]'}`}>
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">verified_user</span> Pusat Verifikasi (KYC)
        </button>

        <button onClick={() => navigate('/profile')} className={`w-full flex items-center gap-3 px-4 py-3 font-['Inter'] text-sm transition-all duration-300 ease-in-out rounded-lg group ${isActive('/profile') ? 'text-[#00c9a7] bg-[#171f32] border-l-4 border-[#00c9a7] font-bold' : 'text-[#bacac3] font-medium opacity-70 hover:bg-[#171f32] hover:text-[#a2e7ff]'}`}>
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">lock</span> Keamanan
        </button>

        <button onClick={() => navigate('/profile')} className={`w-full flex items-center gap-3 px-4 py-3 font-['Inter'] text-sm transition-all duration-300 ease-in-out rounded-lg group text-[#bacac3] font-medium opacity-70 hover:bg-[#171f32] hover:text-[#a2e7ff]`}>
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">settings</span> Pengaturan
        </button>
      </nav>
      
      <button onClick={() => navigate('/transactions/new')} className="mt-auto mx-2 bg-gradient-to-br from-primary-container to-secondary-container text-on-primary py-3 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-primary/20 hover:brightness-110">
        Buat Transaksi
      </button>
    </aside>
  );
};

export default ProfileSidebar;
