import React from 'react';
import { Landmark, ArrowRight, ShieldCheck, Map, Clock } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="page-container animated-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: 'var(--accent-light)', padding: '0.5rem 1.25rem', borderRadius: '50px', border: '1px solid var(--border-focus)' }}>
        <Landmark size={20} style={{ color: 'var(--accent-color)' }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Town Council Digital Portal
        </span>
      </div>
      
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, maxWidth: '850px', margin: '0.5rem 0 1.5rem', letterSpacing: '-0.03em' }}>
        Connecting Citizens through <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Efficient Governance</span>
      </h1>
      
      <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '650px', marginBottom: '2.5rem' }}>
        Apply for building permits, pay property taxes, book community events, and submit service feedback requests directly to your local town council.
      </p>
      
      <button onClick={onGetStarted} className="btn btn-primary" style={{ padding: '0.9rem 2.25rem', borderRadius: 'var(--radius-md)', fontSize: '1.05rem', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.2)' }}>
        Get Started
        <ArrowRight size={18} />
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1100px', marginTop: '5rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--success-light)', borderRadius: '50%', color: 'var(--success)', marginBottom: '1.25rem' }}>
            <ShieldCheck size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Secure Payments</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Process property taxes, waste management fees, and permit billing securely with instant receipt generation.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--accent-light)', borderRadius: '50%', color: 'var(--accent-color)', marginBottom: '1.25rem' }}>
            <Map size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>GIS Town Planning</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Explore town zones and available plots. Admins can manage public zoning and developers can coordinate submissions.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--warning-light)', borderRadius: '50%', color: 'var(--warning)', marginBottom: '1.25rem' }}>
            <Clock size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Real-time Tracking</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Submit service requests (lighting, potholes, waste issues) and track status updates from the town council in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
