import React from 'react';

const TransactionHistory = () => {
  return (
    <div className="lg:col-span-8 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black tracking-tight text-on-surface">Riwayat Transaksi</h3>
        <div className="flex gap-2">
          <span className="px-4 py-1.5 rounded-full bg-surface-container-high text-xs font-bold text-on-surface-variant cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">Semua</span>
          <span className="px-4 py-1.5 rounded-full text-xs font-bold text-on-surface-variant cursor-pointer hover:bg-primary/10 transition-colors">Masuk</span>
          <span className="px-4 py-1.5 rounded-full text-xs font-bold text-on-surface-variant cursor-pointer hover:bg-primary/10 transition-colors">Keluar</span>
        </div>
      </div>
      <div className="space-y-12">
        {/* Date Group: Today */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-on-surface-variant">Hari Ini</span>
            <div className="h-px flex-1 bg-outline-variant/20"></div>
          </div>
          <div className="space-y-3">
            {/* Transaction Item 1 */}
            <div className="glass-card p-5 rounded-full border border-white/5 hover:border-primary/20 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">south_west</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Escrow #88291 - Penjualan Macbook Pro</h4>
                  <p className="text-xs text-on-surface-variant font-mono">20 Okt 2023 • 14:20</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-primary tracking-tight">+Rp 2.500.000</p>
                <p className="text-[10px] font-mono text-on-surface-variant">Bal: Rp 12.750.000</p>
              </div>
            </div>
            {/* Transaction Item 2 */}
            <div className="glass-card p-5 rounded-full border border-white/5 hover:border-error/20 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error">
                  <span className="material-symbols-outlined">north_east</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Penarikan Dana ke BCA (8821)</h4>
                  <p className="text-xs text-on-surface-variant font-mono">20 Okt 2023 • 09:15</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-error tracking-tight">-Rp 1.000.000</p>
                <p className="text-[10px] font-mono text-on-surface-variant">Bal: Rp 10.250.000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Group: Yesterday */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-on-surface-variant">Kemarin</span>
            <div className="h-px flex-1 bg-outline-variant/20"></div>
          </div>
          <div className="space-y-3">
            <div className="glass-card p-5 rounded-full border border-white/5 hover:border-primary/20 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">south_west</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Deposit Saldo via Mandiri Virtual Account</h4>
                  <p className="text-xs text-on-surface-variant font-mono">19 Okt 2023 • 18:45</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-primary tracking-tight">+Rp 5.000.000</p>
                <p className="text-[10px] font-mono text-on-surface-variant">Bal: Rp 11.250.000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
