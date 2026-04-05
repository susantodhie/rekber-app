import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKycStatus, useSubmitKyc } from './hooks/useKyc';

export default function KYCCenter() {
  const navigate = useNavigate();
  const { data: kycStatus, isLoading: statusLoading } = useKycStatus();
  const submitKycMutation = useSubmitKyc();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    nik: '',
    birthDate: '',
    ktpFile: null,
    selfieFile: null
  });
  const [error, setError] = useState('');

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(curr => curr + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(curr => curr - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, field) => {
    setFormData(prev => ({ ...prev, [field]: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!formData.fullName || !formData.nik || !formData.birthDate) {
      setError('Lengkapi semua data identitas');
      return;
    }
    if (!formData.ktpFile || !formData.selfieFile) {
      setError('Upload foto KTP dan selfie diperlukan');
      return;
    }

    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('nik', formData.nik);
    data.append('birthDate', formData.birthDate);
    data.append('ktpFile', formData.ktpFile);
    data.append('selfieFile', formData.selfieFile);

    try {
      await submitKycMutation.mutateAsync(data);
      // Will refetch KYC status and show "pending" state
    } catch (err) {
      setError(err?.error || 'Gagal mengirim data verifikasi');
    }
  };

  const getProgressPercentage = () => {
    if (currentStep === 1) return '16%';
    if (currentStep === 2) return '50%';
    if (currentStep === 3) return '84%';
    return '16%';
  };

  // If already submitted or approved, show status
  if (!statusLoading && kycStatus?.status === 'verified') {
    return (
      <div className="bg-background text-on-background font-body min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <span className="material-symbols-outlined text-primary text-7xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <h1 className="text-3xl font-bold mb-2">Akun Terverifikasi</h1>
          <p className="text-on-surface-variant mb-6">Verifikasi KYC Anda telah disetujui. Anda memiliki akses penuh ke semua fitur.</p>
          <button onClick={() => navigate('/')} className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold">Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }

  if (!statusLoading && kycStatus?.status === 'pending') {
    return (
      <div className="bg-background text-on-background font-body min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <span className="material-symbols-outlined text-secondary text-7xl mb-4 block animate-pulse">hourglass_top</span>
          <h1 className="text-3xl font-bold mb-2">Sedang Diproses</h1>
          <p className="text-on-surface-variant mb-6">Data verifikasi Anda sedang dalam review oleh tim kami. Proses ini memakan waktu 1-2 hari kerja.</p>
          <button onClick={() => navigate('/')} className="px-8 py-3 bg-surface-container-high text-on-surface rounded-xl font-bold">Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary selection:text-on-primary font-['Inter',sans-serif]">
      {/* TopAppBar Shell */}
      <header className="bg-[#0b1325]/80 backdrop-blur-xl fixed top-0 w-full z-50 shadow-[0_20px_50px_rgba(56,222,187,0.05)]">
        <div className="flex justify-between items-center px-6 py-4 w-full">
          <div className="flex items-center gap-4">
            <span className="font-['Inter'] font-black text-xl tracking-tighter text-[#00c9a7] cursor-pointer" onClick={() => navigate('/')}>KINETIC TRUST</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-[#2d3448] transition-colors text-on-surface-variant active:scale-95 duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex min-h-screen pt-[72px]">
        {/* Main Content Canvas */}
        <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto pb-32">
          {/* Stepper Container */}
          <div className="mb-12">
            <div className="flex justify-between items-center relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-high -translate-y-1/2 z-0"></div>
              <div className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500 ease-out" style={{ width: getProgressPercentage() }}></div>
              
              {[1, 2, 3].map((step) => (
                <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-300 ${currentStep >= step ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(68,229,194,0.3)]' : 'bg-surface-container-highest border border-outline-variant text-on-surface-variant'}`}>
                    {step}
                  </div>
                  <span className={`text-xs uppercase tracking-widest transition-colors duration-300 ${currentStep >= step ? 'font-bold text-primary' : 'font-medium text-on-surface-variant opacity-60'}`}>
                    {step === 1 ? 'Data Diri' : step === 2 ? 'Foto KTP' : 'Selfie Verifikasi'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium">
              {error}
            </div>
          )}

          {submitKycMutation.isSuccess && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm font-medium">
              Data verifikasi berhasil dikirim! Tim kami akan memproses dalam 1-2 hari kerja.
            </div>
          )}

          {/* KYC Form Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-[rgba(45,52,72,0.6)] backdrop-blur-md rounded-3xl p-8 border border-outline-variant/20 shadow-2xl relative overflow-hidden min-h-[400px]">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              
              {currentStep === 1 && (
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-primary text-3xl">person_pin_circle</span>
                    <div>
                      <h1 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Data Identitas</h1>
                      <p className="text-on-surface-variant text-sm">Pastikan data sesuai dengan kartu identitas resmi Anda.</p>
                    </div>
                  </div>
                  <form className="space-y-6" onSubmit={e => e.preventDefault()}>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Nama Lengkap (sesuai KTP)</label>
                      <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-5 py-4 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all font-mono" placeholder="CONTOH: BUDI SANTOSO" type="text" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">NIK (16 Digit)</label>
                      <input name="nik" value={formData.nik} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-5 py-4 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all font-mono tracking-[0.2em]" placeholder="3271xxxxxxxxxxxx" type="text" maxLength={16} />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Tanggal Lahir</label>
                      <div className="relative">
                        <input name="birthDate" value={formData.birthDate} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-5 py-4 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all appearance-none" type="date" />
                        <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none">calendar_today</span>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-primary text-3xl">id_card</span>
                    <div>
                      <h1 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Unggah Foto KTP</h1>
                      <p className="text-on-surface-variant text-sm">Posisikan KTP Anda di dalam bingkai, pastikan pencahayaan cukup.</p>
                    </div>
                  </div>
                  <div className="mt-8 border-2 border-dashed border-primary/30 rounded-2xl bg-surface-container-lowest/50 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/60 transition-colors relative">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileUpload(e, 'ktpFile')} />
                    {formData.ktpFile ? (
                      <div className="text-primary flex flex-col items-center">
                        <span className="material-symbols-outlined text-5xl mb-2">check_circle</span>
                        <span className="font-medium">{formData.ktpFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4">add_photo_alternate</span>
                        <p className="text-on-surface font-bold mb-2">Klik atau drag file ke area ini</p>
                        <p className="text-xs text-on-surface-variant">Format: JPG, PNG (Max. 5MB)</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-primary text-3xl">camera_front</span>
                    <div>
                      <h1 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Selfie & Liveness</h1>
                      <p className="text-on-surface-variant text-sm">Ambil swafoto yang jelas dengan pencahayaan yang cukup.</p>
                    </div>
                  </div>
                  <div className="mt-8 border-2 border-dashed border-primary/30 rounded-2xl bg-surface-container-lowest/50 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/60 transition-colors relative">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,video/*" capture="user" onChange={(e) => handleFileUpload(e, 'selfieFile')} />
                    {formData.selfieFile ? (
                      <div className="text-primary flex flex-col items-center">
                        <span className="material-symbols-outlined text-5xl mb-2">check_circle</span>
                        <span className="font-medium">{formData.selfieFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4">face</span>
                        <p className="text-on-surface font-bold mb-2">Buka Kamera</p>
                        <p className="text-xs text-on-surface-variant">Ikuti instruksi liveness check di layar</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Preview sidebar */}
            <div className="lg:col-span-5 space-y-6">
              <div className={`bg-surface-container p-6 rounded-3xl border border-outline-variant/10 transition-all duration-300 ${currentStep === 2 ? 'ring-2 ring-primary bg-surface-container-high' : 'opacity-60'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant">id_card</span>
                    Step 2: Foto KTP
                  </h3>
                  {formData.ktpFile ? (
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">TERUNGGAH</span>
                  ) : (
                    <span className="text-[10px] bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant">PREVIEW</span>
                  )}
                </div>
                <div className={`aspect-video rounded-xl border-2 border-dashed border-outline-variant flex items-center justify-center bg-surface-container-low p-4 ${formData.ktpFile ? 'bg-primary/5 border-primary/40' : ''}`}>
                  {formData.ktpFile ? (
                    <span className="material-symbols-outlined text-4xl text-primary">image</span>
                  ) : (
                    <button className="px-6 py-2 bg-surface-container-highest text-outline text-xs font-bold rounded-lg cursor-not-allowed" disabled>Upload File</button>
                  )}
                </div>
              </div>

              <div className={`bg-surface-container p-6 rounded-3xl border border-outline-variant/10 transition-all duration-300 ${currentStep === 3 ? 'ring-2 ring-primary bg-surface-container-high' : 'opacity-60'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant">camera_front</span>
                    Step 3: Selfie
                  </h3>
                  {formData.selfieFile ? (
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">TERUNGGAH</span>
                  ) : (
                    <span className="text-[10px] bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant">PREVIEW</span>
                  )}
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/5">
                  <span className="material-symbols-outlined text-secondary">info</span>
                  <p className="text-xs leading-relaxed text-on-surface-variant">
                    Wajah dan KTP harus terlihat jelas dalam satu frame. Pastikan pencahayaan cukup.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 rounded-3xl bg-primary/5 border border-primary/10">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-primary uppercase tracking-widest">End-to-End Encrypted</div>
                  <div className="text-[10px] text-on-surface-variant">Data Anda dienkripsi menggunakan standar AES-256 dan hanya digunakan untuk keperluan verifikasi.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-surface/80 backdrop-blur-md flex justify-center items-center gap-6 border-t border-outline-variant/10 z-10">
            <button onClick={handlePrev} className={`px-8 py-4 bg-surface-container-high text-outline font-bold text-sm rounded-full active:scale-95 transition-transform flex items-center gap-2 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container-highest text-on-surface'}`} disabled={currentStep === 1}>
              <span className="material-symbols-outlined">arrow_back</span>
              KEMBALI
            </button>
            {currentStep < 3 ? (
              <button onClick={handleNext} className="flex-1 max-w-md px-8 py-4 bg-primary text-on-primary font-bold text-sm rounded-full active:scale-95 hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(68,229,194,0.3)]">
                SELANJUTNYA
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!formData.ktpFile || !formData.selfieFile || submitKycMutation.isPending}
                className={`flex-1 max-w-md px-8 py-4 font-bold text-sm rounded-full active:scale-95 transition-all flex items-center justify-center gap-3 ${formData.ktpFile && formData.selfieFile ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(68,229,194,0.3)] hover:brightness-110' : 'bg-surface-container text-outline opacity-50 cursor-not-allowed'}`}
              >
                {submitKycMutation.isPending ? 'MENGIRIM...' : 'KIRIM DATA VERIFIKASI'}
                <span className="material-symbols-outlined">send</span>
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
