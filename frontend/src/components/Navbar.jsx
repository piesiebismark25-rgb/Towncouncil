import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Landmark, Menu } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  const toggleMobileSidebar = () => {
    document.body.classList.toggle('mobile-sidebar-open');
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="menu-toggle" onClick={toggleMobileSidebar}>
          <Menu size={24} />
        </button>
        <Landmark size={28} style={{ color: 'var(--accent-color)' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          Town Council Portal
        </h2>
      </div>
      
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'right' }}>
            <div className="nav-user-info-text">
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.username}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {user.role}
              </p>
            </div>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--accent-light)', 
              color: 'var(--accent-color)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 700
            }}>
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
          <button onClick={logout} className="btn btn-secondary nav-logout-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <LogOut size={16} />
            <span className="nav-logout-text">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
