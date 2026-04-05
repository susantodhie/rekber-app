import React from 'react';

const ProgressStepper = () => {
  return (
    <section className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-surface-container-high -z-10"></div>
        {/* Active Progress Line */}
        <div className="absolute top-5 left-0 w-[50%] h-[2px] bg-primary -z-10 shadow-[0_0_10px_rgba(68,229,194,0.5)]"></div>
        
        {/* Step 1: Dibuat */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">check</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Dibuat</span>
        </div>
        
        {/* Step 2: Bayar */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">check</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Bayar</span>
        </div>
        
        {/* Step 3: Kirim (ACTIVE) */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center ring-4 ring-primary/20 shadow-[0_0_20px_rgba(68,229,194,0.4)] relative">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
            <div className="absolute inset-0 rounded-full pulse-container"></div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Kirim</span>
        </div>
        
        {/* Step 4: Konfirmasi */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">person_check</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Konfirmasi</span>
        </div>
        
        {/* Step 5: Selesai */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">verified</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Selesai</span>
        </div>
      </div>
    </section>
  );
};

export default ProgressStepper;
