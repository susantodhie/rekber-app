import React from 'react';
import ProfileTopnav from './components/ProfileTopnav';
import ProfileSidebar from './components/ProfileSidebar';
import ProfileMobileNav from './components/ProfileMobileNav';
import ProfileOverview from './components/ProfileOverview';
import VerificationStatus from './components/VerificationStatus';
import BankAccounts from './components/BankAccounts';

const Profile = () => {
  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen">
      <ProfileTopnav />
      
      <div className="flex min-h-screen pt-20">
        <ProfileSidebar />
        
        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full pb-32 overflow-y-auto custom-scrollbar">
          <ProfileOverview />
          <VerificationStatus />
          <BankAccounts />
        </main>
      </div>
      
      <ProfileMobileNav />
    </div>
  );
};

export default Profile;
