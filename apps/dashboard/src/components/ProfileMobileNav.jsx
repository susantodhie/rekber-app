import React from 'react';

const ProfileMobileNav = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 rounded-t-2xl bg-[#0b1325]/90 backdrop-blur-2xl flex justify-around items-center h-20 px-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <a className="flex flex-col items-center justify-center text-[#bacac3] hover:text-[#a2e7ff] transition-transform active:scale-90" href="#">
        <span className="material-symbols-outlined">grid_view</span>
        <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest mt-1">Home</span>
      </a>
      <a className="flex flex-col items-center justify-center text-[#bacac3] hover:text-[#a2e7ff] transition-transform active:scale-90" href="#">
        <span className="material-symbols-outlined">how_to_reg</span>
        <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest mt-1">Verify</span>
      </a>
      <a className="flex flex-col items-center justify-center text-[#bacac3] hover:text-[#a2e7ff] transition-transform active:scale-90" href="#">
        <span className="material-symbols-outlined">receipt_long</span>
        <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest mt-1">History</span>
      </a>
      <a className="flex flex-col items-center justify-center text-[#00c9a7] scale-110 transition-transform active:scale-90" href="#">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>menu</span>
        <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest mt-1">Menu</span>
      </a>
    </nav>
  );
};

export default ProfileMobileNav;
