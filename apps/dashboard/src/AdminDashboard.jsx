import React, { useState, useEffect } from 'react';
import { useAdminDashboard, useActivityLog } from './hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import TopAppBar from './components/TopAppBar';
import Sidebar from './components/Sidebar';
import ProfileSidebar from './components/ProfileSidebar';

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useAdminDashboard();
  const { data: activityLog, isLoading: logLoading } = useActivityLog({ page: 1, pageSize: 15 });
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('id-ID'));
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('id-ID'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary selection:text-on-primary min-h-screen flex flex-col md:flex-row shadow-[inset_0_0_100px_rgba(20,255,236,0.03)]">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen relative max-w-full">
        <div className="fixed top-0 left-[260px] max-w-full w-full h-[600px] bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent blur-[120px] pointer-events-none -z-10 animate-pulse-slow"></div>

        <TopAppBar />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full z-10 flex flex-col xl:flex-row gap-8">
          <div className="flex-1 space-y-8">
            
            {/* Header & Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="text-3xl font-black font-headline tracking-tighter mb-1">Selamat datang, Admin</h2>
                <p className="text-on-surface-variant text-sm font-medium">Pantau aktivitas dan kelola transaksi dengan mudah</p>
              </div>
              
              <div className="flex items-center gap-4 bg-surface-container-lowest/50 border border-white/10 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </div>
                  <span className="text-sm font-bold text-primary uppercase tracking-widest">Sistem Aktif</span>
                </div>
                <div className="text-xs text-on-surface-variant font-mono">
                  Terakhir diperbarui: {currentTime}
                </div>
              </div>
            </div>

            {/* Statistik Tambahan (7 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card ghost-border rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition-all group" onClick={() => navigate('/admin/transactions')}>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                  </div>
                </div>
                <h3 className="text-secondary/70 text-[10px] font-bold uppercase tracking-widest mb-1">Dana Ditahan (Escrow)</h3>
                {isLoading ? <div className="h-7 bg-white/5 animate-pulse rounded w-20"></div> : (
                  <p className="text-xl font-black font-headline text-on-surface truncate">{formatRp(stats?.totalEscrowAmount)}</p>
                )}
              </div>

              <div className="glass-card ghost-border rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition-all group" onClick={() => navigate('/admin/transactions')}>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">monitoring</span>
                  </div>
                </div>
                <h3 className="text-secondary/70 text-[10px] font-bold uppercase tracking-widest mb-1">Total Volume Transaksi</h3>
                {isLoading ? <div className="h-7 bg-white/5 animate-pulse rounded w-20"></div> : (
                  <p className="text-xl font-black font-headline text-on-surface truncate">{formatRp(stats?.totalTransactionVolume)}</p>
                )}
              </div>

              <div className="glass-card ghost-border rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition-all group" onClick={() => navigate('/admin/withdrawals')}>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                </div>
                <h3 className="text-secondary/70 text-[10px] font-bold uppercase tracking-widest mb-1">Penarikan Dana</h3>
                {isLoading ? <div className="h-7 bg-white/5 animate-pulse rounded w-20"></div> : (
                  <p className="text-xl font-black font-headline text-on-surface truncate">{formatRp(stats?.totalWithdrawalAmount)}</p>
                )}
              </div>

              <div className="glass-card ghost-border rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">group</span>
                  </div>
                </div>
                <h3 className="text-secondary/70 text-[10px] font-bold uppercase tracking-widest mb-1">Total Pengguna</h3>
                {isLoading ? <div className="h-7 bg-white/5 animate-pulse rounded w-16"></div> : (
                  <p className="text-xl font-black font-headline text-on-surface">{stats?.totalUsersCount || 0}</p>
                )}
              </div>

              <div className="glass-card ghost-border rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">today</span>
                  </div>
                </div>
                <h3 className="text-secondary/70 text-[10px] font-bold uppercase tracking-widest mb-1">Transaksi Hari Ini</h3>
                {isLoading ? <div className="h-7 bg-white/5 animate-pulse rounded w-16"></div> : (
                  <p className="text-xl font-black font-headline text-on-surface">{stats?.todayTransactionsCount || 0}</p>
                )}
              </div>

              <div className="glass-card ghost-border rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition-all group" onClick={() => navigate('/admin/kyc')}>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center text-error border border-error/30 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">id_card</span>
                  </div>
                </div>
                <h3 className="text-secondary/70 text-[10px] font-bold uppercase tracking-widest mb-1">Verifikasi Identitas (KYC)</h3>
                {isLoading ? <div className="h-7 bg-white/5 animate-pulse rounded w-16"></div> : (
                  <p className="text-xl font-black font-headline text-on-surface">{stats?.pendingKycCount || 0} <span className="text-sm font-medium text-error opacity-80">Pending</span></p>
                )}
              </div>

              <div className="glass-card ghost-border rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-error/40 flex items-center justify-center text-error shadow-[0_0_20px_rgba(255,82,82,0.4)] group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                </div>
                <h3 className="text-secondary/70 text-[10px] font-bold uppercase tracking-widest mb-1">Sengketa Aktif</h3>
                {isLoading ? <div className="h-7 bg-white/5 animate-pulse rounded w-16"></div> : (
                  <p className="text-xl font-black font-headline text-on-surface">{stats?.openDisputeCount || 0}</p>
                )}
              </div>
              
              {/* Notifikasi Cerdas */}
              <div className="glass-card ghost-border rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all"></div>
                <h3 className="text-secondary/70 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                  Notifikasi Cerdas
                </h3>
                <div className="space-y-2">
                  {(stats?.pendingKycCount > 0 || stats?.openDisputeCount > 0) ? (
                    <>
                      {stats?.pendingKycCount > 0 && (
                        <div className="flex items-center gap-2 text-xs font-medium text-error bg-error/10 px-2 py-1.5 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span> {stats.pendingKycCount} KYC butuh tinjauan
                        </div>
                      )}
                      {stats?.openDisputeCount > 0 && (
                        <div className="flex items-center gap-2 text-xs font-medium text-orange-400 bg-orange-400/10 px-2 py-1.5 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span> {stats.openDisputeCount} Sengketa transaksi
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-center items-center h-10 text-xs text-on-surface-variant">
                      Tidak ada notifikasi baru
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Grafik Transaksi */}
              <div className="glass-card ghost-border rounded-3xl p-6 md:p-8 flex flex-col shadow-lg shadow-black/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-black font-headline tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">bar_chart</span> 
                    Statistik Transaksi
                  </h2>
                  <select className="bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-1 text-xs font-bold focus:outline-none focus:border-primary">
                    <option>Harian</option>
                    <option>Mingguan</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col justify-end items-center min-h-[220px] relative">
                  {/* CSS Bar Chart Placeholder */}
                  <div className="absolute inset-0 flex items-end justify-between px-2 pb-6 opacity-30 pointer-events-none">
                     <div className="w-[10%] bg-gradient-to-t from-primary/50 to-primary rounded-t-sm h-[20%] transition-all"></div>
                     <div className="w-[10%] bg-gradient-to-t from-primary/50 to-primary rounded-t-sm h-[45%] transition-all"></div>
                     <div className="w-[10%] bg-gradient-to-t from-primary/50 to-primary rounded-t-sm h-[30%] transition-all"></div>
                     <div className="w-[10%] bg-gradient-to-t from-primary/50 to-primary rounded-t-sm h-[80%] transition-all"></div>
                     <div className="w-[10%] bg-gradient-to-t from-primary/50 to-primary rounded-t-sm h-[60%] transition-all"></div>
                     <div className="w-[10%] bg-gradient-to-t from-primary/50 to-primary rounded-t-sm h-[90%] transition-all"></div>
                     <div className="w-[10%] bg-gradient-to-t from-primary/50 to-primary rounded-t-sm h-[50%] transition-all"></div>
                  </div>
                  <div className="z-10 bg-surface/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 drop-shadow-xl text-center">
                    <span className="material-symbols-outlined text-on-surface-variant mb-1 text-2xl">insights</span>
                    <p className="text-sm font-bold text-on-surface-variant">Belum ada data transaksi</p>
                  </div>
                  <div className="w-full h-[1px] bg-white/10 absolute bottom-6"></div>
                </div>
              </div>

              {/* Log Aktivitas Sistem */}
              <div className="glass-card ghost-border rounded-3xl p-6 md:p-8 flex flex-col max-h-[400px] shadow-lg shadow-black/20">
                <h2 className="text-lg font-black font-headline tracking-tight mb-6 flex items-center gap-2 sticky top-0">
                  <span className="material-symbols-outlined text-primary">history</span> 
                  Log Aktivitas Sistem
                </h2>
                
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  {logLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse"></div>
                    ))
                  ) : activityLog && activityLog.length > 0 ? (
                    activityLog.map((log) => (
                      <div key={log.id} className="p-4 rounded-xl bg-surface-container-lowest/50 border border-white/5 hover:border-white/10 transition-colors flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-sm">notifications</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-on-surface mb-1 leading-snug">{log.details}</p>
                          <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-mono">
                            <span className="uppercase tracking-wider font-bold bg-white/5 px-2 py-0.5 rounded">{log.action}</span>
                            <span>&bull;</span>
                            <span>{new Date(log.createdAt).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
                      <p className="text-sm">Belum ada aktivitas.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
          
          <div className="hidden xl:block">
            <ProfileSidebar />
          </div>
        </main>
      </div>
    </div>
  );
}
