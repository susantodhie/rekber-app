import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopAppBar from './components/TopAppBar';
import MobileBottomNav from './components/MobileBottomNav';
import { useCreateEscrow } from './hooks/useEscrow';
import { useKycStatus } from './hooks/useKyc';
import { usePaymentConfig } from './hooks/usePayment';
import { useWallet } from './hooks/useWallet';
import { API_BASE_URL } from './lib/config';

const CATEGORIES = [
  'Akun Game & Sosial Media',
  'Aset Digital (Domain, Crypto, dsb)',
  'Jasa Freelance & Desain',
  'Barang Fisik & Elektronik',
  'Software & Script',
  'Lainnya'
];

const formatCurrencyFull = (amount) => {
  if (amount == null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

const NewEscrow = () => {
  const navigate = useNavigate();
  const createMutation = useCreateEscrow();
  const { data: kycStatus } = useKycStatus();
  const { data: payConfig, isLoading: configLoading } = usePaymentConfig();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  
  const isVerified = kycStatus?.status === 'verified';
  const walletBalance = wallet ? parseFloat(wallet.balance) : 0;

  const [formData, setFormData] = useState({
    itemName: '',
    category: CATEGORIES[0],
    description: '',
    counterpartyEmail: '',
    role: 'buyer',
    amount: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [error, setError] = useState('');

  const formatCurrency = (val) => {
    const raw = val.replace(/\D/g, '');
    if (!raw) return '';
    return new Intl.NumberFormat('id-ID').format(raw);
  };

  const numericAmount = useMemo(() => {
    return parseInt(formData.amount.replace(/\D/g, ''), 10) || 0;
  }, [formData.amount]);

  // Simple fee calculation for preview (2.5% admin fee)
  const estimatedTotal = useMemo(() => {
    const adminFee = Math.round(numericAmount * 0.025);
    return numericAmount + adminFee;
  }, [numericAmount]);

  const isWalletSufficient = walletBalance >= estimatedTotal && estimatedTotal > 0;
  const balanceAfterPayment = walletBalance - estimatedTotal;

  const handleAmountChange = (e) => {
    setFormData(prev => ({
      ...prev,
      amount: formatCurrency(e.target.value)
    }));
    // Reset payment when amount changes
    setPaymentMethod('');
    setPaymentStatus('pending');
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectPayment = (method) => {
    setPaymentMethod(method);
    if (method === 'wallet') {
      // Wallet payment is instant — auto-confirm
      setPaymentStatus('paid');
    } else {
      setPaymentStatus('pending');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!paymentMethod) {
      setError('Silakan pilih metode pembayaran.');
      return;
    }

    if (paymentMethod !== 'wallet' && paymentStatus !== 'paid') {
      setError('Silakan selesaikan pembayaran dan klik "Saya sudah bayar" terlebih dahulu.');
      return;
    }

    if (paymentMethod === 'wallet' && !isWalletSufficient) {
      setError('Saldo wallet tidak cukup untuk transaksi ini.');
      return;
    }

    if (numericAmount < 10000) {
      setError('Minimum transaksi Rp 10.000');
      return;
    }

    try {
      const payload = {
        ...formData,
        amount: numericAmount,
        paymentMethod,
      };
      
      const res = await createMutation.mutateAsync(payload);
      
      if (res && res.id) {
        navigate(`/transaction/${res.id}`);
      } else {
        navigate('/transactions');
      }
    } catch (err) {
      setError(err?.error || err?.message || 'Gagal membuat transaksi');
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#0b1325] text-on-surface">
      <Sidebar />
      <main className="flex-1 md:ml-[260px] min-h-screen pb-24 md:pb-12 overflow-y-auto">
        <TopAppBar />
        
        <div className="px-6 py-8 max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/transactions')} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h2 className="text-3xl font-black text-on-surface tracking-tight">Transaksi Baru</h2>
              <p className="text-sm text-on-surface-variant">Buat ruang escrow digital yang aman 100%.</p>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2rem] border border-primary/20 shadow-[0_0_50px_rgba(68,229,194,0.05)] relative overflow-hidden">
            
            {/* KYC LOCK GUARD */}
            {!isVerified && (
              <div className="absolute inset-0 z-50 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center border border-error/20 rounded-[2rem]">
                 <span className="material-symbols-outlined text-error text-6xl mb-4">lock</span>
                 <h3 className="text-xl font-bold text-on-surface mb-2">Verifikasi Diperlukan</h3>
                 <p className="text-sm text-on-surface-variant font-medium max-w-md">Fitur perlindungan Escrow hanya tersedia jika akun Anda sudah diverifikasi penuh oleh Admin. Selesaikan prosedur KYC untuk mengaktifkan fitur ini.</p>
                 <button className="mt-6 px-6 py-2 bg-gradient-to-r from-primary-container to-secondary-container rounded-lg text-on-primary font-bold text-sm" onClick={() => navigate('/kyc')}>
                   Mulai Verifikasi KYC
                 </button>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Partner Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Email Pihak Lawan</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">mail</span>
                  <input
                    type="email"
                    name="counterpartyEmail"
                    value={formData.counterpartyEmail}
                    onChange={handleChange}
                    required
                    placeholder="email@example.com"
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl pl-12 pr-4 py-4 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Peran */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Peran Anda</label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setFormData(p => ({ ...p, role: 'buyer' }))}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${formData.role === 'buyer' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container-lowest border-outline-variant/10 text-on-surface-variant hover:border-primary/50'}`}
                  >
                    <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                    <span className="font-bold text-sm">Pembeli</span>
                  </div>
                  <div 
                    onClick={() => setFormData(p => ({ ...p, role: 'seller' }))}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${formData.role === 'seller' ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-surface-container-lowest border-outline-variant/10 text-on-surface-variant hover:border-secondary/50'}`}
                  >
                    <span className="material-symbols-outlined text-3xl">storefront</span>
                    <span className="font-bold text-sm">Penjual</span>
                  </div>
                </div>
              </div>

              {/* Nama Item */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Nama Barang / Jasa</label>
                <input
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Akun Instagram 10K Followers"
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-4 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                />
              </div>

              {/* Kategori */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Kategori</label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-4 appearance-none focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all cursor-pointer font-bold text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Nilai Transaksi</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-primary">Rp</span>
                  <input
                    value={formData.amount}
                    onChange={handleAmountChange}
                    required
                    placeholder="100.000"
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl pl-12 pr-4 py-4 text-xl font-mono font-bold focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all"
                  />
                </div>
                {numericAmount > 0 && (
                  <p className="text-[10px] text-on-surface-variant px-1">
                    Estimasi total (termasuk biaya): <span className="font-bold text-secondary">{formatCurrencyFull(estimatedTotal)}</span>
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Deskripsi Tambahan (Opsional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detail spesifikasi barang, syarat khusus, dsb."
                  rows="3"
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-4 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                />
              </div>

              {/* ============== PAYMENT SECTION ============== */}
              <div className="space-y-4 pt-6 border-t border-outline-variant/10">
                <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest">Metode Pembayaran</h3>
                
                {configLoading || walletLoading ? (
                  <p className="text-sm text-on-surface-variant">Memuat konfigurasi...</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    {/* WALLET BALANCE */}
                    <div 
                      onClick={() => isWalletSufficient && handleSelectPayment('wallet')}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden
                        ${!isWalletSufficient && numericAmount > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        ${paymentMethod === 'wallet' 
                          ? 'bg-gradient-to-br from-[#44e5c2]/20 to-[#00d2fd]/10 border-[#44e5c2] text-[#44e5c2] shadow-lg shadow-[#44e5c2]/10' 
                          : 'bg-surface-container-lowest border-outline-variant/10 text-on-surface-variant hover:border-primary/50'
                        }`}
                    >
                      {paymentMethod === 'wallet' && (
                        <span className="absolute top-2 right-2 material-symbols-outlined text-[#44e5c2] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      )}
                      <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                      <span className="font-bold text-sm">Wallet</span>
                      <span className={`text-[10px] font-mono font-bold ${isWalletSufficient ? 'text-[#44e5c2]' : 'text-red-400'}`}>
                        {formatCurrencyFull(walletBalance)}
                      </span>
                      {!isWalletSufficient && numericAmount > 0 && (
                        <span className="text-[9px] text-red-400 font-bold">Saldo tidak cukup</span>
                      )}
                    </div>

                    {/* QRIS */}
                    <div 
                      onClick={() => handleSelectPayment('qris')}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all relative
                        ${paymentMethod === 'qris' 
                          ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10' 
                          : 'bg-surface-container-lowest border-outline-variant/10 text-on-surface-variant hover:border-primary/50'
                        }`}
                    >
                      {paymentMethod === 'qris' && (
                        <span className="absolute top-2 right-2 material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      )}
                      <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
                      <span className="font-bold text-sm">QRIS</span>
                      <span className="text-[10px] text-on-surface-variant">Scan & Pay</span>
                    </div>

                    {/* DANA */}
                    <div 
                      onClick={() => handleSelectPayment('dana')}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all relative
                        ${paymentMethod === 'dana' 
                          ? 'bg-secondary/10 border-secondary text-secondary shadow-lg shadow-secondary/10' 
                          : 'bg-surface-container-lowest border-outline-variant/10 text-on-surface-variant hover:border-secondary/50'
                        }`}
                    >
                      {paymentMethod === 'dana' && (
                        <span className="absolute top-2 right-2 material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      )}
                      <span className="material-symbols-outlined text-3xl">credit_card</span>
                      <span className="font-bold text-sm">DANA</span>
                      <span className="text-[10px] text-on-surface-variant">E-Wallet</span>
                    </div>
                  </div>
                )}

                {/* WALLET — Instant Preview */}
                {paymentMethod === 'wallet' && isWalletSufficient && (
                  <div className="p-5 bg-gradient-to-br from-[#131b2d] to-[#1a2540] border border-[#44e5c2]/20 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-[#44e5c2] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                      <span className="text-xs font-bold text-[#44e5c2] uppercase tracking-wider">Pembayaran Instan via Wallet</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#bacac3]">Saldo saat ini</span>
                      <span className="font-mono font-bold text-[#dbe2fb]">{formatCurrencyFull(walletBalance)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#bacac3]">Estimasi pembayaran</span>
                      <span className="font-mono font-bold text-red-400">- {formatCurrencyFull(estimatedTotal)}</span>
                    </div>
                    <div className="border-t border-[#3c4a45]/20 pt-2 flex justify-between text-sm">
                      <span className="text-[#bacac3] font-bold">Sisa saldo</span>
                      <span className={`font-mono font-bold ${balanceAfterPayment >= 0 ? 'text-[#44e5c2]' : 'text-red-400'}`}>{formatCurrencyFull(balanceAfterPayment)}</span>
                    </div>
                    <div className="mt-2 p-3 bg-[#44e5c2]/10 rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#44e5c2] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-xs font-bold text-[#44e5c2]">Saldo akan dipotong otomatis saat transaksi dibuat</span>
                    </div>
                  </div>
                )}

                {/* DANA Payment Instructions */}
                {paymentMethod === 'dana' && payConfig && (
                  <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-xl text-center space-y-4">
                    <p className="text-sm text-on-surface-variant font-bold">Transfer ke DANA</p>
                    <p className="text-2xl font-mono font-black tracking-widest text-secondary">{payConfig.dana_number}</p>
                    {numericAmount > 0 && (
                      <p className="text-sm text-on-surface-variant">Total: <span className="font-bold text-secondary">{formatCurrencyFull(estimatedTotal)}</span></p>
                    )}
                  </div>
                )}

                {/* QRIS Payment Instructions */}
                {paymentMethod === 'qris' && payConfig && (
                  <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-xl flex flex-col items-center space-y-4">
                    <p className="text-sm text-on-surface-variant font-bold">Scan QRIS berikut</p>
                    <img src={`${API_BASE_URL}${payConfig.qris_image_url}`} alt="QRIS" className="w-64 max-w-full rounded-2xl shadow-xl border border-primary/20" />
                    {numericAmount > 0 && (
                      <p className="text-sm text-on-surface-variant">Total: <span className="font-bold text-primary">{formatCurrencyFull(estimatedTotal)}</span></p>
                    )}
                  </div>
                )}

                {/* "Saya sudah bayar" button for QRIS / DANA */}
                {(paymentMethod === 'qris' || paymentMethod === 'dana') && paymentStatus === 'pending' && (
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('paid')}
                    className="w-full bg-surface-container-highest border border-primary/30 text-primary py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-primary hover:text-on-primary transition-all mt-2"
                  >
                    SAYA SUDAH BAYAR
                  </button>
                )}

                {/* Payment confirmed badge */}
                {paymentStatus === 'paid' && (
                  <div className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 mt-2 ${
                    paymentMethod === 'wallet' 
                      ? 'bg-[#44e5c2]/10 border border-[#44e5c2]/30 text-[#44e5c2]' 
                      : 'bg-primary/10 border border-primary/30 text-primary'
                  }`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {paymentMethod === 'wallet' ? 'PEMBAYARAN VIA WALLET — OTOMATIS' : 'PEMBAYARAN DIKONFIRMASI'}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!isVerified || createMutation.isPending}
                className="w-full bg-gradient-to-r from-primary-container to-secondary-container text-on-primary py-4 rounded-xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-6"
              >
                {createMutation.isPending ? 'MEMPROSES...' : 'BUAT TRANSAKSI ESCROW'}
              </button>
            </form>

          </div>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default NewEscrow;
