import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, History, LogOut, X } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('supabase-auth-token');
    navigate('/login');
  };

  return (
    <>
      <style>{`.mobile-close-btn { display: none; } @media (max-width: 768px) { .mobile-close-btn { display: flex; align-items: center; justify-content: center; border: none; background: transparent; cursor: pointer; } }`}</style>
      <aside className={`sidebar print-hide ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ minWidth: '40px' }}>
          <path d="M25,10 L60,10 C85,10 95,30 95,50 C95,70 85,90 60,90 L25,90 Z M35,20 L35,80 L60,80 C75,80 82,60 82,50 C82,40 75,20 60,20 Z" fill="#0d2b7c" />
          <rect x="8" y="10" width="10" height="80" fill="#0d2b7c" />
          <path d="M52,35 C44,48 44,60 52,65 C60,60 60,48 52,35 Z" fill="#0d2b7c" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: '#0d2b7c', fontWeight: '800', lineHeight: '1.2' }}>Dwaraka</span>
          <span style={{ color: '#0d2b7c', fontWeight: '800', lineHeight: '1.2' }}>Lab</span>
        </div>
        </div>
        <button className="mobile-close-btn" onClick={onClose}>
          <X size={24} color="#0d2b7c" />
        </button>
      </div>

      <nav style={{ flex: 1 }}>
        <NavLink
          to="/dashboard"
          onClick={handleNavClick}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} /> Tests Dashboard
        </NavLink>

        <NavLink
          to="/entry"
          onClick={handleNavClick}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <FileText size={20} /> New Report
        </NavLink>

        <NavLink
          to="/history"
          onClick={handleNavClick}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <History size={20} /> Report History
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button onClick={handleLogout} className="btn nav-link" style={{ width: '100%', justifyContent: 'flex-start', background: 'none' }}>
          <LogOut size={20} /> Logout
        </button>
      </div>
      </aside>
    </>
  );
}
