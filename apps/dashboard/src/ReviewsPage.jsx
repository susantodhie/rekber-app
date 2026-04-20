import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import TopAppBar from './components/TopAppBar';
import { useMyReviews, useAllReviewsAdmin } from './hooks/useReview';
import { useMyProfile } from './hooks/useUser';

const ReviewsPage = () => {
  const { data: profile } = useMyProfile();
  const isAdmin = profile?.role === 'admin';

  // Fetch reviews based on role
  const { data: userReviews, isLoading: isLoadingUser } = useMyReviews();
  const { data: adminReviews, isLoading: isLoadingAdmin } = useAllReviewsAdmin();

  const [filter, setFilter] = useState('all'); // 'all', 'buyer', 'seller'

  const reviews = isAdmin ? adminReviews : userReviews;
  const isLoading = isAdmin ? isLoadingAdmin : isLoadingUser;

  const getFilteredReviews = () => {
    if (!reviews) return [];
    if (filter === 'all') return reviews;
    return reviews.filter(r => r.role === filter);
  };

  const filteredReviews = getFilteredReviews();

  // Calculate average rating
  const avgRating = reviews?.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#0b1325]">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full relative md:ml-[260px] overflow-hidden">
        <TopAppBar title="Ulasan Transaksi" subtitle={isAdmin ? "Pantau reputasi pengguna" : "Reputasi akun Anda"} />
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar pb-24 lg:pb-10">
          {isLoading ? (
            <div className="flex justify-center py-20"><span className="w-8 h-8 border-2 border-[#44e5c2]/30 border-t-[#44e5c2] rounded-full animate-spin"></span></div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Stats Overview */}
              <div className="bg-gradient-to-br from-[#131b2d] to-[#1c2438] p-6 rounded-2xl border border-[#44e5c2]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Ringkasan Ulasan</h2>
                  <p className="text-sm text-[#bacac3]">Berdasarkan {reviews?.length || 0} ulasan yang masuk.</p>
                </div>
                
                <div className="bg-[#0b1325] p-4 rounded-xl border border-white/5 flex items-center gap-4 shadow-inner">
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-full">
                    <span className="material-symbols-outlined text-yellow-400 text-3xl">star</span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white flex items-baseline gap-1">
                      {avgRating} <span className="text-sm text-[#bacac3] font-medium">/ 5.0</span>
                    </div>
                    {/* Badge */}
                    <div className="mt-1">
                      {avgRating >= 4.5 ? (
                         <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#44e5c2]/20 text-[#44e5c2]">EXCELLENT</span>
                      ) : avgRating >= 3.0 ? (
                         <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400">GOOD</span>
                      ) : (
                         <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/20 text-gray-400">NEW</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === 'all' ? 'bg-[#44e5c2] text-[#0b1325]' : 'bg-[#171f32] text-[#bacac3] hover:text-white border border-[#3c4a45]/30'}`}
                >
                  Semua Ulasan
                </button>
                <button 
                  onClick={() => setFilter('buyer')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === 'buyer' ? 'bg-[#44e5c2] text-[#0b1325]' : 'bg-[#171f32] text-[#bacac3] hover:text-white border border-[#3c4a45]/30'}`}
                >
                  Dari Pembeli
                </button>
                <button 
                  onClick={() => setFilter('seller')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === 'seller' ? 'bg-[#44e5c2] text-[#0b1325]' : 'bg-[#171f32] text-[#bacac3] hover:text-white border border-[#3c4a45]/30'}`}
                >
                  Dari Penjual
                </button>
              </div>

              {/* Review List */}
              <div className="space-y-4">
                {filteredReviews?.length === 0 ? (
                  <div className="bg-[#131b2d] p-10 rounded-2xl border border-white/5 text-center">
                    <span className="material-symbols-outlined text-5xl text-[#3c4a45] mb-4">rate_review</span>
                    <h3 className="text-white font-bold mb-2">Belum ada ulasan</h3>
                    <p className="text-sm text-[#bacac3]">Ulasan akan muncul setelah transaksi diselesaikan.</p>
                  </div>
                ) : (
                  filteredReviews?.map(review => (
                    <div key={review.id} className="bg-[#131b2d] p-5 rounded-2xl border border-white/5 hover:border-[#44e5c2]/30 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold uppercase text-sm">
                            {review.reviewerName?.substring(0,2) || "AN"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white flex items-center gap-2">
                              {review.reviewerName || "Anonymous"}
                              <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold ${
                                review.role === 'buyer' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                              }`}>
                                {review.role === 'buyer' ? 'Pembeli' : 'Penjual'}
                              </span>
                            </p>
                            <p className="text-xs text-[#bacac3]">{new Date(review.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(star => (
                            <span key={star} className={`material-symbols-outlined text-sm ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}>
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#dbe2fb] mt-3 leading-relaxed">
                        "{review.comment}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default ReviewsPage;
