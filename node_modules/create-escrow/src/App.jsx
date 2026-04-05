import React from 'react';

function App() {
  return (
    <div className="flex bg-surface text-on-surface font-body min-h-screen">
      {/* SideNavBar Anchor */}
      <aside className="hidden lg:flex flex-col h-screen sticky top-0 w-64 border-r border-outline-variant/20 bg-[#0b1325] shadow-[0_0_40px_-5px_rgba(56,222,187,0.1)] z-50">
        <div className="p-8">
          <h1 className="text-2xl font-black tracking-tighter text-[#00C9A7]">Rekberinsaja</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mt-1">The Digital Vault</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#bacac3] opacity-70 hover:bg-[#222a3d] transition-colors font-['Inter'] font-medium" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#44e5c2] font-bold border-r-4 border-[#44e5c2] bg-[#171f32] font-['Inter']" href="#">
            <span className="material-symbols-outlined">payments</span>
            Transactions
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#bacac3] opacity-70 hover:bg-[#222a3d] transition-colors font-['Inter'] font-medium" href="#">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            Wallet
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#bacac3] opacity-70 hover:bg-[#222a3d] transition-colors font-['Inter'] font-medium" href="#">
            <span className="material-symbols-outlined">description</span>
            Contracts
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#bacac3] opacity-70 hover:bg-[#222a3d] transition-colors font-['Inter'] font-medium" href="#">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
        </nav>
        <div className="p-4 mt-auto">
          <button className="w-full bg-primary-container text-on-primary-container font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all scale-95 active:duration-150">
            <span className="material-symbols-outlined">add_circle</span>
            New Escrow
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* TopAppBar Anchor */}
        <header className="w-full h-16 sticky top-0 z-40 bg-[#0b1325]/80 backdrop-blur-md flex justify-between items-center px-8 border-b border-[#3c4a45]/10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input className="w-full bg-surface-container-lowest border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-secondary/30 transition-all text-on-surface" placeholder="Search transactions, users, or vaults..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-[#bacac3] hover:text-[#a2e7ff] transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-[#bacac3] hover:text-[#a2e7ff] transition-all">
              <span className="material-symbols-outlined">shield_lock</span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/20">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-on-surface">Alex Rivera</p>
                <p className="text-[10px] text-primary">Verified Trader</p>
              </div>
              <img alt="User Profile Avatar" className="w-8 h-8 rounded-full border border-primary/30" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt3Il8FtnnXoFdl81cHtjmhNte1peYI6LY7HggHq_QPY7Md7Omoxkd84BLkUHYbbv_1iOSfbfHKqbHXEEgAqZCbm2kARjtpWPnr0j14XVe5orKqhrhm5XdnLm6SJB0RPKEGQKDR3UeLR3yP_F9qZDbV5UjuXcKSe-5PIwgAGkfQ3D5mN9HB8IO8n119rm_Cbh7o9vt9W0uRnIwzuRIzo5Kam3zJ4HT08zBEatPDqd6J7nCwIuFRFkFV5i2PjafqAr5TpwjyMIARp8" />
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-surface">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Initialize <span className="text-primary">Digital Escrow</span></h2>
              <p className="text-on-surface-variant max-w-lg mx-auto">Secure your trade in the digital vault. Funds are only released upon mutual confirmation of contract fulfillment.</p>
            </div>

            {/* Main Form Card (Glassmorphism) */}
            <section className="glass-panel rounded-xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
              {/* Pulse decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32"></div>

              <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Item Name</label>
                    <div className="relative">
                      <input className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg px-4 py-3 text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all" placeholder="e.g. Rare Virtual Artifact #402" type="text" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Category</label>
                    <div className="relative">
                      <select className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg px-4 py-3 text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all appearance-none cursor-pointer">
                        <option>Digital Goods &amp; Software</option>
                        <option>Physical Collectibles</option>
                        <option>Domain Names</option>
                        <option>Freelance Services</option>
                        <option>Game Accounts</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Contract Description</label>
                  <textarea className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg px-4 py-3 text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all resize-none" placeholder="Define the terms of the transaction..." rows="3"></textarea>
                </div>

                {/* Role & Counterparty Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Your Role</label>
                    <div className="flex bg-surface-container-lowest p-1 rounded-xl border border-outline-variant/10">
                      <button className="flex-1 py-2 rounded-lg text-sm font-bold transition-all bg-surface-container-highest text-primary border border-primary/20 shadow-lg" type="button">Buyer</button>
                      <button className="flex-1 py-2 rounded-lg text-sm font-bold transition-all text-on-surface-variant hover:text-on-surface" type="button">Seller</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Counterparty Username</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">person_search</span>
                      <input className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg pl-10 pr-4 py-3 text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all" placeholder="Enter username..." type="text" />
                    </div>
                  </div>
                </div>

                {/* Financial Section */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 border-t border-outline-variant/10 pt-8">
                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Transaction Value</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-on-surface-variant font-mono font-bold">Rp</span>
                      </div>
                      <input className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg pl-12 pr-4 py-4 text-2xl font-mono text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all" placeholder="0" type="number" />
                    </div>
                  </div>
                  <div className="lg:col-span-3 bg-surface-container-low/50 rounded-xl p-5 border border-outline-variant/10">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">analytics</span>
                      Fee Preview (Estimated)
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-on-surface-variant">System Admin Fee (0.5%)</span>
                        <span className="font-mono text-on-surface">Rp 0</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-on-surface-variant">Escrow Security Insurance</span>
                        <span className="font-mono text-on-surface">Rp 5.000</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-outline-variant/20 flex justify-between items-center">
                        <span className="font-bold text-on-surface">Total Payable Amount</span>
                        <span className="font-mono text-xl font-bold text-secondary">Rp 5.000</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Section */}
                <div className="pt-4">
                  <button className="w-full py-5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(68,229,194,0.3)] transition-all transform hover:-translate-y-1 active:scale-95" type="submit">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    Create Transaction &amp; Lock Vault
                  </button>
                  <p className="text-center mt-4 text-[10px] text-on-surface-variant uppercase tracking-widest">
                    Protected by 256-bit AES Encryption &amp; Smart Contract Logic
                  </p>
                </div>
              </form>
            </section>

            {/* Contextual Help / Info Chips */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2 p-4 bg-surface-container-low rounded-lg border-l-2 border-primary">
                <span className="material-symbols-outlined text-primary">security</span>
                <h5 className="text-xs font-bold text-on-surface">Protected Funds</h5>
                <p className="text-[11px] text-on-surface-variant">Money is held in a multisig vault until you confirm receipt.</p>
              </div>
              <div className="flex flex-col gap-2 p-4 bg-surface-container-low rounded-lg border-l-2 border-secondary">
                <span className="material-symbols-outlined text-secondary">gavel</span>
                <h5 className="text-xs font-bold text-on-surface">Dispute Resolution</h5>
                <p className="text-[11px] text-on-surface-variant">Professional mediators available 24/7 for contested trades.</p>
              </div>
              <div className="flex flex-col gap-2 p-4 bg-surface-container-low rounded-lg border-l-2 border-primary-fixed-dim">
                <span className="material-symbols-outlined text-primary-fixed-dim">bolt</span>
                <h5 className="text-xs font-bold text-on-surface">Instant Payouts</h5>
                <p className="text-[11px] text-on-surface-variant">Once confirmed, funds are released to your wallet instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pulse Status (Bottom Right Floating) */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-surface-container-highest px-4 py-2 rounded-full border border-primary/20 shadow-2xl pulse-glow">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">System Secure</span>
      </div>
    </div>
  );
}

export default App;
