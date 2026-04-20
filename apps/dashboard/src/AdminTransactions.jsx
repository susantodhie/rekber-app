import React, { useState } from 'react';
import { useAdminTransactions } from './hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import TopAppBar from './components/TopAppBar';
import Sidebar from './components/Sidebar';

export default function AdminTransactions() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminTransactions({ page, pageSize: 20 });
  const navigate = useNavigate();

  const transactions = data?.transactions || [];
  const pagination = data?.pagination || { totalPages: 1 };

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary selection:text-on-primary min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen">
        <TopAppBar />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-6xl mx-auto">
          <div className="glass-card ghost-border rounded-3xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-xl font-black font-headline tracking-tight mb-6">Global Escrow Directory</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    <th className="p-4">Tx ID</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-on-surface-variant animate-pulse">Loading transactions...</td>
                    </tr>
                  ) : transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono text-xs">{tx.id.substring(0,8)}...</td>
                        <td className="p-4 text-sm font-bold">{tx.title}</td>
                        <td className="p-4 text-sm font-mono text-primary">Rp {Number(tx.totalAmount).toLocaleString('id-ID')}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                            ${tx.status === 'completed' ? 'bg-[#00c9a7]/20 text-[#00c9a7]' : 
                              tx.status === 'disputed' ? 'bg-error/20 text-error' : 
                              'bg-secondary/20 text-secondary'}`}>
                            {tx.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-medium text-on-surface-variant">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => navigate(`/transactions/${tx.id}`)}
                            className="bg-surface-container-lowest border border-white/10 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-on-surface-variant">No transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/10">
              <button 
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 bg-surface-container-low rounded-lg text-xs font-bold disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-on-surface-variant">Page {page} of {pagination.totalPages}</span>
              <button 
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-surface-container-low rounded-lg text-xs font-bold disabled:opacity-50"
              >
                Next
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
