import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Transactions from './pages/Transactions.jsx'
import CreateTransaction from './pages/CreateTransaction.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        
        {/* Protected Routes wrapped in Layout */}
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/create-transaction" element={<CreateTransaction />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
