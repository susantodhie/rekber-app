import React, { useState } from 'react';
import { useBankAccounts, useDeleteBankAccount, useSetPrimaryBank, useAddBankAccount } from '../hooks/useWallet';
import { useKycStatus } from '../hooks/useKyc';

const BankAccounts = () => {
  const { data: accounts = [], isLoading } = useBankAccounts();
  const deleteMutation = useDeleteBankAccount();
  const setPrimaryMutation = useSetPrimaryBank();
  
  const addMutation = useAddBankAccount();
  
  const { data: kycStatus } = useKycStatus();
  const isVerified = kycStatus?.status === 'verified';

  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    bankName: '',
    bankCode: '000',
    accountNumber: '',
    accountHolder: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.bankName || !formData.accountNumber || !formData.accountHolder) {
      setError('Mohon lengkapi semua data rekening');
      return;
    }

    try {
      await addMutation.mutateAsync(formData);
      setShowModal(false);
      setFormData({ bankName: '', bankCode: '000', accountNumber: '', accountHolder: '' });
    } catch (err) {
      setError(err?.error || 'Gagal menambahkan rekening');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus rekening ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSetPrimary = (id) => {
    setPrimaryMutation.mutate(id);
  };

  return (
    <section>
      <div className="flex justify-between items-end mb-8 px-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Rekening Bank</h2>
          <p className="text-sm text-on-surface-variant">Gunakan rekening ini untuk penarikan dana escrow</p>
        </div>
        <button 
          className={`flex items-center gap-2 font-bold text-sm transition-transform ${isVerified ? 'text-primary hover:underline active:scale-95' : 'text-on-surface-variant/50 cursor-not-allowed'}`}
          disabled={!isVerified}
          onClick={() => setShowModal(true)}
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Tambah Rekening
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-surface-container-high p-8 rounded-[2rem] border border-outline-variant/10 animate-pulse">
              <div className="flex justify-between items-start mb-12">
                <div className="w-16 h-8 bg-surface-container-highest/50 rounded" />
                <div className="w-12 h-5 bg-surface-container-highest/50 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="w-20 h-3 bg-surface-container-highest/50 rounded" />
                <div className="w-40 h-6 bg-surface-container-highest/50 rounded" />
              </div>
            </div>
          ))
        ) : (
          <>
            {accounts.map((account) => (
              <div key={account.id} className="bg-surface-container-high p-8 rounded-[2rem] border border-outline-variant/10 group hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-8xl">account_balance</span>
                </div>
                
                <div className="flex justify-between items-start mb-12 relative z-10">
                  <div className="px-4 py-2 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-blue-700 font-black italic tracking-tighter text-xl">{account.bankName?.toUpperCase()?.slice(0, 4) || 'BANK'}</span>
                  </div>
                  {account.isPrimary ? (
                    <span className="px-3 py-1 bg-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/20">
                      Utama
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetPrimary(account.id)}
                      className="px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border border-outline-variant/20 hover:border-primary/30 hover:text-primary transition-colors"
                    >
                      Set Utama
                    </button>
                  )}
                </div>
                
                <div className="space-y-1 relative z-10">
                  <p className="text-on-surface-variant text-xs uppercase tracking-widest font-medium">Account Number</p>
                  <p className="font-mono text-2xl tracking-widest text-on-surface">
                    {account.accountNumber?.replace(/(\d{4})(?=\d)/g, '$1 ') || '-'}
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-between items-center relative z-10">
                  <span className="text-sm font-semibold text-on-surface/80 tracking-wide uppercase">{account.accountHolder}</span>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="text-on-surface-variant hover:text-error transition-colors p-1"
                      aria-label="Delete bank account"
                      disabled={deleteMutation.isPending}
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                    <button className="text-on-surface-variant hover:text-primary transition-colors p-1" aria-label="Edit bank account">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add New Card Skeleton */}
            <div 
               onClick={() => { if (isVerified) setShowModal(true) }}
               className={`border-2 border-dashed ${isVerified ? 'border-outline-variant/20 hover:bg-surface-container/30 cursor-pointer' : 'border-error/20 bg-error/5 cursor-not-allowed opacity-75'} rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 group transition-all`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner border ${isVerified ? 'bg-surface-container-high border-outline-variant/10 group-hover:scale-110 transition-transform' : 'bg-error/10 border-error/20'}`}>
                <span className={`material-symbols-outlined text-3xl ${isVerified ? 'text-outline group-hover:text-primary transition-colors' : 'text-error'}`}>{isVerified ? 'add_card' : 'lock'}</span>
              </div>
              <div className="text-center">
                 {isVerified ? (
                    <>
                      <p className="font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">Tambah Rekening Baru</p>
                      <p className="text-xs text-outline/60 mt-1">Mendukung semua Bank di Indonesia</p>
                    </>
                 ) : (
                    <>
                      <p className="font-bold text-error">Verifikasi akun diperlukan</p>
                      <p className="text-xs text-error/80 mt-1">Selesaikan KYC untuk tambah rekening</p>
                    </>
                 )}
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container-high w-full max-w-lg rounded-3xl p-8 border border-outline-variant/20 relative shadow-2xl">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface transition-colors rounded-full bg-surface-container p-2"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <h3 className="text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">account_balance</span>
              Tambah Rekening Baru
            </h3>
            
            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleAddAccount} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Nama Bank</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">account_balance_wallet</span>
                  <input
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="Contoh: BCA, MANDIRI, BRI"
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl pl-12 pr-4 py-4 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all uppercase"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Nomor Rekening</label>
                <input
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Masukkan 10-15 digit nomor"
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-4 text-lg font-mono font-bold text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Nama Pemilik Rekening</label>
                <input
                  name="accountHolder"
                  value={formData.accountHolder}
                  onChange={handleInputChange}
                  placeholder="Sesuai buku tabungan"
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-4 text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all uppercase"
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                disabled={addMutation.isPending}
                className="w-full mt-4 bg-primary text-on-primary py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {addMutation.isPending ? 'MENYIMPAN...' : 'SIMPAN REKENING'}
                {!addMutation.isPending && <span className="material-symbols-outlined text-sm">save</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default BankAccounts;
