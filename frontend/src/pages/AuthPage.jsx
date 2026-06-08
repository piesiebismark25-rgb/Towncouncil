import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Landmark, Mail, Lock, User, UserPlus, LogIn, Sparkles } from 'lucide-react';

const AuthPage = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('citizen');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@towncouncil.gov');
      setPassword('password123');
    } else {
      setEmail('citizen@gmail.com');
      setPassword('password123');
    }
    setIsLogin(true);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password, role);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animated-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="glass-card" style={{ width: '450px', maxWidth: '100%', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }}>
        
        {/* Portal Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--accent-light)', borderRadius: '50%', color: 'var(--accent-color)', marginBottom: '0.75rem' }}>
            <Landmark size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Town Council Portal Access Panel</p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: 'var(--bg-tertiary)', padding: '4px', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          <button 
            type="button" 
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            style={{ 
              padding: '0.6rem', 
              border: 'none', 
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              backgroundColor: isLogin ? 'var(--bg-secondary)' : 'transparent',
              color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            style={{ 
              padding: '0.6rem', 
              border: 'none', 
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              backgroundColor: !isLogin ? 'var(--bg-secondary)' : 'transparent',
              color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--danger-light)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', marginBottom: '1.25rem', fontWeight: 550 }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input type="text" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="e.g. John Doe" required value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input type="email" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="john@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: isLogin ? '1.5rem' : '1.25rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input type="password" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">Register As</label>
              <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="citizen">Citizen (Access local amenities/permits)</option>
                <option value="admin">Administrator (Manage approvals/GIS planning)</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
            {loading ? (
              'Authenticating...'
            ) : isLogin ? (
              <>
                <LogIn size={18} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={18} /> Create Account
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Panel */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--accent-color)' }}>
            <Sparkles size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Accounts Setup</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => loadDemo('citizen')} style={{ padding: '0.5rem', fontSize: '0.75rem' }}>
              Citizen Demo
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => loadDemo('admin')} style={{ padding: '0.5rem', fontSize: '0.75rem' }}>
              Admin Demo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
