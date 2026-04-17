import React from 'react';
import { useAdminDashboard, useActivityLog } from './hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProfileSidebar from './components/ProfileSidebar';

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useAdminDashboard();
  const { data: activityLog, isLoading: logLoading } = useActivityLog({ page: 1, pageSize: 15 });
  const navigate = useNavigate();

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary selection:text-on-primary min-h-screen flex flex-col md:flex-row shadow-[inset_0_0_100px_rgba(20,255,236,0.03)]">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen relative max-w-full">
        {/* Glow */}
        <div className="fixed top-0 left-[260px] max-w-full w-full h-[600px] bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent blur-[120px] pointer-events-none -z-10 animate-pulse-slow"></div>

        <Header title="Overwatch" subtitle="Admin Control Center" hideWallet />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full z-10 flex gap-8">
          <div className="flex-1 max-w-4xl space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                className="glass-card ghost-border rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all"
                onClick={() => navigate('/admin/transactions')}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00c9a7]/20 flex items-center justify-center text-[#00c9a7]">
                    <span className="material-symbols-outlined">analytics</span>
                  </div>
                </div>
                <h3 className="text-secondary/70 text-xs font-bold uppercase tracking-widest mb-1">Total Escrow</h3>
                {isLoading ? <div className="h-8 bg-white/5 animate-pulse rounded w-16"></div> : (
                  <p className="text-2xl font-black font-headline text-on-surface">{stats?.totalEscrowCount || 0}</p>
                )}
              </div>
              
              <div 
                className="glass-card ghost-border rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all"
                onClick={() => navigate('/admin/kyc')}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center text-error border border-error/30">
                    <span className="material-symbols-outlined">id_card</span>
                  </div>
                </div>
                <h3 className="text-secondary/70 text-xs font-bold uppercase tracking-widest mb-1">Pending KYC</h3>
                {isLoading ? <div className="h-8 bg-white/5 animate-pulse rounded w-16"></div> : (
                  <p className="text-2xl font-black font-headline text-on-surface">{stats?.pendingKycCount || 0}</p>
                )}
              </div>

              <div 
                className="glass-card ghost-border rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-error/40 flex items-center justify-center text-error shadow-[0_0_20px_rgba(255,82,82,0.4)]">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                </div>
                <h3 className="text-secondary/70 text-xs font-bold uppercase tracking-widest mb-1">Open Disputes</h3>
                {isLoading ? <div className="h-8 bg-white/5 animate-pulse rounded w-16"></div> : (
                  <p className="text-2xl font-black font-headline text-on-surface">{stats?.openDisputeCount || 0}</p>
                )}
              </div>

              <div 
                className="glass-card ghost-border rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all"
                onClick={() => navigate('/admin/withdrawals')}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                </div>
                <h3 className="text-secondary/70 text-xs font-bold uppercase tracking-widest mb-1">Withdrawals</h3>
                {isLoading ? <div className="h-8 bg-white/5 animate-pulse rounded w-16"></div> : (
                  <p className="text-2xl font-black font-headline text-on-surface">{stats?.pendingWithdrawalCount || 0}</p>
                )}
              </div>
            </div>

            <div className="glass-card ghost-border rounded-3xl p-6 md:p-8">
              <h2 className="text-lg font-black font-headline tracking-tight mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span> 
                System Activity Log
              </h2>
              
              <div className="space-y-4">
                {logLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse"></div>
                  ))
                ) : activityLog && activityLog.length > 0 ? (
                  activityLog.map((log) => (
                    <div key={log.id} className="p-4 rounded-xl bg-surface-container-lowest/50 border border-white/5 flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-sm">notifications</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-on-surface mb-1">{log.details}</p>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
                          <span>{log.action}</span>
                          <span>&bull;</span>
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-on-surface-variant text-sm">No activity logs found.</div>
                )}
              </div>
            </div>

          </div>
          <ProfileSidebar />
        </main>
      </div>
    </div>
  );
}
