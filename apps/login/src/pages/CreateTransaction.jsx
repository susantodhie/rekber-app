import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateTransaction = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    price: '',
    sellerEmail: '',
    buyerEmail: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Mock API call
    setTimeout(() => {
      setLoading(false);
      navigate('/transactions');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-headline text-on-surface mb-2">Create Escrow</h1>
        <p className="text-on-surface-variant text-sm">Initiate a secure transaction protected by Rekberinsaja.</p>
      </div>

      <div className="glass-panel p-8 rounded-xl border border-outline-variant/20 bg-surface-container/80 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-semibold tracking-widest text-on-surface-variant uppercase ml-1">Item / Project Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant group-focus-within:text-primary transition-colors">category</span>
                </div>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-on-surface-variant/30"
                  placeholder="e.g. MacBook Pro M3 or Web Design Service"
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-semibold tracking-widest text-on-surface-variant uppercase ml-1">Agreed Price (IDR)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-outline-variant group-focus-within:text-primary transition-colors font-bold tracking-widest">Rp</span>
                </div>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-4 pl-14 pr-4 font-['JetBrains_Mono'] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-on-surface-variant/30 font-bold"
                  placeholder="0"
                  type="number"
                  name="price"
                  min="10000"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-widest text-on-surface-variant uppercase ml-1">Seller Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant group-focus-within:text-secondary transition-colors">storefront</span>
                </div>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all placeholder:text-on-surface-variant/30"
                  placeholder="seller@example.com"
                  type="email"
                  name="sellerEmail"
                  value={formData.sellerEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-widest text-on-surface-variant uppercase ml-1">Buyer Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant group-focus-within:text-secondary transition-colors">shopping_bag</span>
                </div>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all placeholder:text-on-surface-variant/30"
                  placeholder="buyer@example.com"
                  type="email"
                  name="buyerEmail"
                  value={formData.buyerEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/10 flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="px-6 py-3 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/20 rounded-lg transition-colors font-bold text-sm tracking-widest uppercase text-on-surface-variant hover:text-on-surface"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-primary-container to-secondary-container rounded-lg text-on-primary font-black tracking-widest text-sm uppercase shadow-[0_0_20px_rgba(68,229,194,0.3)] hover:shadow-[0_0_30px_rgba(68,229,194,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Create Escrow'}
              {!loading && <span className="material-symbols-outlined text-sm">security</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTransaction;
