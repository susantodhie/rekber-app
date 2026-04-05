import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../lib/authClient';
import { useUnreadNotificationCount } from '../hooks/useNotifications';
import { useUnreadMessageCount } from '../hooks/useMessages';

const TopAppBar = () => {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { data: unreadNotifications = 0 } = useUnreadNotificationCount();
  const { data: unreadMessages = 0 } = useUnreadMessageCount();

  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 bg-[#131b2d] px-4 md:px-8 pl-[60px] md:pl-8 h-20 flex justify-between items-center w-full shadow-[0_20px_50px_rgba(56,222,187,0.05)]">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">search</span>
          </span>
          <input
            className="bg-surface-container-lowest border-none rounded-lg pl-10 pr-4 py-2 w-64 focus:ring-1 focus:ring-primary text-sm font-body"
            placeholder="Cari transaksi..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex gap-4">
          {/* Notifications button with badge */}
          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-[#2d3448] transition-colors active:scale-95 duration-150 relative"
            onClick={() => navigate('/notifications')}
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-on-primary text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>
            )}
          </button>
          {/* Messages button with badge */}
          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-[#2d3448] transition-colors active:scale-95 duration-150 relative"
            onClick={() => navigate('/messages')}
          >
            <span className="material-symbols-outlined">chat_bubble</span>
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{unreadMessages > 9 ? '9+' : unreadMessages}</span>
            )}
          </button>
        </div>
        <div className="h-8 w-px bg-outline-variant/30"></div>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/profile')}>
          <div className="text-right">
            <p className="text-sm font-bold group-hover:text-primary transition-colors">{user?.name || 'User'}</p>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">
              {user?.email ? user.email.split('@')[0] : 'Loading...'}
            </p>
          </div>
          {user?.image ? (
            <img
              alt="User Profile Avatar"
              className="w-10 h-10 rounded-full border-2 border-primary/20 group-hover:border-primary transition-all object-cover"
              src={user.image}
            />
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 group-hover:border-primary transition-all bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;
