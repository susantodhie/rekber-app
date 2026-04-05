import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEscrowList } from '../hooks/useEscrow';

const formatCurrency = (amount) => {
  if (amount == null) return 'Rp 0';
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return new Intl.NumberFormat('id-ID').format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusConfig = {
  pending_payment: { label: 'Pending', classes: 'bg-surface-variant/40 text-on-surface-variant' },
  pending: { label: 'Pending', classes: 'bg-surface-variant/40 text-on-surface-variant' },
  paid: { label: 'Proses', classes: 'bg-secondary/10 text-secondary' },
  waiting_seller_action: { label: 'Tindakan Penjual', classes: 'bg-orange-500/20 text-orange-400' },
  waiting_both_parties: { label: 'Menunggu', classes: 'bg-yellow-500/20 text-yellow-400' },
  chat_active: { label: 'Chat Aktif', classes: 'bg-blue-500/20 text-blue-400' },
  transaction_started: { label: 'Berjalan', classes: 'bg-cyan-500/20 text-cyan-400' },
  waiting_verification: { label: 'Verifikasi', classes: 'bg-purple-500/20 text-purple-400' },
  payment_rejected: { label: 'Ditolak', classes: 'bg-error/10 text-error' },
  verified: { label: 'Terverifikasi', classes: 'bg-green-500/20 text-green-400' },
  shipped: { label: 'Dikirim', classes: 'bg-secondary/10 text-secondary' },
  success: { label: 'Sukses', classes: 'bg-primary/10 text-primary' },
  completed: { label: 'Selesai', classes: 'bg-primary/10 text-primary' },
  cancelled: { label: 'Batal', classes: 'bg-surface-variant/40 text-on-surface-variant' },
  disputed: { label: 'Sengketa', classes: 'bg-error/10 text-error' },
};

const categoryIcons = {
  'Elektronik': 'smartphone',
  'Fashion': 'checkroom',
  'Games': 'sports_esports',
  'Otomotif': 'directions_car',
  default: 'shopping_bag',
};

const TransactionTable = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useEscrowList({ pageSize: 5, sort: 'newest' });
  const transactions = data?.transactions || [];

  return (
    <div className="lg:col-span-8 space-y-4">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h3 className="text-xl font-bold text-on-surface">Transaksi Terbaru</h3>
          <p className="text-sm text-on-surface-variant">Lacak status transaksi real-time kamu</p>
        </div>
        <button onClick={() => navigate('/transactions')} className="text-xs text-primary font-bold hover:underline">Lihat Semua</button>
      </div>
      <div className="surface-container rounded-xl overflow-hidden glass border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high/50 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
              <th className="py-4 px-4 w-10"><input className="rounded border-outline-variant bg-surface-container-lowest text-primary focus:ring-primary" type="checkbox" /></th>
              <th className="py-4 px-4">Transaksi</th>
              <th className="py-4 px-4">Tgl</th>
              <th className="py-4 px-4 text-center">Status</th>
              <th className="py-4 px-4 text-right">Rp</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  <td className="py-4 px-4"><div className="w-4 h-4 bg-surface-container-highest/50 rounded animate-pulse" /></td>
                  <td className="py-4 px-4"><div className="w-32 h-4 bg-surface-container-highest/50 rounded animate-pulse" /></td>
                  <td className="py-4 px-4"><div className="w-20 h-4 bg-surface-container-highest/50 rounded animate-pulse" /></td>
                  <td className="py-4 px-4"><div className="w-16 h-4 bg-surface-container-highest/50 rounded animate-pulse mx-auto" /></td>
                  <td className="py-4 px-4"><div className="w-12 h-4 bg-surface-container-highest/50 rounded animate-pulse ml-auto" /></td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">inbox</span>
                  Belum ada transaksi
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const status = statusConfig[tx.status] || statusConfig.pending;
                const icon = categoryIcons[tx.category] || categoryIcons.default;
                return (
                  <tr key={tx.id} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                    <td className="py-4 px-4"><input className="rounded border-outline-variant bg-surface-container-lowest text-primary focus:ring-primary" type="checkbox" /></td>
                    <td className="py-4 px-4 cursor-pointer hover:bg-white/10" onClick={() => navigate(`/transaction/${tx.id}`)}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
                        </div>
                        <span className="font-medium text-on-surface hover:text-primary transition-colors">{tx.itemName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-on-surface-variant">{formatDate(tx.createdAt)}</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded ${status.classes} text-[10px] font-bold uppercase tracking-wider glass`}>{status.label}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right mono-text font-bold">{formatCurrency(tx.amount)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
