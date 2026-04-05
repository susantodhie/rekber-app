import React from 'react';

const MobileBottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-slate-900/90 backdrop-blur-lg z-50 rounded-t-3xl border-t border-teal-900/20 md:hidden shadow-[0_-10px_30px_rgba(0,201,167,0.1)]">
      <a className="flex flex-col items-center justify-center text-slate-500 active:bg-slate-800 transition-all p-2 rounded-xl" href="#">
        <span className="material-symbols-outlined">home</span>
        <span className="font-sans text-[10px] uppercase font-bold tracking-widest mt-1">Home</span>
      </a>
      <a className="flex flex-col items-center justify-center text-teal-400 bg-teal-400/10 rounded-xl px-3 py-1 scale-95" href="#">
        <span className="material-symbols-outlined">swap_horiz</span>
        <span className="font-sans text-[10px] uppercase font-bold tracking-widest mt-1">Transfers</span>
      </a>
      <a className="flex flex-col items-center justify-center text-slate-500 active:bg-slate-800 transition-all p-2 rounded-xl" href="#">
        <span className="material-symbols-outlined">account_balance_wallet</span>
        <span className="font-sans text-[10px] uppercase font-bold tracking-widest mt-1">Wallet</span>
      </a>
      <a className="flex flex-col items-center justify-center text-slate-500 active:bg-slate-800 transition-all p-2 rounded-xl" href="#">
        <span className="material-symbols-outlined">chat</span>
        <span className="font-sans text-[10px] uppercase font-bold tracking-widest mt-1">Chat</span>
      </a>
      <a className="flex flex-col items-center justify-center text-slate-500 active:bg-slate-800 transition-all p-2 rounded-xl" href="#">
        <span className="material-symbols-outlined">person</span>
        <span className="font-sans text-[10px] uppercase font-bold tracking-widest mt-1">Profile</span>
      </a>
    </nav>
  );
};

export default MobileBottomNav;
