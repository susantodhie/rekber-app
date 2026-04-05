import React from 'react';
import { useNavigate } from 'react-router-dom';

const FloatingActionButton = () => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate('/transactions/new')} className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-auto md:px-6 bg-gradient-to-r from-primary-container to-secondary-container rounded-full shadow-[0_10px_30px_rgba(0,201,167,0.3)] flex items-center justify-center gap-3 hover:scale-105 transition-all z-50 group">
      <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
      <span className="hidden md:inline font-bold text-on-primary text-xs uppercase tracking-widest">+ Transaksi</span>
    </button>
  );
};

export default FloatingActionButton;
