import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyProfile } from '../hooks/useUser';
import { useKycStatus } from '../hooks/useKyc';

const ProfileOverview = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useMyProfile();
  const { data: kycStatus } = useKycStatus();

  const isVerified = kycStatus?.status === 'verified';

  return (
    <section className="mb-12">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8 bg-surface-container rounded-[4rem] border border-outline-variant/5">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-high ring-2 ring-primary/20">
            {isLoading ? (
              <div className="w-full h-full bg-surface-container-highest animate-pulse" />
            ) : profile?.avatarUrl ? (
              <img alt={profile.fullName} src={profile.avatarUrl} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-primary/40">person</span>
              </div>
            )}
          </div>
          <div className={`absolute bottom-1 right-1 p-1.5 rounded-full border border-outline-variant/30 flex items-center justify-center ${isVerified ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-error'}`}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isVerified ? 'verified' : 'cancel'}
            </span>
          </div>
        </div>
        
        <div className="text-center md:text-left flex-1 mt-4 md:mt-0">
          <div className="flex flex-col md:flex-row md:items-end gap-2 mb-4 justify-center md:justify-start">
            <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface">
              {isLoading ? (
                <span className="inline-block w-40 h-10 bg-surface-container-highest/50 rounded animate-pulse" />
              ) : (
                profile?.fullName || 'User'
              )}
            </h1>
            {profile?.username && (
              <span className="text-on-surface-variant font-mono text-sm mb-1 opacity-60">@{profile.username}</span>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto md:mx-0">
            <div className="flex items-center gap-3 text-on-surface-variant justify-center md:justify-start">
              <span className="material-symbols-outlined text-primary/60">mail</span>
              <span className="text-sm">{isLoading ? '...' : (profile?.email || '-')}</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant justify-center md:justify-start">
              <span className="material-symbols-outlined text-primary/60">call</span>
              <span className="text-sm">{isLoading ? '...' : (profile?.phone || 'Belum ditambahkan')}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-2">
          <button
            onClick={() => navigate('/profile/edit')}
            className="px-6 py-2 rounded-lg bg-surface-container-highest text-on-surface text-sm font-semibold border border-outline-variant/20 hover:bg-surface-bright transition-colors active:scale-95"
          >
            Edit Profil
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfileOverview;
