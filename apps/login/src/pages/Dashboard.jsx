import React from 'react';

const Dashboard = () => {
  const userName = localStorage.getItem('userName') || 'User';
  const mockBalance = "Rp 12.500.000";
  const mockActiveTransactions = 3;

  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline text-on-surface mb-2">Dashboard</h1>
          <p className="text-on-surface-variant text-sm">Welcome back, <span className="text-primary font-semibold">{userName}</span>! Here's your account overview.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 bg-surface-container/70 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mt-10 -mr-10 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold tracking-widest uppercase text-on-surface-variant">Active Balance</h3>
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
            </div>
            <p className="text-3xl font-black font-headline text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 drop-shadow-sm">{mockBalance}</p>
          </div>
        </div>

        {/* Active Transactions Card */}
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 bg-surface-container/70 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -mt-10 -mr-10 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold tracking-widest uppercase text-on-surface-variant">Active Escrows</h3>
              <span className="material-symbols-outlined text-secondary">sync_alt</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-on-surface font-headline">{mockActiveTransactions}</p>
              <span className="text-xs font-bold text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded">+2 this week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity placeholder section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold font-headline mb-4 text-on-surface tracking-wide">Recent Activity</h2>
        <div className="glass-panel p-8 rounded-xl border border-outline-variant/20 bg-surface-container/50 text-center flex flex-col items-center justify-center min-h-[200px]">
           <span className="material-symbols-outlined text-5xl text-outline-variant/50 mb-4">history</span>
           <p className="text-on-surface-variant text-sm font-medium">No recent activity to show.</p>
           <p className="text-xs text-outline-variant mt-1">Your latest transactions will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
