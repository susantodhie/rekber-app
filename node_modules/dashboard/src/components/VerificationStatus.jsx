import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKycStatus } from '../hooks/useKyc';

const VerificationStatus = () => {
  const navigate = useNavigate();
  const { data: kycStatus, isLoading } = useKycStatus();

  const status = kycStatus?.status; // 'unverified', 'pending', 'verified', 'rejected'
  const isVerified = status === 'verified';
  const isPending = status === 'pending';
  const isRejected = status === 'rejected';

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="glass-card rounded-[3rem] p-8 border border-outline-variant/10">
          <div className="w-full h-40 bg-surface-container-highest/30 rounded-xl animate-pulse" />
        </div>
      </section>
    );
  }

  if (isVerified) {
    return (
      <section className="mb-12">
        <div className="glass-card rounded-[3rem] p-1 border border-primary/20 shadow-[0_0_20px_rgba(68,229,194,0.1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent pointer-events-none"></div>
          <div className="relative z-10 p-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-on-surface">Akun Terverifikasi</h2>
              <p className="text-primary font-bold text-sm tracking-wide uppercase mt-1">KYC Approved ✓</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="glass-card rounded-[3rem] p-1 border border-outline-variant/10 shadow-[0_0_20px_rgba(68,229,194,0.1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent pointer-events-none"></div>
        <div className="relative z-10 p-8 flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${isPending ? 'bg-secondary/10 text-secondary border-secondary/20' : isRejected ? 'bg-error/10 text-error border-error/20' : 'bg-error/10 text-error border-error/20'}`}>
                <span className="material-symbols-outlined text-4xl">
                  {isPending ? 'hourglass_top' : 'circle_notifications'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Verification Status</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${isPending ? 'bg-secondary' : 'bg-error'} animate-pulse`}></span>
                  <span className={`${isPending ? 'text-secondary' : 'text-error'} font-bold text-sm tracking-wide uppercase`}>
                    {isPending ? 'Sedang Diproses' : isRejected ? 'Ditolak' : 'Belum Terverifikasi'}
                  </span>
                </div>
              </div>
            </div>
            
            {isRejected && kycStatus?.rejectionReason && (
              <div className="mb-6 p-4 bg-error/5 border border-error/20 rounded-xl">
                <p className="text-error text-sm font-medium">Alasan: {kycStatus.rejectionReason}</p>
              </div>
            )}

            <p className="text-on-surface-variant mb-8 leading-relaxed">
              {isPending
                ? 'Data verifikasi Anda sedang dalam proses review oleh tim kami. Proses ini biasanya memakan waktu 1-2 hari kerja.'
                : 'Tingkatkan keamanan akun Anda dan buka akses ke seluruh fitur premium dengan melengkapi proses Know Your Customer (KYC).'
              }
            </p>
            
            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary text-xl">payments</span>
                </div>
                <span className="text-on-surface font-medium">Bisa melakukan penarikan dana</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary text-xl">trending_up</span>
                </div>
                <span className="text-on-surface font-medium">Limit transaksi lebih besar</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary text-xl">verified</span>
                </div>
                <span className="text-on-surface font-medium">Lencana terverifikasi di profil</span>
              </div>
            </div>
            
            {!isPending && (
              <button
                onClick={() => navigate('/kyc')}
                className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-black text-sm uppercase tracking-[0.15em] rounded-xl hover:shadow-[0_0_30px_rgba(68,229,194,0.3)] transition-all active:scale-[0.98]"
              >
                {isRejected ? 'Kirim Ulang Verifikasi' : 'Mulai Verifikasi Sekarang'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerificationStatus;
