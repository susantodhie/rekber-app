import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: 'home', label: 'Beranda', path: '/' },
    { icon: 'swap_horiz', label: 'Transaksi', path: '/transactions' },
    { icon: 'chat', label: 'Pesan', path: '/messages' },
    { icon: 'person', label: 'Akun', path: '/profile' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-[#0b1325]/90 backdrop-blur-lg z-50 rounded-t-3xl border-t border-[#3c4a45]/20 md:hidden shadow-[0_-10px_30px_rgba(0,201,167,0.1)]">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`flex flex-col items-center justify-center transition-all p-2 rounded-xl min-w-[48px] ${
            isActive(item.path)
              ? 'text-[#44e5c2] bg-[#44e5c2]/10 scale-95'
              : 'text-slate-500 active:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="font-sans text-[10px] uppercase font-bold tracking-widest mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
