import React from 'react';

const ProfileSidebar = () => {
  return (
    <aside className="hidden md:flex flex-col sticky left-0 top-20 p-4 h-[calc(100vh-5rem)] w-[260px] border-r border-[#3c4a45]/20 bg-[#0b1325] z-40">
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
        </div>
        <div>
          <h3 className="font-['Inter'] font-black text-[#00c9a7] text-sm leading-tight">The Vault</h3>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Secure Escrow</p>
        </div>
      </div>
      
      <nav className="space-y-1 flex-1">
        <a className="flex items-center gap-3 px-4 py-3 font-['Inter'] text-sm font-medium text-[#bacac3] opacity-70 hover:bg-[#171f32] hover:text-[#a2e7ff] transition-all duration-300 ease-in-out rounded-lg group" href="#">
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">account_balance_wallet</span> Vault
        </a>
        <a className="flex items-center gap-3 px-4 py-3 font-['Inter'] text-sm font-medium text-[#bacac3] opacity-70 hover:bg-[#171f32] hover:text-[#a2e7ff] transition-all duration-300 ease-in-out rounded-lg group" href="#">
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">swap_horiz</span> Transactions
        </a>
        <a className="flex items-center gap-3 px-4 py-3 font-['Inter'] text-sm font-medium text-[#bacac3] opacity-70 hover:bg-[#171f32] hover:text-[#a2e7ff] transition-all duration-300 ease-in-out rounded-lg group" href="#">
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">verified_user</span> KYC Center
        </a>
        <a className="flex items-center gap-3 px-4 py-3 font-['Inter'] text-sm font-medium text-[#bacac3] opacity-70 hover:bg-[#171f32] hover:text-[#a2e7ff] transition-all duration-300 ease-in-out rounded-lg group" href="#">
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">lock</span> Security
        </a>
        <a className="flex items-center gap-3 px-4 py-3 font-['Inter'] text-sm font-medium text-[#00c9a7] bg-[#171f32] border-l-4 border-[#00c9a7] font-bold transition-all duration-300 ease-in-out" href="#">
          <span className="material-symbols-outlined">settings</span> Settings
        </a>
      </nav>
      
      <button className="mt-auto mx-2 bg-gradient-to-br from-primary-container to-secondary-container text-on-primary py-3 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-primary/20 hover:brightness-110">
        New Escrow
      </button>
    </aside>
  );
};

export default ProfileSidebar;
