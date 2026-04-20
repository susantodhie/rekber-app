import React, { useState } from 'react';

const ReviewPopup = ({ isOpen, onClose, onSubmit, isPending }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating === 0) {
      setError("Rating bintang wajib dipilih (1-5).");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Ulasan minimal 10 karakter.");
      return;
    }
    setError("");
    onSubmit({ rating, comment });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#131b2d] rounded-2xl p-6 max-w-md w-full border border-[#44e5c2]/20 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#44e5c2]/20 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[#44e5c2] text-2xl">reviews</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Beri Ulasan Transaksi</h3>
            <p className="text-xs text-[#bacac3]">Bantu pengguna lain lebih percaya</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 text-red-400 p-3 rounded-lg text-xs font-medium border border-red-500/20">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col items-center justify-center space-y-2">
          <span className="text-sm font-bold text-[#dbe2fb]">Bagaimana pengalaman Anda?</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110 focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <span className={`material-symbols-outlined text-4xl ${star <= (hoveredRating || rating) ? 'text-yellow-400 cursor-pointer fill-yellow-400' : 'text-gray-600'} transition-colors`}>
                  star
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-[#bacac3] uppercase tracking-wider mb-2">Ulasan Anda *</label>
          <textarea 
            value={comment} 
            onChange={e => setComment(e.target.value)}
            placeholder="Tulis pengalaman Anda selama transaksi berlangsung..."
            className="w-full bg-[#060e1f] border border-[#3c4a45]/30 rounded-xl px-4 py-3 text-sm text-[#dbe2fb] placeholder:text-[#bacac3]/40 focus:ring-2 focus:ring-[#44e5c2]/30 focus:border-[#44e5c2]/50 outline-none resize-none h-28 custom-scrollbar"
          />
          <p className="text-[10px] text-right text-[#bacac3]/60 mt-1">{comment.length} karakter (Min 10)</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-[#bacac3] bg-[#222a3d] hover:bg-[#2d3448] transition-colors">
            Nanti Saja
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isPending}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#00c9a7] to-[#44e5c2] hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Mengirim...</>
            ) : (
              "Kirim Ulasan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPopup;
