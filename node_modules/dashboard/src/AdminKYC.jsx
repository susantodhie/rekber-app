import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopAppBar from './components/TopAppBar';
import MobileBottomNav from './components/MobileBottomNav';
import apiClient from './lib/apiClient';
import { signOut } from './lib/authClient';

const AdminKYC = () => {
  const navigate = useNavigate();
  const [kycList, setKycList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // userId of currently processing KYC
  const [previewImage, setPreviewImage] = useState(null);

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return `${apiBase}${path}`;
  };

  const fetchPendingKyc = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/admin/kyc/pending');
      // The interceptor unwraps, but let's be careful. Usually it returns the payload { success, data }
      setKycList(response.data || []);
    } catch (error) {
      console.error('Failed to fetch pending KYC', error);
      alert('Failed to fetch pending KYC');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingKyc();
  }, []);

  const handleAction = async (userId, isApprove) => {
    if (!window.confirm(`Are you sure you want to ${isApprove ? 'approve' : 'reject'} KYC for this user?`)) {
      return;
    }

    try {
      setActionLoading(userId);
      const endpoint = isApprove ? `/admin/kyc/approve/${userId}` : `/admin/kyc/reject/${userId}`;
      await apiClient.post(endpoint);
      
      // Remove from list or refetch
      setKycList(prev => prev.filter(k => k.userId !== userId));
    } catch (error) {
      console.error('Failed to process KYC', error);
      alert('Failed to process KYC');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#0b1325]">
      <Sidebar />
      <main className="flex-1 md:ml-[260px] min-h-screen pb-24 md:pb-12 bg-[#0b1325] overflow-y-auto">
        <TopAppBar />
        
        <div className="px-6 py-8 max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-on-surface text-4xl md:text-5xl font-black tracking-tighter mb-2">
                Admin KYC <span className="text-primary/60 font-mono text-2xl md:text-3xl ml-2 tracking-normal">({kycList.length})</span>
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">Review and process user KYC submissions.</p>
            </div>
            
            <button
              onClick={async () => {
                await signOut();
                navigate('/admin/login');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg font-bold text-sm transition-colors border border-error/20 w-fit"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Admin Logout
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {isLoading ? (
              <div className="glass-card rounded-xl p-8 flex justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : kycList.length === 0 ? (
              <div className="glass-card flex flex-col items-center justify-center py-20 text-on-surface-variant rounded-xl border border-surface-container">
                <span className="material-symbols-outlined text-6xl mb-4 block opacity-20">verified_user</span>
                <p className="text-lg font-bold">No Pending KYC</p>
                <p className="text-sm mt-2">All caught up!</p>
              </div>
            ) : (
              kycList.map(kyc => (
                <div key={kyc.id} className="glass-card rounded-xl p-6 border border-surface-container flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-on-surface">{kyc.fullName} <span className="text-on-surface-variant text-base font-normal">(@{kyc.username})</span></h3>
                      <p className="text-sm font-mono text-on-surface-variant mt-1">NIK: {kyc.nik}</p>
                      <p className="text-sm font-mono text-on-surface-variant">DOB: {new Date(kyc.birthDate).toLocaleDateString()}</p>
                      <p className="text-xs text-on-surface-variant mt-2">Submitted: {new Date(kyc.submittedAt).toLocaleString()}</p>
                    </div>

                    <div className="flex gap-4 mt-4">
                      <button onClick={(e) => { e.preventDefault(); setPreviewImage(getImageUrl(kyc.ktpFileUrl)); }} className="text-primary text-sm hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">badge</span> View KTP
                      </button>
                      <button onClick={(e) => { e.preventDefault(); setPreviewImage(getImageUrl(kyc.selfieFileUrl)); }} className="text-primary text-sm hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">face</span> View Selfie
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <button
                      onClick={() => handleAction(kyc.userId, true)}
                      disabled={actionLoading === kyc.userId}
                      className="flex-1 md:flex-none btn-glow text-on-primary px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(kyc.userId, false)}
                      disabled={actionLoading === kyc.userId}
                      className="flex-1 md:flex-none bg-error/20 text-error hover:bg-error hover:text-on-error px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">cancel</span>
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
      <MobileBottomNav />

      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-screen flex flex-col items-center">
            <button 
              className="absolute -top-12 right-0 text-white bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <img 
              src={previewImage} 
              alt="KYC Document Preview" 
              className="max-w-full max-h-[75vh] rounded-xl shadow-2xl object-scale-down bg-[#0b1325]/10 border border-outline-variant/20"
              onClick={(e) => e.stopPropagation()} 
            />
            <div className="mt-6 flex justify-center">
              <a 
                 href={previewImage} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(68,229,194,0.3)] transition-all"
                 onClick={(e) => e.stopPropagation()}
              >
                <span className="material-symbols-outlined">open_in_new</span>
                Buka di Tab Baru
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKYC;
