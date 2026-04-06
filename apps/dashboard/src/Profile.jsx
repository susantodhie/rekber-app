import React from 'react';
import Sidebar from './components/Sidebar';
import TopAppBar from './components/TopAppBar';
import MobileBottomNav from './components/MobileBottomNav';
import FloatingActionButton from './components/FloatingActionButton';
import ProfileOverview from './components/ProfileOverview';
import VerificationStatus from './components/VerificationStatus';
import BankAccounts from './components/BankAccounts';

const Profile = () => {
  return (
    <div className="flex min-h-screen overflow-hidden bg-[#0b1325]">
      <Sidebar />
      <main className="flex-1 md:ml-[260px] min-h-screen pb-24 md:pb-12 overflow-y-auto">
        <TopAppBar />
        <div className="px-6 py-8 max-w-5xl mx-auto space-y-8">
          <ProfileOverview />
          <VerificationStatus />
          <BankAccounts />
        </div>
      </main>
      <FloatingActionButton />
      <MobileBottomNav />
    </div>
  );
};

export default Profile;
