import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopAppBar from './components/TopAppBar';
import MobileBottomNav from './components/MobileBottomNav';
import FloatingActionButton from './components/FloatingActionButton';
import TransactionCard from './components/TransactionCard';
import { useEscrowList } from './hooks/useEscrow';

const formatCurrency = (amount) => {
  if (amount == null) return 'Rp 0';
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(0)}K`;
  return `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;
};

const statusMap = {
  pending: {
    status: 'Pending',
    statusColor: { bg: 'bg-secondary/20', text: 'text-secondary', textHover: 'text-secondary' },
    tagColor: { bg: 'bg-secondary/5', text: 'text-secondary', border: 'secondary/20' },
    tag: 'Menunggu Pembayaran',
    stripeColor: 'bg-secondary',
    isPending: true,
  },
  paid: {
    status: 'Proses',
    statusColor: { bg: 'bg-primary/20', text: 'text-primary', textHover: 'text-primary' },
    tagColor: { bg: 'bg-primary/5', text: 'text-primary', border: 'primary/20' },
    tag: 'Terproteksi',
    stripeColor: 'bg-primary',
  },
  shipped: {
    status: 'Dikirim',
    statusColor: { bg: 'bg-secondary/20', text: 'text-secondary', textHover: 'text-secondary' },
    tagColor: { bg: 'bg-secondary/5', text: 'text-secondary', border: 'secondary/20' },
    tag: 'Dalam Pengiriman',
    stripeColor: 'bg-secondary',
  },
  completed: {
    status: 'Selesai',
    statusColor: { bg: 'bg-on-surface-variant/20', text: 'text-on-surface-variant', textHover: 'text-on-surface' },
    tagColor: { bg: 'bg-surface-variant/20', text: 'text-on-surface-variant' },
    tag: 'Transaksi Berhasil',
    stripeColor: 'bg-surface-variant',
    isCompleted: true,
  },
  cancelled: {
    status: 'Dibatalkan',
    statusColor: { bg: 'bg-on-surface-variant/20', text: 'text-on-surface-variant', textHover: 'text-on-surface' },
    tagColor: { bg: 'bg-surface-variant/20', text: 'text-on-surface-variant' },
    tag: 'Dibatalkan',
    stripeColor: 'bg-surface-variant',
    isCompleted: true,
  },
  disputed: {
    status: 'Sengketa',
    statusColor: { bg: 'bg-error/20', text: 'text-error', textHover: 'text-error' },
    tagColor: { bg: 'bg-error/5', text: 'text-error', border: 'error/20' },
    tag: 'Mediasi Admin',
    stripeColor: 'bg-error',
    isDispute: true,
  },
  waiting_seller_action: {
    status: 'Tindakan Penjual',
    statusColor: { bg: 'bg-orange-500/20', text: 'text-orange-400', textHover: 'text-orange-300' },
    tagColor: { bg: 'bg-orange-500/5', text: 'text-orange-400', border: 'orange-500/20' },
    tag: 'Menunggu Penjual',
    stripeColor: 'bg-orange-500',
    isPending: true,
  },
  waiting_both_parties: {
    status: 'Menunggu',
    statusColor: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', textHover: 'text-yellow-300' },
    tagColor: { bg: 'bg-yellow-500/5', text: 'text-yellow-400', border: 'yellow-500/20' },
    tag: 'Menunggu Gabung',
    stripeColor: 'bg-yellow-500',
  },
  chat_active: {
    status: 'Chat Aktif',
    statusColor: { bg: 'bg-blue-500/20', text: 'text-blue-400', textHover: 'text-blue-300' },
    tagColor: { bg: 'bg-blue-500/5', text: 'text-blue-400', border: 'blue-500/20' },
    tag: 'Chat',
    stripeColor: 'bg-blue-500',
  },
  transaction_started: {
    status: 'Berjalan',
    statusColor: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', textHover: 'text-cyan-300' },
    tagColor: { bg: 'bg-cyan-500/5', text: 'text-cyan-400', border: 'cyan-500/20' },
    tag: 'Upload Bukti',
    stripeColor: 'bg-cyan-500',
  },
  waiting_verification: {
    status: 'Verifikasi',
    statusColor: { bg: 'bg-purple-500/20', text: 'text-purple-400', textHover: 'text-purple-300' },
    tagColor: { bg: 'bg-purple-500/5', text: 'text-purple-400', border: 'purple-500/20' },
    tag: 'Verifikasi Admin',
    stripeColor: 'bg-purple-500',
  },
  verified: {
    status: 'Terverifikasi',
    statusColor: { bg: 'bg-green-500/20', text: 'text-green-400', textHover: 'text-green-300' },
    tagColor: { bg: 'bg-green-500/5', text: 'text-green-400', border: 'green-500/20' },
    tag: 'Tunggu Selesai',
    stripeColor: 'bg-green-500',
  },
  success: {
    status: 'Sukses',
    statusColor: { bg: 'bg-green-500/20', text: 'text-green-400', textHover: 'text-green-300' },
    tagColor: { bg: 'bg-green-500/5', text: 'text-green-400', border: 'green-500/20' },
    tag: 'Sukses',
    stripeColor: 'bg-green-500',
    isCompleted: true,
  },
  payment_rejected: {
    status: 'Ditolak',
    statusColor: { bg: 'bg-red-500/20', text: 'text-red-400', textHover: 'text-red-300' },
    tagColor: { bg: 'bg-red-500/5', text: 'text-red-400', border: 'red-500/20' },
    tag: 'Pembayaran Ditolak',
    stripeColor: 'bg-red-500',
  },
  pending_payment: {
    status: 'Pending',
    statusColor: { bg: 'bg-secondary/20', text: 'text-secondary', textHover: 'text-secondary' },
    tagColor: { bg: 'bg-secondary/5', text: 'text-secondary', border: 'secondary/20' },
    tag: 'Menunggu Pembayaran',
    stripeColor: 'bg-secondary',
    isPending: true,
  },
};

