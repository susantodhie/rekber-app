import React from 'react';
import { useNavigate } from 'react-router-dom';

const TransactionAppBar = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-slate-950/80 backdrop-blur-md flex justify-between items-center px-6 py-4 w-full z-40 border-b border-white/5">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors group"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="font-sans text-sm font-medium">Daftar Transaksi</span>
        </button>
        <div className="h-4 w-[1px] bg-outline-variant/30 hidden md:block"></div>
        <h2 className="mono-text text-sm font-bold text-teal-400 tracking-wider">#TRX-20260331-001</h2>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="hover:bg-white/5 rounded-full p-2 cursor-pointer transition-colors relative">
          <span className="material-symbols-outlined text-slate-400">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
        </div>
        <div className="hover:bg-white/5 rounded-full p-2 cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-slate-400">settings</span>
        </div>
        <img 
          alt="User Avatar" 
          className="w-8 h-8 rounded-full border border-teal-400/30 ml-2 object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrfdNAZsROQKUbQOkDsn-OgLW3M4AlbmJ4UgUZ-93pphnoV_ZD5ubpw7PAm4PiFl-w-zIE1rLNgN9QWRxfIN5DdpQXSLSqyaMbzSJ2XLlvA6m2iJdiRHGwz1gi_n62utAtSuwwlFIbiZNc4MxxArxTKzNBqaR4NGIsZ5XmnLXAf6nY7Y4ew6nJtUDKdqIySTivJL-a1GaDrH31-cN9aArC3xc5vcPH0pPDib1OoOfzhyKVXkzRLo0S2uScPyHj8eyZV3pGQKvYjyI" 
        />
      </div>
    </header>
  );
};

export default TransactionAppBar;
