import React, { useState } from 'react';
import { useBankAccounts, useRequestWithdrawal } from '../hooks/useWallet';
import { useVerifyPin } from '../hooks/useUser';
import { useKycStatus } from '../hooks/useKyc';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (amount) => {
  if (amount == null) return '';
  return new Intl.NumberFormat('id-ID').format(amount);
};

const parseCurrency = (str) => {
  return parseInt(str.replace(/\D/g, ''), 10) || 0;
};

const WithdrawalForm = () => {
  const { data: accounts = [] } = useBankAccounts();
  const withdrawMutation = useRequestWithdrawal();
  const verifyPinMutation = useVerifyPin();
  const navigate = useNavigate();
  
  const { data: kycStatus } = useKycStatus();
  const isVerified = kycStatus?.status === 'verified';

  const [amount, setAmount] = useState('1.000.000');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmount(raw ? formatCurrency(parseInt(raw, 10)) : '');
  };

  const handlePinChange = (index, value) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`pin-${index + 1}`);
      next?.focus();
    }
  };

  const handleSubmit = async () => {
    setError('');
    const numericAmount = parseCurrency(amount);
    if (numericAmount < 50000) {
      setError('Minimum penarikan Rp 50.000');
      return;
    }

    const fullPin = pin.join('');
    if (fullPin.length !== 6) {
      setError('PIN harus 6 digit');
      return;
    }

    const bankAccountId = selectedAccount || accounts[0]?.id;
    if (!bankAccountId) {
      setError('Pilih rekening tujuan');
      return;
    }

    try {
      await withdrawMutation.mutateAsync({
        amount: numericAmount,
        bankAccountId,
        pin: fullPin,
      });
      setPin(['', '', '', '', '', '']);
      setAmount('');
    } catch (err) {
      setError(err?.error || 'Penarikan gagal');
    }
  };

  return (
    <div className="lg:col-span-4">
      <div className="sticky top-32 glass-card p-8 rounded-[2rem] border border-primary/20 shadow-[0_0_50px_rgba(68,229,194,0.05)] space-y-8 relative overflow-hidden">
        
        {!isVerified && (
          <div className="absolute inset-0 z-50 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center border border-error/20 rounded-[2rem]">
             <span className="material-symbols-outlined text-error text-6xl mb-4">lock</span>
             <h3 className="text-xl font-bold text-on-surface mb-2">Verifikasi Diperlukan</h3>
             <p className="text-sm text-on-surface-variant font-medium">Anda belum bisa menarik dana. Selesaikan prosedur KYC untuk mengaktifkan fitur ini.</p>
             <button className="mt-6 px-6 py-2 bg-gradient-to-r from-primary-container to-secondary-container rounded-lg text-on-primary font-bold text-sm" onClick={() => navigate('/kyc')}>
               Mulai Verifikasi KYC
             </button>
          </div>
        )}

        <div>
          <h3 className="text-xl font-black text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">account_balance</span>
            Penarikan Dana
          </h3>
          <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">Dana akan diproses dalam 1x24 jam ke rekening tujuan Anda.</p>
        </div>

        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-xs font-medium">
            {error}
          </div>
        )}

        {withdrawMutation.isSuccess && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-xs font-medium">
            Penarikan berhasil diajukan!
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Jumlah Penarikan</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-primary">Rp</span>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg pl-12 pr-4 py-4 text-xl font-mono font-bold focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all"
                type="text"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Rekening Tujuan</label>
            <div className="relative">
              <select
                className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-lg px-4 py-4 appearance-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all cursor-pointer font-bold"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                {accounts.length === 0 ? (
                  <option value="">Belum ada rekening</option>
                ) : (
                  accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankName} - {acc.accountNumber}
                    </option>
                  ))
                )}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1 block text-center">Masukkan 6-Digit PIN Transaksi</label>
            <div className="flex justify-between gap-2">
              {pin.map((digit, i) => (
                <input
                  key={i}
                  id={`pin-${i}`}
                  className="w-10 h-12 bg-surface-container-lowest border border-outline-variant/20 rounded text-center font-mono text-xl focus:border-primary transition-all"
                  maxLength={1}
                  type="password"
                  value={digit}
                  onChange={(e) => handlePinChange(i, e.target.value)}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isVerified || withdrawMutation.isPending}
            className="w-full bg-gradient-to-r from-primary-container to-secondary-container text-on-primary py-4 rounded-lg font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {withdrawMutation.isPending ? 'MEMPROSES...' : 'Konfirmasi Penarikan'}
          </button>
        </div>

        <div className="pt-4 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Sistem Keamanan Aktif</span>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalForm;
