import React from 'react';
import { useWallet } from '../hooks/useWallet';

const formatCurrency = (amount) => {
  if (amount == null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

const BalanceHero = () => {
  const { data: wallet, isLoading } = useWallet();

  const balance = wallet?.balance ?? 0;

  return (
    <section className="relative">
      <div className="mesh-gradient rounded-full p-12 text-on-primary shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] mb-4 opacity-80">Saldo Rekberinsaja.com</p>
            <h2 className="text-6xl md:text-7xl font-mono font-bold tracking-tight">
              {isLoading ? (
                <span className="inline-block w-72 h-16 bg-white/10 rounded animate-pulse" />
              ) : (
                <>
                  {formatCurrency(balance)}<span className="text-3xl opacity-60">.00</span>
                </>
              )}
            </h2>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full font-bold uppercase tracking-widest text-sm transition-all active:scale-95">
              Isi Saldo
            </button>
            <button className="flex-1 md:flex-none px-8 py-4 bg-on-primary text-primary-fixed-dim rounded-full font-bold uppercase tracking-widest text-sm shadow-xl hover:shadow-primary/30 transition-all active:scale-95">
              Tarik Dana
            </button>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default BalanceHero;
