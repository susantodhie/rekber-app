import React from 'react';
import { useMyStats } from '../hooks/useUser';

const BentoSummary = () => {
  const { data: stats, isLoading: statsLoading } = useMyStats();

  const activeTransactions = stats?.activeTransactions ?? 0;
  const completedTransactions = stats?.completedTransactions ?? 0;
  const totalTransactions = activeTransactions + completedTransactions;
  const successRate = stats?.successRate ?? 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Transaksi Card */}
      <div className="bg-surface-container-high glass rounded-xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-6xl">receipt_long</span>
        </div>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Total Transaksi</p>
        <h2 className="mono-text text-4xl font-bold text-on-surface">
          {statsLoading ? (
            <span className="inline-block w-12 h-10 bg-surface-container-highest/50 rounded animate-pulse" />
          ) : (
            totalTransactions
          )}
        </h2>
        <div className="mt-4 flex items-center gap-2 text-[10px] text-primary">
          <span className="material-symbols-outlined text-xs">swap_horiz</span>
          <span>Semua Transaksi</span>
        </div>
      </div>

      {/* Transaksi Aktif Card */}
      <div className="bg-surface-container-high glass pulse-container rounded-xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-6xl">sync</span>
        </div>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Transaksi Aktif</p>
        <h2 className="mono-text text-4xl font-bold text-on-surface">
          {statsLoading ? (
            <span className="inline-block w-12 h-10 bg-surface-container-highest/50 rounded animate-pulse" />
          ) : (
            activeTransactions
          )}
        </h2>
        <div className="mt-4 flex items-center gap-2 text-[10px] text-secondary">
          <span className="material-symbols-outlined text-xs">info</span>
          <span>Menunggu Konfirmasi</span>
        </div>
      </div>

      {/* Total Selesai Card */}
      <div className="bg-surface-container-high glass rounded-xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-6xl">task_alt</span>
        </div>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Total Selesai</p>
        <h2 className="mono-text text-4xl font-bold text-on-surface">
          {statsLoading ? (
            <span className="inline-block w-12 h-10 bg-surface-container-highest/50 rounded animate-pulse" />
          ) : (
            completedTransactions
          )}
        </h2>
        <div className="mt-4 flex items-center gap-2 text-[10px] text-teal-400">
          <span className="material-symbols-outlined text-xs">verified_user</span>
          <span>{successRate}% Success Rate</span>
        </div>
      </div>
    </div>
  );
};

export default BentoSummary;
