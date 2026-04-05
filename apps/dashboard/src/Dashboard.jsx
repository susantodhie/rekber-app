import React from 'react';
import Sidebar from './components/Sidebar';
import TopAppBar from './components/TopAppBar';
import BentoSummary from './components/BentoSummary';
import TransactionTable from './components/TransactionTable';
import RecentActivity from './components/RecentActivity';
import MobileBottomNav from './components/MobileBottomNav';
import FloatingActionButton from './components/FloatingActionButton';

const Dashboard = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0b1325]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 md:ml-[260px] overflow-hidden">
        <TopAppBar />
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10 custom-scrollbar">
          <BentoSummary />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <TransactionTable />
            <RecentActivity />
          </div>
          <div className="h-20 md:hidden"></div>
        </div>
      </main>
      <FloatingActionButton />
      <MobileBottomNav />
    </div>
  );
};

export default Dashboard;
