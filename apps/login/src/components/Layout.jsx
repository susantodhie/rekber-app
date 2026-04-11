import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const Layout = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/', { replace: true });
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Transactions', path: '/transactions', icon: 'list_alt' },
    { name: 'Create Transaction', path: '/create-transaction', icon: 'add_circle' },
  ];

  return (
    <div className="flex w-full h-screen bg-surface text-on-surface font-body overflow-hidden">
      {/* Sidebar - hidden on very small screens, or responsive */}
      <aside className="w-16 md:w-64 flex-shrink-0 bg-surface-container border-r border-outline-variant/20 flex flex-col z-20 shadow-2xl transition-all duration-300 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20 flex flex-col items-center">
          <h1 className="text-xl font-black tracking-tighter text-teal-400 font-headline">Rekberinsaja.com</h1>
          <span className="text-[10px] font-['JetBrains_Mono'] tracking-[0.2em] uppercase text-secondary/60">Digital Vault</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(68,229,194,0.15)] bg-gradient-to-r from-primary/10 to-transparent'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border border-transparent'
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm tracking-wide hidden md:block">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-outline-variant/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-all font-medium text-sm"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="hidden md:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-outline-variant/10 bg-surface/50 backdrop-blur-md z-20">
          <div className="flex items-center text-xl font-headline font-bold text-on-surface">Area Member</div>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-outline hover:text-primary transition-colors cursor-pointer">notifications</button>
            <div className="h-6 w-[1px] bg-outline-variant/30"></div>
            <div className="flex items-center gap-3">
              <div className="text-right flex flex-col justify-center">
                <span className="text-sm font-bold text-on-surface leading-tight">{userName}</span>
                <span className="text-[10px] text-primary uppercase tracking-widest font-bold leading-tight">Verified</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_10px_rgba(68,229,194,0.3)]">
                <span className="material-symbols-outlined text-surface-container-lowest text-sm font-bold">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
