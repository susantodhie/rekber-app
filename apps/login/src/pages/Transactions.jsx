import React from 'react';
import { useNavigate } from 'react-router-dom';

const Transactions = () => {
  const navigate = useNavigate();
  // Mock Data
  const transactions = [
    { id: 'TRX-1029', item: 'MacBook Pro M3 Max', role: 'Buyer', amount: 'Rp 45.000.000', status: 'Pending', date: 'Oct 10, 2024' },
    { id: 'TRX-1028', item: 'Sony A7IV Camera', role: 'Seller', amount: 'Rp 32.500.000', status: 'Completed', date: 'Oct 05, 2024' },
    { id: 'TRX-1027', item: 'Figma Annual License', role: 'Buyer', amount: 'Rp 2.100.000', status: 'Cancelled', date: 'Sep 28, 2024' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="px-3 py-1 bg-teal-400/10 text-teal-400 border border-teal-400/20 rounded-full text-[10px] font-black tracking-widest uppercase">Completed</span>;
      case 'Pending':
        return <span className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-[10px] font-black tracking-widest uppercase">Pending</span>;
      case 'Cancelled':
      default:
        return <span className="px-3 py-1 bg-error/10 text-error border border-error/20 rounded-full text-[10px] font-black tracking-widest uppercase">Cancelled</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline text-on-surface mb-2">Transactions</h1>
          <p className="text-on-surface-variant text-sm border-l-2 border-primary/50 pl-2">View and manage your escrow history overview.</p>
        </div>
        <button 
          onClick={() => navigate('/create-transaction')}
          className="px-6 py-3 bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-black rounded-lg text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(68,229,194,0.3)] hover:shadow-[0_0_30px_rgba(68,229,194,0.5)] active:scale-[0.98] transition-all uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Escrow
        </button>
      </div>

      <div className="glass-panel border border-outline-variant/20 rounded-xl overflow-hidden bg-surface-container/60 shadow-2xl relative">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 border-b border-outline-variant/20 text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">
                <th className="p-5 whitespace-nowrap">Transaction ID</th>
                <th className="p-5">Item Details</th>
                <th className="p-5">Role</th>
                <th className="p-5">Amount</th>
                <th className="p-5">Date</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-sm">
              {transactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-surface-container-high/50 transition-colors group">
                  <td className="p-5 font-['JetBrains_Mono'] text-on-surface font-semibold tracking-wide text-xs">{trx.id}</td>
                  <td className="p-5 text-on-surface font-bold">{trx.item}</td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${trx.role === 'Buyer' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {trx.role === 'Buyer' ? 'shopping_bag' : 'sell'}
                      </span>
                      {trx.role}
                    </span>
                  </td>
                  <td className="p-5 font-['JetBrains_Mono'] text-on-surface font-black tracking-wide text-md">{trx.amount}</td>
                  <td className="p-5 text-on-surface-variant text-xs font-medium">{trx.date}</td>
                  <td className="p-5">{getStatusBadge(trx.status)}</td>
                  <td className="p-5 text-right">
                    <button className="p-2 bg-surface-container-highest hover:bg-outline-variant/30 text-on-surface-variant hover:text-primary rounded-lg transition-colors inline-flex items-center justify-center">
                       <span className="material-symbols-outlined text-[16px]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                   <td colSpan="7" className="p-10 text-center text-on-surface-variant text-sm font-medium">
                     No transactions found.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
