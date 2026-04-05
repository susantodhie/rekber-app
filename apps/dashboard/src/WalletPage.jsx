import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopAppBar from './components/TopAppBar';
import MobileBottomNav from './components/MobileBottomNav';
import { 
  useWallet, 
  useWalletTransactions, 
  useWithdrawals, 
  useBankAccounts,
  useTopUp,
  useRequestWithdrawal,
  useAdminWithdrawals,
  useAdminApproveWithdrawal,
  useAdminRejectWithdrawal
} from './hooks/useWallet';
import { useMyProfile } from './hooks/useUser';

const formatCurrency = (amount) => {
  if (amount == null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const txTypeConfig = {
  deposit: { label: 'Top Up', icon: 'add_circle', color: 'text-green-400', sign: '+' },
  withdrawal: { label: 'Withdraw', icon: 'remove_circle', color: 'text-red-400', sign: '-' },
  escrow_lock: { label: 'Escrow Lock', icon: 'lock', color: 'text-yellow-400', sign: '-' },
  escrow_release: { label: 'Escrow Release', icon: 'lock_open', color: 'text-green-400', sign: '+' },
  escrow_refund: { label: 'Refund', icon: 'undo', color: 'text-blue-400', sign: '+' },
  escrow_payment: { label: 'Escrow Payment', icon: 'shopping_cart', color: 'text-purple-400', sign: '-' },
  fee: { label: 'Fee', icon: 'receipt', color: 'text-orange-400', sign: '-' },
};

const withdrawalStatusBadge = {
  pending: { label: 'Pending', classes: 'bg-yellow-500/20 text-yellow-400' },
  processing: { label: 'Processing', classes: 'bg-blue-500/20 text-blue-400' },
  completed: { label: 'Approved', classes: 'bg-green-500/20 text-green-400' },
  rejected: { label: 'Rejected', classes: 'bg-red-500/20 text-red-400' },
};

const paymentMethods = [
  { id: 'bank_bca', label: 'Bank BCA', icon: 'account_balance' },
  { id: 'bank_bni', label: 'Bank BNI', icon: 'account_balance' },
  { id: 'bank_mandiri', label: 'Bank Mandiri', icon: 'account_balance' },
  { id: 'dana', label: 'DANA', icon: 'wallet' },
  { id: 'ovo', label: 'OVO', icon: 'wallet' },
  { id: 'gopay', label: 'GoPay', icon: 'wallet' },
  { id: 'qris', label: 'QRIS', icon: 'qr_code_2' },
];

const WalletPage = () => {
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: txData } = useWalletTransactions({ pageSize: 20 });
  const { data: withdrawals = [] } = useWithdrawals();
  const { data: bankAccounts = [] } = useBankAccounts();
  const { data: profile } = useMyProfile();
  const isAdmin = profile?.role === 'admin';

  // Admin hooks
  const { data: adminWithdrawals = [] } = useAdminWithdrawals();
  const adminApproveCmd = useAdminApproveWithdrawal();
  const adminRejectCmd = useAdminRejectWithdrawal();

  const topUpCmd = useTopUp();
  const withdrawCmd = useRequestWithdrawal();

  const [activeTab, setActiveTab] = useState('overview');
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Top Up form
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpMethod, setTopUpMethod] = useState('');

  // Withdraw form
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawBankId, setWithdrawBankId] = useState('');
  const [withdrawPin, setWithdrawPin] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  const transactions = txData?.transactions || [];
  const balance = wallet?.balance ?? 0;

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

  const handleTopUp = () => {
    const amount = parseInt(topUpAmount);
    if (!amount || amount < 10000 || !topUpMethod) return;
    topUpCmd.mutate({ amount, method: topUpMethod }, {
      onSuccess: () => {
        setShowTopUp(false);
        setTopUpAmount('');
        setTopUpMethod('');
      }
    });
  };

  const handleWithdraw = () => {
    setWithdrawError('');
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 50000) { setWithdrawError('Minimum Rp 50.000'); return; }
    if (amount > parseFloat(balance)) { setWithdrawError('Saldo tidak cukup'); return; }
    if (!withdrawBankId) { setWithdrawError('Pilih rekening tujuan'); return; }
    if (!withdrawPin || withdrawPin.length !== 6) { setWithdrawError('PIN harus 6 digit'); return; }

    withdrawCmd.mutate({ amount, bankAccountId: withdrawBankId, pin: withdrawPin }, {
      onSuccess: () => {
        setShowWithdraw(false);
        setWithdrawAmount('');
        setWithdrawBankId('');
        setWithdrawPin('');
      },
      onError: (err) => setWithdrawError(err?.response?.data?.error || 'Gagal melakukan penarikan')
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'history', label: 'Riwayat', icon: 'history' },
    { id: 'withdrawals', label: 'Penarikan', icon: 'output' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: 'admin_panel_settings' }] : []),
  ];

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#0b1325]">
      <Sidebar />
      <main className="flex-1 md:ml-[260px] min-h-screen pb-24 md:pb-12 overflow-y-auto">
        <TopAppBar />
        <div className="px-6 py-8 max-w-6xl mx-auto space-y-8">

          {/* BALANCE HERO */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#131b2d] to-[#1a2540] border border-[#44e5c2]/10 p-8">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#44e5c2]/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-[#bacac3] uppercase tracking-widest mb-2">Saldo Wallet</p>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#44e5c2] to-[#00d2fd] bg-clip-text text-transparent mb-6">
                {walletLoading ? <span className="inline-block w-48 h-12 bg-[#2d3448] rounded animate-pulse" /> : formatCurrency(balance)}
              </h1>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTopUp(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#00c9a7] to-[#00d2fd] text-[#00382d] rounded-xl font-bold text-sm hover:brightness-110 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-[#00c9a7]/20"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Top Up
                </button>
                <button
                  onClick={() => setShowWithdraw(true)}
                  className="px-6 py-3 bg-[#222a3d] text-[#dbe2fb] border border-[#3c4a45]/30 rounded-xl font-bold text-sm hover:bg-[#2d3448] transition-all active:scale-95 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">output</span>
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-1 bg-[#131b2d] p-1 rounded-xl border border-[#3c4a45]/10">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-[#222a3d] text-[#44e5c2] shadow-lg'
                    : 'text-[#bacac3] hover:text-[#dbe2fb] hover:bg-[#1a2333]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <div className="bg-[#131b2d] rounded-2xl p-6 border border-[#3c4a45]/10">
                <h3 className="text-xs font-bold text-[#bacac3] uppercase tracking-wider mb-4">Total Top Up</h3>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + parseFloat(t.amount), 0))}
                </p>
              </div>
              <div className="bg-[#131b2d] rounded-2xl p-6 border border-[#3c4a45]/10">
                <h3 className="text-xs font-bold text-[#bacac3] uppercase tracking-wider mb-4">Total Withdraw</h3>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(transactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s + parseFloat(t.amount), 0))}
                </p>
              </div>
              <div className="bg-[#131b2d] rounded-2xl p-6 border border-[#3c4a45]/10">
                <h3 className="text-xs font-bold text-[#bacac3] uppercase tracking-wider mb-4">Dari Escrow</h3>
                <p className="text-2xl font-bold text-[#44e5c2]">
                  {formatCurrency(transactions.filter(t => t.type === 'escrow_release').reduce((s, t) => s + parseFloat(t.amount), 0))}
                </p>
              </div>

              {/* Recent Transactions Preview */}
              <div className="lg:col-span-3 bg-[#131b2d] rounded-2xl p-6 border border-[#3c4a45]/10">
                <h3 className="text-sm font-bold text-[#dbe2fb] mb-4">Transaksi Terakhir</h3>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map(tx => {
                    const cfg = txTypeConfig[tx.type] || txTypeConfig.fee;
                    return (
                      <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#1a2333] transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color} bg-white/5`}>
                          <span className="material-symbols-outlined text-lg">{cfg.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#dbe2fb] truncate">{tx.description || cfg.label}</p>
                          <p className="text-[10px] text-[#bacac3]">{formatDate(tx.createdAt)}</p>
                        </div>
                        <span className={`text-sm font-bold font-mono ${cfg.sign === '+' ? 'text-green-400' : 'text-red-400'}`}>
                          {cfg.sign}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    );
                  })}
                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-[#bacac3]">
                      <span className="material-symbols-outlined text-3xl mb-2 block opacity-30">receipt_long</span>
                      <p className="text-sm">Belum ada transaksi</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-[#131b2d] rounded-2xl p-6 border border-[#3c4a45]/10">
              <h3 className="text-sm font-bold text-[#dbe2fb] mb-4">Riwayat Transaksi Lengkap</h3>
              <div className="space-y-2">
                {transactions.map(tx => {
                  const cfg = txTypeConfig[tx.type] || txTypeConfig.fee;
                  return (
                    <div key={tx.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#0b1325]/50 border border-[#3c4a45]/5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color} bg-white/5 shrink-0`}>
                        <span className="material-symbols-outlined text-lg">{cfg.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-[#dbe2fb] truncate">{tx.description || cfg.label}</p>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${tx.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#bacac3]">{formatDate(tx.createdAt)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-sm font-bold font-mono ${cfg.sign === '+' ? 'text-green-400' : 'text-red-400'}`}>
                          {cfg.sign}{formatCurrency(tx.amount)}
                        </span>
                        <p className="text-[10px] text-[#bacac3] font-mono">Saldo: {formatCurrency(tx.balanceAfter)}</p>
                      </div>
                    </div>
                  );
                })}
                {transactions.length === 0 && (
                  <div className="text-center py-12 text-[#bacac3]">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">receipt_long</span>
                    <p className="text-sm">Belum ada riwayat transaksi</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: WITHDRAWALS */}
          {activeTab === 'withdrawals' && (
            <div className="bg-[#131b2d] rounded-2xl p-6 border border-[#3c4a45]/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#dbe2fb]">Riwayat Penarikan</h3>
                <button onClick={() => setShowWithdraw(true)} className="px-4 py-2 bg-[#222a3d] text-[#dbe2fb] rounded-lg text-xs font-bold hover:bg-[#2d3448] transition">
                  + Tarik Dana
                </button>
              </div>
              <div className="space-y-2">
                {withdrawals.map(w => {
                  const badge = withdrawalStatusBadge[w.status] || withdrawalStatusBadge.pending;
                  return (
                    <div key={w.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#0b1325]/50 border border-[#3c4a45]/5">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-red-400">output</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#dbe2fb]">{formatCurrency(w.amount)}</p>
                        <p className="text-[10px] text-[#bacac3]">{formatDate(w.createdAt)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
                {withdrawals.length === 0 && (
                  <div className="text-center py-12 text-[#bacac3]">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">output</span>
                    <p className="text-sm">Belum ada penarikan</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: ADMIN */}
          {activeTab === 'admin' && isAdmin && (
            <div className="bg-[#131b2d] rounded-2xl p-6 border border-red-500/10">
              <h3 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                Admin: Semua Permintaan Penarikan
              </h3>
              <div className="space-y-3">
                {adminWithdrawals.map(w => {
                  const badge = withdrawalStatusBadge[w.status] || withdrawalStatusBadge.pending;
                  const isPending = w.status === 'pending';
                  return (
                    <div key={w.id} className="p-4 rounded-xl bg-[#0b1325]/50 border border-[#3c4a45]/5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-bold text-[#dbe2fb]">@{w.username || 'user'} — {w.fullName || ''}</p>
                          <p className="text-[10px] text-[#bacac3]">{formatDate(w.createdAt)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.classes}`}>{badge.label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-red-400 font-mono">{formatCurrency(w.amount)}</p>
                          <p className="text-[10px] text-[#bacac3]">{w.bankName} — {w.accountNumber} ({w.accountHolder})</p>
                        </div>
                        {isPending && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => adminApproveCmd.mutate(w.id)}
                              disabled={adminApproveCmd.isPending}
                              className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold hover:bg-green-500/30 transition disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => adminRejectCmd.mutate(w.id)}
                              disabled={adminRejectCmd.isPending}
                              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-500/30 transition disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {adminWithdrawals.length === 0 && (
                  <div className="text-center py-12 text-[#bacac3]">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">output</span>
                    <p className="text-sm">Belum ada permintaan penarikan</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <MobileBottomNav />

      {/* TOP UP MODAL */}
      {showTopUp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowTopUp(false)}>
          <div className="bg-[#131b2d] rounded-2xl p-6 max-w-md w-full border border-[#44e5c2]/20 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#44e5c2]/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#44e5c2] text-2xl">add_circle</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Top Up Saldo</h3>
                <p className="text-xs text-[#bacac3]">Tambah saldo ke wallet Anda</p>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#bacac3] uppercase tracking-wider mb-2">Nominal (Rp)</label>
              <input
                type="number"
                value={topUpAmount}
                onChange={e => setTopUpAmount(e.target.value)}
                placeholder="100000"
                className="w-full bg-[#060e1f] border border-[#3c4a45]/30 rounded-xl px-4 py-3 text-lg text-[#dbe2fb] font-mono outline-none focus:ring-2 focus:ring-[#44e5c2]/30 placeholder:text-[#bacac3]/40"
              />
            </div>

            {/* Quick Amounts */}
            <div className="flex flex-wrap gap-2 mb-6">
              {quickAmounts.map(a => (
                <button key={a} onClick={() => setTopUpAmount(String(a))} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${topUpAmount === String(a) ? 'bg-[#44e5c2] text-[#00382d]' : 'bg-[#222a3d] text-[#bacac3] hover:bg-[#2d3448]'}`}>
                  {formatCurrency(a)}
                </button>
              ))}
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#bacac3] uppercase tracking-wider mb-2">Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map(m => (
                  <button key={m.id} onClick={() => setTopUpMethod(m.id)} className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold transition-all border ${topUpMethod === m.id ? 'bg-[#44e5c2]/10 border-[#44e5c2]/50 text-[#44e5c2]' : 'bg-[#0b1325] border-[#3c4a45]/20 text-[#bacac3] hover:bg-[#1a2333]'}`}>
                    <span className="material-symbols-outlined text-sm">{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => setShowTopUp(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-[#bacac3] bg-[#222a3d] hover:bg-[#2d3448] transition-colors">Batal</button>
              <button
                onClick={handleTopUp}
                disabled={!topUpAmount || parseInt(topUpAmount) < 10000 || !topUpMethod || topUpCmd.isPending}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-[#00382d] bg-gradient-to-r from-[#00c9a7] to-[#00d2fd] hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {topUpCmd.isPending ? <><span className="w-4 h-4 border-2 border-[#00382d]/30 border-t-[#00382d] rounded-full animate-spin"></span> Memproses...</> : 'Top Up Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowWithdraw(false)}>
          <div className="bg-[#131b2d] rounded-2xl p-6 max-w-md w-full border border-red-500/20 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-red-400 text-2xl">output</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Tarik Dana</h3>
                <p className="text-xs text-[#bacac3]">Saldo tersedia: {formatCurrency(balance)}</p>
              </div>
            </div>

            {withdrawError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">{withdrawError}</div>
            )}

            {/* Amount */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#bacac3] uppercase tracking-wider mb-2">Nominal Penarikan (Rp)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                placeholder="50000"
                className="w-full bg-[#060e1f] border border-[#3c4a45]/30 rounded-xl px-4 py-3 text-lg text-[#dbe2fb] font-mono outline-none focus:ring-2 focus:ring-red-500/30 placeholder:text-[#bacac3]/40"
              />
              <p className="text-[10px] text-[#bacac3] mt-1">Minimum penarikan: Rp 50.000</p>
            </div>

            {/* Bank Account */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#bacac3] uppercase tracking-wider mb-2">Rekening Tujuan</label>
              {bankAccounts.length === 0 ? (
                <p className="text-xs text-yellow-400 bg-yellow-500/10 p-3 rounded-xl">Anda belum memiliki rekening bank. Tambahkan di halaman Profile.</p>
              ) : (
                <div className="space-y-2">
                  {bankAccounts.map(ba => (
                    <button key={ba.id} onClick={() => setWithdrawBankId(ba.id)} className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${withdrawBankId === ba.id ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-[#0b1325] border-[#3c4a45]/20 text-[#bacac3] hover:bg-[#1a2333]'}`}>
                      <p className="font-bold">{ba.bankName} — {ba.accountNumber}</p>
                      <p className="text-[10px] opacity-70">{ba.accountHolder}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PIN */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#bacac3] uppercase tracking-wider mb-2">PIN Transaksi (6 digit)</label>
              <input
                type="password"
                value={withdrawPin}
                onChange={e => setWithdrawPin(e.target.value)}
                maxLength={6}
                placeholder="••••••"
                className="w-full bg-[#060e1f] border border-[#3c4a45]/30 rounded-xl px-4 py-3 text-center text-2xl text-[#dbe2fb] font-mono tracking-widest outline-none focus:ring-2 focus:ring-red-500/30 placeholder:text-[#bacac3]/40"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => { setShowWithdraw(false); setWithdrawError(''); }} className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-[#bacac3] bg-[#222a3d] hover:bg-[#2d3448] transition-colors">Batal</button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawCmd.isPending || bankAccounts.length === 0}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {withdrawCmd.isPending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Memproses...</> : 'Tarik Dana'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
