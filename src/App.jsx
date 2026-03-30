import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportEntry from './pages/ReportEntry';
import ReportPreview from './pages/ReportPreview';
import ReportHistory from './pages/ReportHistory';
import Sidebar from './components/Sidebar';
import './index.css';

// A simple auth mock state for now until Supabase UI is hooked.
// Usually, you'd wrap this with a Context Provider checking supabase.auth.getSession()

const ProtectedRoute = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAuthenticated = localStorage.getItem('supabase-auth-token') === 'true'; // simplified check
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="app-container">
      <div className="mobile-header print-hide">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M25,10 L60,10 C85,10 95,30 95,50 C95,70 85,90 60,90 L25,90 Z M35,20 L35,80 L60,80 C75,80 82,60 82,50 C82,40 75,20 60,20 Z" fill="#0d2b7c" />
            <rect x="8" y="10" width="10" height="80" fill="#0d2b7c" />
            <path d="M52,35 C44,48 44,60 52,65 C60,60 60,48 52,35 Z" fill="#0d2b7c" />
          </svg>
          <span style={{ color: '#0d2b7c', fontWeight: '800', fontSize: '1.25rem' }}>Dwaraka Lab</span>
        </div>
        <button className="btn btn-outline" style={{ border: 'none', padding: '0.5rem' }} onClick={() => setIsSidebarOpen(true)}>
          <Menu size={28} color="#0d2b7c" />
        </button>
      </div>

      <div className={`mobile-overlay ${isSidebarOpen ? 'open' : ''} print-hide`} onClick={() => setIsSidebarOpen(false)}></div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/entry" element={
          <ProtectedRoute>
            <ReportEntry />
          </ProtectedRoute>
        } />
        
        <Route path="/preview/:id" element={
          <ProtectedRoute>
            <ReportPreview />
          </ProtectedRoute>
        } />
        
        <Route path="/history" element={
          <ProtectedRoute>
            <ReportHistory />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
