import React from 'react';

const ProfileTopnav = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#0b1325]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 shadow-[0_20px_50px_rgba(56,222,187,0.05)]">
      <div className="font-['Inter'] font-black text-xl tracking-tighter text-[#00c9a7]">KINETIC TRUST</div>
      <div className="flex items-center gap-4">
        <button className="text-[#bacac3] hover:bg-[#2d3448] transition-colors p-2 rounded-full active:scale-95 duration-200" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-[#bacac3] hover:bg-[#2d3448] transition-colors p-2 rounded-full active:scale-95 duration-200" aria-label="Security">
          <span className="material-symbols-outlined">shield</span>
        </button>
        <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/20 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors">
          <img 
            alt="User profile avatar" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfcdPeSNA2DThOz4Y0MskghMacJL9UQTU80G6-rCw6JU8IXrhs7ig6BABuK6Y1tlxVcFPCR7IeoJuFSamkFn3Hh5e_NDgOY1JYNGVZhYlTs7kjbitPRKuuV-2Tr6wIst2zfuW9JUF3LgDxjYLdm4MUUVXPrRdNm53OZeROSUQDgwqVE-6aMBLYLbQv6i5N5y7bC5SajqSjHPzt8UJUqbZ8a-5eGX0jIFCvOfZEaRGBOi8Z7Rd-UNPfa8_9OJbER44rlTPo7AMaBFo"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default ProfileTopnav;
