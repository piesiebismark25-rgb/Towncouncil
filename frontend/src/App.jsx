import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Landmark } from 'lucide-react';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        gap: '1.25rem'
      }}>
        <div className="pulse-icon" style={{
          padding: '1.25rem',
          backgroundColor: 'var(--accent-light)',
          borderRadius: '50%',
          color: 'var(--accent-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Landmark size={48} />
        </div>
        <p style={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '0.02em', color: 'var(--text-secondary)' }}>
          Authenticating town portal services...
        </p>
        <style>{`
          @keyframes pulseScale {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.15); opacity: 1; }
          }
          .pulse-icon {
            animation: pulseScale 1.8s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // If user is not authenticated
  if (!user) {
    if (showAuth) {
      return <AuthPage />;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  // If user is authenticated
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <CitizenDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
