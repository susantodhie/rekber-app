import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from '../lib/authClient';
import { useMyProfile } from '../hooks/useUser';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile } = useMyProfile();

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/' },
    { icon: 'security', label: 'Escrow Deals', path: '/transactions' },
    { icon: 'account_balance_wallet', label: 'Wallet', path: '/wallet' },
    { icon: 'chat_bubble', label: 'Messages', path: '/messages' },
    { icon: 'verified_user', label: 'KYC Center', path: '/kyc' },
  ];

  const adminNavItems = [
    { icon: 'admin_panel_settings', label: 'Admin KYC', path: '/admin/kyc' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-5 left-4 z-[60] p-2 text-[#bacac3] bg-[#1a2333] rounded-lg shadow-lg border border-[#3c4a45]/20 hover:text-[#44e5c2] transition-colors"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-[#0b1325]/80 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <aside className={`fixed left-0 top-0 h-full w-[260px] z-[70] bg-[#131b2d] flex-col border-r border-[#3c4a45]/20 shadow-[4px_0_24px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex`}>
        <div className="p-6 space-y-1 relative">
          <h1 className="text-xl font-black text-[#00c9a7] cursor-pointer" onClick={() => handleNavClick('/')}>Rekberinsaja</h1>
          <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">The Digital Vault</p>
          <button onClick={() => setIsOpen(false)} className="md:hidden absolute top-6 right-4 text-[#bacac3] hover:text-error transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-2 p-6 overflow-y-auto">
          {navItems.map((item) => (
            <div
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`flex items-center gap-4 px-4 py-3 transition-all duration-300 active:opacity-80 cursor-pointer ${isActive(item.path)
                ? 'bg-[#222a3d] text-[#44e5c2] rounded-lg border-l-4 border-[#00c9a7] shadow-[inset_0_0_15px_rgba(68,229,194,0.1)]'
                : 'text-[#bacac3] hover:text-white hover:bg-[#171f32] hover:translate-x-1'
                }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-['Inter'] uppercase tracking-widest text-[11px] font-bold">{item.label}</span>
            </div>
          ))}

          {/* --- Admin Only Links --- */}
          {profile?.role === 'admin' && (
            <>
              <div className="mt-6 mb-2 px-4">
                <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest text-error">Admin Tools</span>
              </div>
              {adminNavItems.map((item) => (
                <div
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex items-center gap-4 px-4 py-3 transition-all duration-300 active:opacity-80 cursor-pointer ${isActive(item.path)
                    ? 'bg-[#222a3d] text-error rounded-lg border-l-4 border-error shadow-[inset_0_0_15px_rgba(255,82,82,0.1)]'
                    : 'text-[#bacac3] hover:text-white hover:bg-[#171f32] hover:translate-x-1'
                    }`}
                >
                  <span className="material-symbols-outlined text-error">{item.icon}</span>
                  <span className="font-['Inter'] uppercase tracking-widest text-[11px] font-bold text-error">{item.label}</span>
                </div>
              ))}
            </>
          )}
        </nav>
        <div className="mt-auto p-6 space-y-2">
          <button
            onClick={() => handleNavClick('/transactions/new')}
            className="w-full bg-primary-container text-on-primary py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all mb-4"
          >
            Start New Escrow
          </button>
          <div onClick={() => handleNavClick('/profile')} className="flex items-center gap-4 text-[#bacac3] px-4 py-3 hover:text-white hover:bg-[#171f32] transition-all cursor-pointer">
            <span className="material-symbols-outlined">person</span>
            <span className="font-['Inter'] uppercase tracking-widest text-[11px] font-bold">Profile</span>
          </div>
          <div onClick={handleLogout} className="flex items-center gap-4 text-[#bacac3] px-4 py-3 hover:text-white hover:bg-[#171f32] transition-all cursor-pointer">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-['Inter'] uppercase tracking-widest text-[11px] font-bold">Logout</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
