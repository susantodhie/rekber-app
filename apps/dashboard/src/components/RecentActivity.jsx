import React from 'react';
import { useNotifications } from '../hooks/useNotifications';

const iconMap = {
  escrow_created: { icon: 'account_balance', color: 'bg-primary/20 border-primary/30', textColor: 'text-primary' },
  escrow_paid: { icon: 'payments', color: 'bg-primary/20 border-primary/30', textColor: 'text-primary' },
  escrow_shipped: { icon: 'local_shipping', color: 'bg-tertiary/20 border-tertiary/30', textColor: 'text-tertiary' },
  escrow_completed: { icon: 'verified', color: 'bg-secondary/20 border-secondary/30', textColor: 'text-secondary' },
  escrow_cancelled: { icon: 'cancel', color: 'bg-error/20 border-error/30', textColor: 'text-error' },
  dispute_opened: { icon: 'gavel', color: 'bg-error/20 border-error/30', textColor: 'text-error' },
  kyc_approved: { icon: 'verified_user', color: 'bg-primary/20 border-primary/30', textColor: 'text-primary' },
  default: { icon: 'info', color: 'bg-secondary/20 border-secondary/30', textColor: 'text-secondary' },
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const RecentActivity = () => {
  const { data, isLoading } = useNotifications({ pageSize: 5 });
  const notifications = data?.notifications || [];

  return (
    <div className="lg:col-span-4 space-y-4">
      <h3 className="text-xl font-bold text-on-surface">Aktivitas Terbaru</h3>
      <div className="surface-container-low rounded-xl p-6 glass space-y-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest/50 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="w-full h-3 bg-surface-container-highest/50 rounded animate-pulse" />
                <div className="w-16 h-2 bg-surface-container-highest/50 rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="text-center py-6 text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-3xl mb-2 block opacity-30">notifications_off</span>
            Belum ada aktivitas
          </div>
        ) : (
          notifications.map((notif, i) => {
            const config = iconMap[notif.type] || iconMap.default;
            return (
              <div key={notif.id} className="flex gap-4 relative">
                {i < notifications.length - 1 && (
                  <div className="absolute left-4 top-10 w-[1px] h-10 bg-white/10"></div>
                )}
                <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center shrink-0 border`}>
                  <span className={`material-symbols-outlined text-sm ${config.textColor}`}>{config.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-on-surface">{notif.message || notif.title}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tight">{timeAgo(notif.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}

        <div className="pt-4 mt-4 border-t border-white/5">
          <div className="bg-surface-container-lowest rounded-lg p-4 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <span className="material-symbols-outlined text-8xl">security</span>
            </div>
            <h4 className="text-xs font-bold text-primary flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-sm">shield</span>
              Tips Keamanan
            </h4>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Jangan pernah memberikan kode OTP atau password kepada siapa pun yang mengaku dari Rekberinsaja.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
