import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import TransactionAppBar from './components/TransactionAppBar';
import TransactionCard from './components/TransactionCard';
import ChatPanel from './components/ChatPanel';
import { useSession } from './lib/authClient';
import { 
  useEscrowDetail, 
  useJoinTransaction, 
  useStartChat, 
  useUploadProof, 
  useCompleteChat,
  useApprovePayment,
  useRejectPayment,
  useAdminJoinChat
} from './hooks/useEscrow';
import { useMyProfile } from './hooks/useUser';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { data: profile } = useMyProfile();
  const { data: escrow, isLoading } = useEscrowDetail(id);

  const joinTx = useJoinTransaction();
  const startChatCmd = useStartChat();
  const uploadProofCmd = useUploadProof();
  const completeChatCmd = useCompleteChat();
  const approvePaymentCmd = useApprovePayment();
  const rejectPaymentCmd = useRejectPayment();
  const adminJoinCmd = useAdminJoinChat();

  const [proofFile, setProofFile] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const userId = session?.user?.id;
  const isAdmin = profile?.role === 'admin';

  // Auto-join admin to the chat
  useEffect(() => {
    if (isAdmin && id) {
      adminJoinCmd.mutate(id);
    }
  }, [isAdmin, id]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#0b1325] flex items-center justify-center text-white">Loading...</div>;
  }

  if (!escrow) {
    return <div className="min-h-screen bg-[#0b1325] flex items-center justify-center text-white">Transaction Not Found</div>;
  }

  const isBuyer = escrow.buyerId === userId;
  const isSeller = escrow.sellerId === userId;
  
  const hasJoined = isBuyer ? escrow.isBuyerJoined : (isSeller ? escrow.isSellerJoined : false);
  const bothJoined = escrow.isBuyerJoined && escrow.isSellerJoined;
  
  const handleJoin = () => {
    joinTx.mutate(id);
  };

  const handleStart = () => {
    startChatCmd.mutate(id);
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!proofFile) return;
    const fd = new FormData();
    fd.append('proof', proofFile);
    uploadProofCmd.mutate({ id, formData: fd }, {
      onSuccess: () => setProofFile(null)
    });
  };

  const handleApprove = () => {
    approvePaymentCmd.mutate(id, {
      onSuccess: () => setShowApproveModal(false)
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectPaymentCmd.mutate({ id, data: { reason: rejectReason } }, {
      onSuccess: () => {
        setShowRejectModal(false);
        setRejectReason('');
      }
    });
  };

  const statusMap = {
    waiting_seller_action: { text: "Menunggu Penjual", color: { bg: 'bg-orange-500/20', text: 'text-orange-400' } },
    waiting_both_parties: { text: "Menunggu Para Pihak", color: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' } },
    chat_active: { text: "Chat Aktif", color: { bg: 'bg-blue-500/20', text: 'text-blue-400' } },
    transaction_started: { text: "Transaksi Berjalan", color: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' } },
    waiting_verification: { text: "Menunggu Verifikasi Admin", color: { bg: 'bg-purple-500/20', text: 'text-purple-400' } },
    payment_rejected: { text: "Pembayaran Ditolak", color: { bg: 'bg-red-500/20', text: 'text-red-400' } },
    verified: { text: "Terverifikasi", color: { bg: 'bg-green-500/20', text: 'text-green-400' } },
    success: { text: "Sukses", color: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' } },
  };

  const sInfo = statusMap[escrow.status] || { text: escrow.status, color: { bg: 'bg-gray-500/20', text: 'text-gray-400' } };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b1325] text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen relative md:ml-[260px] overflow-hidden">
        <TransactionAppBar title={`TRX-${escrow.txCode}`} />
        
        <div className="flex z-20 lg:hidden bg-[#131b2d] border-b border-[#3c4a45]/20 shrink-0">
          <button 
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'details' ? 'text-[#44e5c2] border-b-2 border-[#44e5c2]' : 'text-[#bacac3] hover:text-[#dbe2fb]'}`}
          >
            Detail Transaksi
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'chat' ? 'text-[#44e5c2] border-b-2 border-[#44e5c2]' : 'text-[#bacac3] hover:text-[#dbe2fb]'}`}
          >
            Diskusi Chat
          </button>
        </div>
        
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          <div className={`flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar space-y-8 ${activeTab === 'details' ? 'block' : 'hidden lg:block'} pb-24 lg:pb-10`}>
            
            {/* INTERACTIVE ACTIONS PANEL */}
            <div className="bg-[#131b2d] p-6 rounded-2xl border border-[#44e5c2]/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#44e5c2]">Aksi Transaksi</h2>
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${sInfo.color.bg} ${sInfo.color.text}`}>
                  {sInfo.text}
                </span>
              </div>
              
              {!hasJoined && !isAdmin && (
                <div className="bg-[#44e5c2]/10 p-4 rounded-xl border border-[#44e5c2]/20 mb-4">
                  <p className="text-sm text-[#dbe2fb] mb-3">Anda harus bergabung untuk melihat chat dan melanjutkan.</p>
                  <button onClick={handleJoin} disabled={joinTx.isPending} className="bg-[#44e5c2] text-[#00382d] px-6 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all active:scale-95 disabled:opacity-50">
                    {joinTx.isPending ? "Bergabung..." : "Gabung Transaksi"}
                  </button>
                </div>
              )}

              {hasJoined && escrow.status === 'chat_active' && bothJoined && (
                <div className="bg-[#44e5c2]/10 p-4 rounded-xl border border-[#44e5c2]/20 mb-4">
                  <p className="text-sm text-[#dbe2fb] mb-3">Kedua belah pihak sudah bergabung. Saatnya memulai transaksi.</p>
                  <button onClick={handleStart} disabled={startChatCmd.isPending} className="bg-[#44e5c2] text-[#00382d] px-6 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all active:scale-95 disabled:opacity-50">
                    Mulai Transaksi
                  </button>
                </div>
              )}

              {/* Upload Proof - visible during transaction_started OR payment_rejected */}
              {(escrow.status === 'transaction_started' || escrow.status === 'payment_rejected') && hasJoined && (
                <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 mb-4">
                  <h3 className="text-sm font-bold text-blue-400 mb-2">Upload Bukti {isBuyer ? 'Pembayaran' : 'Resi / Kesiapan'}</h3>
                  {escrow.status === 'payment_rejected' && (
                    <p className="text-xs text-yellow-300 mb-2">⚠️ Upload ulang bukti yang benar sesuai instruksi admin.</p>
                  )}
                  <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <input type="file" accept="image/*" onChange={e => setProofFile(e.target.files[0])} className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-500/20 file:text-blue-400 file:cursor-pointer" />
                    <button type="submit" disabled={!proofFile || uploadProofCmd.isPending} className="bg-blue-500 text-white px-6 py-2 rounded-lg font-bold text-sm disabled:opacity-50 hover:brightness-110 transition-all active:scale-95">
                      {uploadProofCmd.isPending ? "Uploading..." : "Upload"}
                    </button>
                  </form>
                </div>
              )}

              {/* Buyer Complete Transaction */}
              {isBuyer && escrow.status === 'verified' && (
                <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20 mb-4">
                  <h3 className="text-sm font-bold text-green-400 mb-2">Transaksi Selesai</h3>
                  <p className="text-xs text-green-300 mb-4">Barang/Jasa telah diterima sesuai verifikasi. Dana akan dilepas ke penjual.</p>
                  <button onClick={() => completeChatCmd.mutate(id)} disabled={completeChatCmd.isPending} className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all active:scale-95 disabled:opacity-50">
                    {completeChatCmd.isPending ? "Memproses..." : "Selesaikan Transaksi"}
                  </button>
                </div>
              )}
            </div>

            {/* PAYMENT REJECTION NOTICE */}
            {escrow.status === 'payment_rejected' && escrow.rejectionReason && (
              <div className="bg-red-500/10 p-5 rounded-2xl border border-red-500/30 flex gap-4">
                <span className="material-symbols-outlined text-red-400 text-2xl shrink-0 mt-0.5">error</span>
                <div>
                  <h3 className="text-sm font-bold text-red-400 mb-1">Pembayaran Ditolak oleh Admin</h3>
                  <p className="text-sm text-red-300 leading-relaxed">Alasan: {escrow.rejectionReason}</p>
                  <p className="text-xs text-red-300/60 mt-2">Silakan upload ulang bukti pembayaran yang valid.</p>
                </div>
              </div>
            )}

            {/* UPLOADED PROOFS DISPLAY */}
            {(escrow.paymentProof || escrow.shippingProof) && (
              <div className="bg-[#131b2d] p-6 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">Bukti Transaksi</h2>
                  {/* Payment Status Badge */}
                  {escrow.status === 'waiting_verification' && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-400 animate-pulse">
                      ⏳ Pending Review
                    </span>
                  )}
                  {escrow.status === 'verified' && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400">
                      ✓ Approved
                    </span>
                  )}
                  {escrow.status === 'payment_rejected' && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400">
                      ✗ Rejected
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {escrow.paymentProof && (
                    <div className="space-y-2">
                       <span className="text-xs text-[#bacac3] font-bold uppercase tracking-wider">Bukti Pembeli (Pembayaran)</span>
                       <div className="w-full h-48 bg-[#0b1325] rounded-xl overflow-hidden border border-white/5">
                         <img src={`${API_BASE}${escrow.paymentProof}`} alt="Payment Proof" className="w-full h-full object-contain" />
                       </div>
                    </div>
                  )}
                  {escrow.shippingProof && (
                    <div className="space-y-2">
                       <span className="text-xs text-[#bacac3] font-bold uppercase tracking-wider">Bukti Penjual (Resi/Kesiapan)</span>
                       <div className="w-full h-48 bg-[#0b1325] rounded-xl overflow-hidden border border-white/5">
                         <img src={`${API_BASE}${escrow.shippingProof}`} alt="Shipping Proof" className="w-full h-full object-contain" />
                       </div>
                    </div>
                  )}
                </div>

                {/* ADMIN APPROVE/REJECT BUTTONS */}
                {isAdmin && escrow.status === 'waiting_verification' && (
                  <div className="mt-6 pt-5 border-t border-white/10">
                    <h3 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                      Admin: Verifikasi Pembayaran
                    </h3>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setShowApproveModal(true)} 
                        disabled={approvePaymentCmd.isPending || rejectPaymentCmd.isPending}
                        className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Approve Payment
                      </button>
                      <button 
                        onClick={() => setShowRejectModal(true)} 
                        disabled={approvePaymentCmd.isPending || rejectPaymentCmd.isPending}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">cancel</span>
                        Reject Payment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PAYMENT METHOD INFO */}
            {escrow.paymentMethod && (
              <div className="bg-[#131b2d] p-5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    escrow.paymentMethod === 'wallet' ? 'bg-[#44e5c2]/20' : escrow.paymentMethod === 'qris' ? 'bg-blue-500/20' : 'bg-indigo-500/20'
                  }`}>
                    <span className={`material-symbols-outlined text-lg ${
                      escrow.paymentMethod === 'wallet' ? 'text-[#44e5c2]' : escrow.paymentMethod === 'qris' ? 'text-blue-400' : 'text-indigo-400'
                    }`}>
                      {escrow.paymentMethod === 'wallet' ? 'account_balance_wallet' : escrow.paymentMethod === 'qris' ? 'qr_code_scanner' : 'credit_card'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-[#bacac3] uppercase tracking-wider font-bold">Metode Pembayaran</p>
                    <p className={`text-sm font-bold ${
                      escrow.paymentMethod === 'wallet' ? 'text-[#44e5c2]' : escrow.paymentMethod === 'qris' ? 'text-blue-400' : 'text-indigo-400'
                    }`}>
                      {escrow.paymentMethod === 'wallet' ? '💰 Wallet Balance' : escrow.paymentMethod === 'qris' ? '📱 QRIS' : '💳 DANA'}
                    </p>
                  </div>
                  {escrow.paymentMethod === 'wallet' && escrow.paidAt && (
                    <span className="ml-auto px-3 py-1 rounded-full text-[10px] font-bold bg-[#44e5c2]/20 text-[#44e5c2] uppercase tracking-wider">
                      Auto-Paid
                    </span>
                  )}
                </div>
              </div>
            )}

            <TransactionCard 
               status={sInfo.text}
               statusColor={sInfo.color}
               title={escrow.itemName}
               id={`TRX-${escrow.txCode}`}
               time={new Date(escrow.createdAt).toLocaleDateString()}
               category={escrow.category}
               tag={isBuyer ? "Pembeli" : (isSeller ? "Penjual" : "Admin")}
               tagColor={{ bg: 'bg-[#44e5c2]/20', text: 'text-[#44e5c2]' }}
               userImage={escrow.seller?.avatarUrl || "https://i.pravatar.cc/150"}
               username={isBuyer ? escrow.seller?.username : escrow.buyer?.username}
               price={`Rp ${parseFloat(escrow.totalAmount).toLocaleString('id-ID')}`}
               image={escrow.itemImageUrl || "https://images.unsplash.com/photo-1555626906-fcf10d6851b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
            />
          </div>
          
          <ChatPanel 
             escrowId={id} 
             bothJoined={bothJoined} 
             isAdmin={isAdmin} 
             hasJoined={hasJoined} 
             status={escrow.status}
             buyerId={escrow.buyerId}
             sellerId={escrow.sellerId}
             className={`${activeTab === 'chat' ? 'flex' : 'hidden lg:flex'}`}
          />
        </div>
      </main>
      <MobileBottomNav />

      {/* APPROVE CONFIRMATION MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowApproveModal(false)}>
          <div className="bg-[#131b2d] rounded-2xl p-6 max-w-md w-full border border-green-500/20 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-green-400 text-2xl">check_circle</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Approve Payment</h3>
                <p className="text-xs text-[#bacac3]">Konfirmasi persetujuan pembayaran</p>
              </div>
            </div>
            <p className="text-sm text-[#dbe2fb] mb-6 leading-relaxed">
              Apakah Anda yakin ingin menyetujui pembayaran untuk transaksi ini? Status akan berubah menjadi <span className="text-green-400 font-bold">Terverifikasi</span> dan pembeli dapat menyelesaikan transaksi.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowApproveModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-[#bacac3] bg-[#222a3d] hover:bg-[#2d3448] transition-colors">
                Batal
              </button>
              <button 
                onClick={handleApprove} 
                disabled={approvePaymentCmd.isPending}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {approvePaymentCmd.isPending ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Memproses...</>
                ) : (
                  "Ya, Setujui"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL WITH REASON */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowRejectModal(false)}>
          <div className="bg-[#131b2d] rounded-2xl p-6 max-w-md w-full border border-red-500/20 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-red-400 text-2xl">cancel</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Reject Payment</h3>
                <p className="text-xs text-[#bacac3]">Tolak dan minta upload ulang</p>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#bacac3] uppercase tracking-wider mb-2">Alasan Penolakan *</label>
              <textarea 
                value={rejectReason} 
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Contoh: Bukti pembayaran tidak jelas, nominal tidak sesuai..."
                className="w-full bg-[#060e1f] border border-[#3c4a45]/30 rounded-xl px-4 py-3 text-sm text-[#dbe2fb] placeholder:text-[#bacac3]/40 focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50 outline-none resize-none h-24"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-[#bacac3] bg-[#222a3d] hover:bg-[#2d3448] transition-colors">
                Batal
              </button>
              <button 
                onClick={handleReject} 
                disabled={rejectPaymentCmd.isPending || !rejectReason.trim()}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {rejectPaymentCmd.isPending ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Memproses...</>
                ) : (
                  "Tolak Pembayaran"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetail;
