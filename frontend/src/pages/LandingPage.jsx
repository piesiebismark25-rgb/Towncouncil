import { Landmark, ArrowRight, ShieldCheck, Map, Clock, Recycle, ClipboardCheck, Trash2 } from 'lucide-react';
import heroPoster from '../assets/hero.png';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="landing-page animated-fade">
      <section className="landing-hero" aria-label="Town council sanitation and community cleanup">
        <video
          className="landing-hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster={heroPoster}
          aria-hidden="true"
        >
          <source src="/videos/community-cleanup.mp4" type="video/mp4" />
          <source src="/videos/community-cleanup.webm" type="video/webm" />
        </video>
        <div className="landing-hero-overlay" />

        <div className="landing-hero-shell">
          <div className="landing-hero-content">
            <div className="landing-kicker">
              <Landmark size={20} />
              <span>Town Council Digital Portal</span>
            </div>

            <h1 className="landing-title">
              Community sanitation, permits, and town services in one civic portal.
            </h1>

            <p className="landing-subtitle">
              Coordinate cleanup reports, waste collection issues, permit applications, tax payments, and council announcements with a portal built around everyday town work.
            </p>

            <div className="landing-actions">
              <button onClick={onGetStarted} className="btn btn-primary landing-primary-action">
                Enter Portal
                <ArrowRight size={18} />
              </button>
              <div className="landing-service-chip">
                <Recycle size={17} />
                <span>Sanitation desk open for citizen reports</span>
              </div>
            </div>
          </div>

          <aside className="landing-operations-panel" aria-label="Town service highlights">
            <div className="landing-panel-header">
              <span>Today at the council</span>
              <strong>Sanitation response</strong>
            </div>
            <div className="landing-panel-item">
              <Trash2 size={20} />
              <div>
                <strong>Waste complaints</strong>
                <span>Log refuse, drains, dumping, and street cleanup cases.</span>
              </div>
            </div>
            <div className="landing-panel-item">
              <ClipboardCheck size={20} />
              <div>
                <strong>Tracked follow-up</strong>
                <span>Citizens receive updates as officers review requests.</span>
              </div>
            </div>
            <div className="landing-panel-metrics">
              <div>
                <strong>24/7</strong>
                <span>digital access</span>
              </div>
              <div>
                <strong>1</strong>
                <span>service record</span>
              </div>
            </div>
          </aside>
        </div>

        <div className="landing-hero-bottom">
          <span>Cleanup coordination</span>
          <span>Permit services</span>
          <span>Property billing</span>
          <span>Council notices</span>
        </div>
      </section>

      <section className="landing-services">
        <div className="landing-service-card">
          <div className="landing-service-icon success-icon">
            <ShieldCheck size={28} />
          </div>
          <h3>Waste & Sanitation Requests</h3>
          <p>
            Submit cleanup requests for refuse collection, blocked drains, illegal dumping, and neighborhood sanitation concerns.
          </p>
        </div>

        <div className="landing-service-card">
          <div className="landing-service-icon accent-icon">
            <Map size={28} />
          </div>
          <h3>GIS Town Planning</h3>
          <p>
            Explore town zones and available plots while council teams coordinate zoning, inspections, and development records.
          </p>
        </div>

        <div className="landing-service-card">
          <div className="landing-service-icon warning-icon">
            <Clock size={28} />
          </div>
          <h3>Real-time Tracking</h3>
          <p>
            Follow updates from town officers as sanitation reports, permit applications, bookings, and bills move through review.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
