import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './lib/authClient';

// Pages
import Dashboard from './Dashboard';
import Transactions from './Transactions';
import NewEscrow from './NewEscrow';
import TransactionDetail from './TransactionDetail';
import Messages from './Messages';
import Profile from './Profile';
import EditProfile from './EditProfile';
import KYCCenter from './KYCCenter';
import AdminKYC from './AdminKYC';
import WalletPage from './WalletPage';

// Auth pages
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterForm';
import AdminLoginPage from './components/AdminLoginPage';

import { useMyProfile } from './hooks/useUser';

/** Route guard — redirects to /login if no session */
function ProtectedRoute({ children }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b1325]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-on-surface-variant text-sm font-mono uppercase tracking-widest">
            Authenticating...
          </span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/** Route guard — redirects to /admin/login if not admin */
function AdminProtectedRoute({ children }) {
  const { data: session, isPending: isAuthPending } = useSession();
  const { data: profile, isLoading: isProfileLoading } = useMyProfile();

  const isPending = isAuthPending || (session && isProfileLoading);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b1325]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-error border-t-transparent rounded-full animate-spin" />
          <span className="text-on-surface-variant text-sm font-mono uppercase tracking-widest text-error">
            Verifying Admin...
          </span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  if (profile && profile.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/transactions/new" element={<ProtectedRoute><NewEscrow /></ProtectedRoute>} />
        <Route path="/transaction/:id" element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/kyc" element={<ProtectedRoute><KYCCenter /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/kyc" element={<AdminProtectedRoute><AdminKYC /></AdminProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