const Transactions = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('newest');

  const { data, isLoading } = useEscrowList({ page, pageSize: 10, status: statusFilter || undefined, sort });
  const transactions = data?.transactions || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const filters = [
    { label: 'Semua', value: '' },
    { label: 'Aktif', value: 'paid' },
    { label: 'Selesai', value: 'completed' },
    { label: 'Sengketa', value: 'disputed' },
  ];

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#0b1325]">
      <Sidebar />
      <main className="flex-1 md:ml-[260px] min-h-screen pb-24 md:pb-12 bg-[#0b1325] overflow-y-auto">
        <TopAppBar />
        <div className="px-6 py-8 max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-on-surface text-4xl md:text-5xl font-black tracking-tighter mb-2">
                Transaksi <span className="text-primary/60 font-mono text-2xl md:text-3xl ml-2 tracking-normal">({pagination.total})</span>
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">Pantau dan kelola seluruh dana escrow Anda dengan aman.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-surface-container rounded-xl p-1 flex items-center shadow-inner">
                {filters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => { setStatusFilter(f.value); setPage(1); }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${statusFilter === f.value ? 'bg-surface-container-highest text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSort(sort === 'newest' ? 'oldest' : 'newest')}
                className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface p-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold"
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                <span className="hidden sm:inline">{sort === 'newest' ? 'Terbaru' : 'Terlama'}</span>
              </button>
            </div>
          </div>

          {/* Transaction Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                  <div className="flex gap-6">
                    <div className="w-32 h-32 rounded-lg bg-surface-container-highest/50" />
                    <div className="flex-1 space-y-3">
                      <div className="w-3/4 h-5 bg-surface-container-highest/50 rounded" />
                      <div className="w-1/2 h-3 bg-surface-container-highest/50 rounded" />
                      <div className="w-1/3 h-3 bg-surface-container-highest/50 rounded" />
                    </div>
                  </div>
                </div>
              ))
            ) : transactions.length === 0 ? (
              <div className="col-span-2 text-center py-20 text-on-surface-variant">
                <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">inbox</span>
                <p className="text-lg font-bold">Belum ada transaksi</p>
                <p className="text-sm mt-2">Mulai transaksi pertama Anda sekarang</p>
              </div>
            ) : (
              transactions.map((tx) => {
                const config = statusMap[tx.status] || statusMap.pending;
                const isSellerActionRequired = tx.status === 'waiting_seller_action';
                
                return (
                  <div key={tx.id} onClick={() => navigate(`/transaction/${tx.id}`)} className="cursor-pointer">
                    {isSellerActionRequired && (
                      <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-t-xl text-xs font-bold animate-pulse flex items-center justify-center">
                        Transaksi Baru, Butuh Tindakan Anda
                      </div>
                    )}
                    <TransactionCard
                      {...config}
                      title={tx.itemName}
                      id={tx.id?.slice(0, 16) || tx.id}
                      time={tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('id-ID') : ''}
                      category={tx.category || 'Lainnya'}
                      userImage=""
                      username={tx.counterpartyUsername ? `@${tx.counterpartyUsername}` : '@user'}
                      price={formatCurrency(tx.amount)}
                      image={tx.imageUrl || 'https://placehold.co/200x200/1d263a/44e5c2?text=' + encodeURIComponent(tx.itemName?.charAt(0) || '?')}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${p === page ? 'bg-primary text-on-primary shadow-lg shadow-primary/30 font-black' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}`}
                >
                  {p}
                </button>
              ))}
              {pagination.totalPages > 5 && <span className="text-outline-variant mx-1">...</span>}
              {pagination.totalPages > 5 && (
                <button
                  onClick={() => setPage(pagination.totalPages)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold ${page === pagination.totalPages ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}`}
                >
                  {pagination.totalPages}
                </button>
              )}
              <button
                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                disabled={page === pagination.totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </main>
      <FloatingActionButton />
      <MobileBottomNav />
    </div>
  );
};

export default Transactions;
