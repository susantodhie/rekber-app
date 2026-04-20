import React, { useState } from 'react';
import { usePendingWithdrawals, useProcessWithdrawal } from './hooks/useAdmin';
import TopAppBar from './components/TopAppBar';
import Sidebar from './components/Sidebar';

export default function AdminWithdrawals() {
  const { data: withdrawalsList, isLoading } = usePendingWithdrawals();
  const processMutation = useProcessWithdrawal();
  const [processingId, setProcessingId] = useState(null);

  const withdrawals = withdrawalsList || [];

  const handleProcess = async (id, approve) => {
    if (!window.confirm(`Are you sure you want to ${approve ? 'APPROVE' : 'REJECT'} this withdrawal?`)) return;
    
    setProcessingId(id);
    try {
      await processMutation.mutateAsync({ id, approve });
    } catch (e) {
      alert("Failed to process withdrawal: " + (e.message || "Unknown error"));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary selection:text-on-primary min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen">
        <TopAppBar />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-5xl mx-auto">
          <div className="glass-card ghost-border rounded-3xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-xl font-black font-headline tracking-tight mb-2">Pending Requests</h2>
            <p className="text-xs text-on-surface-variant font-medium mb-8">Remember to manually transfer funds to the user's bank account before clicking APPROVE.</p>

            <div className="space-y-4">
              {isLoading ? (
                <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading withdrawal requests...</div>
              ) : withdrawals.length > 0 ? (
                withdrawals.map((item) => (
                  <div key={item.id} className="bg-surface-container-low border border-white/5 p-5 flex flex-col md:flex-row gap-4 justify-between items-center rounded-2xl hover:bg-white/5 transition-all">
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold">{item.bankName}</span>
                        <span className="text-on-surface-variant text-xs">&bull;</span>
                        <span className="font-mono text-xs">{item.accountNumber}</span>
                      </div>
                      <div className="text-xs text-on-surface-variant mb-1">Name: <span className="font-bold text-white">{item.accountName}</span></div>
                      <div className="text-xs text-on-surface-variant">Amount: <span className="text-primary font-bold font-mono text-sm leading-none ml-1">Rp {Number(item.amount).toLocaleString('id-ID')}</span></div>
                      <div className="text-[10px] text-on-surface-variant/50 mt-2">Requested: {new Date(item.createdAt).toLocaleString()}</div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        disabled={processingId === item.id}
                        onClick={() => handleProcess(item.id, false)}
                        className="bg-error/10 text-error border border-error/20 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-error/20 disabled:opacity-50 transition-all font-['Inter'] flex items-center gap-2"
                      >
                         Reject
                      </button>
                      <button 
                         disabled={processingId === item.id}
                         onClick={() => handleProcess(item.id, true)}
                         className="bg-[#00c9a7]/10 text-[#00c9a7] border border-[#00c9a7]/20 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#00c9a7]/20 disabled:opacity-50 transition-all font-['Inter'] flex items-center gap-2"
                      >
                         <span className="material-symbols-outlined text-[16px]">check_circle</span> Approve
                      </button>
                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">all_done</span>
                  <p className="text-sm">No pending withdrawal requests.</p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
