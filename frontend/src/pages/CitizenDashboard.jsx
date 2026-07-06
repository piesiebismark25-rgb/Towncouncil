import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CalendarView from '../components/CalendarView';
import { 
  Receipt, 
  FileText, 
  Calendar as CalendarIcon, 
  Wrench, 
  TrendingUp,
  AlertTriangle,
  Megaphone,
  CheckCircle,
  FileCheck,
  Eye,
  EyeOff
} from 'lucide-react';

const CitizenDashboard = () => {
  const { user, updateUser, API_BASE_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Backend state
  const [taxes, setTaxes] = useState([]);
  const [permits, setPermits] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Form states
  const [permitTitle, setPermitTitle] = useState('');
  const [permitDesc, setPermitDesc] = useState('');
  const [permitType, setPermitType] = useState('Building');

  const [requestTitle, setRequestTitle] = useState('');
  const [requestDesc, setRequestDesc] = useState('');
  const [requestCat, setRequestCat] = useState('Waste');
  const [requestPriority, setRequestPriority] = useState('medium');

  const [paymentModalTax, setPaymentModalTax] = useState(null);
  const [cardNumber, setCardNumber] = useState('');

  // Tracking Timeline State
  const [activeTimelineItem, setActiveTimelineItem] = useState(null);
  const [timelineType, setTimelineType] = useState('');

  const [submittingPermit, setSubmittingPermit] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Profile edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileUsername, setProfileUsername] = useState(user?.username || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileUsername(user.username);
      setProfileEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmittingProfile(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: profileUsername,
          email: profileEmail,
          password: profilePassword || undefined
        })
      });

      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        updateUser(resData.data);
        setSuccessMsg('Profile updated successfully.');
        setIsEditingProfile(false);
        setProfilePassword('');
      } else {
        setErrorMsg(resData.message || 'Error updating profile');
      }
    } catch (err) {
      setErrorMsg('Network error updating profile.');
    } finally {
      setSubmittingProfile(false);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resTaxes, resPermits, resBookings, resRequests, resAnnounce] = await Promise.all([
        fetch(`${API_BASE_URL}/services/taxes`, { headers }),
        fetch(`${API_BASE_URL}/services/permits`, { headers }),
        fetch(`${API_BASE_URL}/services/bookings`, { headers }),
        fetch(`${API_BASE_URL}/services/requests`, { headers }),
        fetch(`${API_BASE_URL}/services/announcements`, { headers })
      ]);

      if (resTaxes.ok) setTaxes((await resTaxes.json()).data);
      if (resPermits.ok) setPermits((await resPermits.json()).data);
      if (resBookings.ok) setBookings((await resBookings.json()).data);
      if (resRequests.ok) setRequests((await resRequests.json()).data);
      if (resAnnounce.ok) setAnnouncements((await resAnnounce.json()).data);
    } catch (err) {
      console.error('Error fetching citizen data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (msg, type = 'success') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const initiatePaystackPayment = (tax) => {
    if (!window.PaystackPop) {
      showNotification('Payment gateway is currently loading. Please try again.', 'error');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: 'pk_test_cb91a4b60e680a6b7d159042b450702d7e2e8e0d', // Paystack Public Test Key
      email: user.email || 'resident@towncouncil.gov',
      amount: Math.round(tax.amount * 100), // in kobo/cents
      currency: 'GHS', // or USD, NGN, etc. Let's use standard test currency
      ref: 'TC-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
      callback: async function (response) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/services/taxes/${tax._id}/pay`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reference: response.reference })
          });
          const resData = await res.json();
          if (res.ok) {
            showNotification(`Payment successful! Reference: ${response.reference}`);
            fetchData();
          } else {
            showNotification(resData.message || 'Payment verification failed.', 'error');
          }
        } catch (err) {
          showNotification('Error verifying payment.', 'error');
        }
      },
      onClose: function () {
        showNotification('Payment window closed.', 'error');
      }
    });
    handler.openIframe();
  };

  const handleApplyPermit = async (e) => {
    e.preventDefault();
    setSubmittingPermit(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/services/permits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: permitTitle, description: permitDesc, permitType })
      });

      if (response.ok) {
        showNotification('Permit application submitted successfully.');
        setPermitTitle('');
        setPermitDesc('');
        fetchData();
      }
    } catch (err) {
      showNotification('Error submitting permit.', 'error');
    } finally {
      setSubmittingPermit(false);
    }
  };

  const handleBookEvent = async (bookingData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/services/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        showNotification('Event booked successfully.');
        fetchData();
        return true;
      } else {
        const resData = await response.json();
        showNotification(resData.message || 'Error booking event.', 'error');
        throw new Error(resData.message || 'Error booking event.');
      }
    } catch (err) {
      if (!err.message || !err.message.includes('booking event')) {
        showNotification('Error booking event.', 'error');
      }
      throw err;
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setSubmittingRequest(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/services/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: requestTitle, description: requestDesc, category: requestCat, priority: requestPriority })
      });

      if (response.ok) {
        showNotification('Service request filed. Feedback logged.');
        setRequestTitle('');
        setRequestDesc('');
        fetchData();
      }
    } catch (err) {
      showNotification('Error submitting feedback.', 'error');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const pendingTaxesCount = taxes.filter(t => t.status === 'pending').length;
  const approvedPermitsCount = permits.filter(p => p.status === 'approved').length;

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role="citizen" />
      
      <main className="main-content">
        <Navbar />
        
        <div className="page-container">
          {/* Notifications */}
          {successMsg && (
            <div className="animated-fade" style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--success-light)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              ✓ {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="animated-fade" style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--danger-light)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 1: OVERVIEW                          */}
          {/* ======================================== */}
          {activeTab === 'overview' && (
            <div className="animated-fade">
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                Hello, {user.username}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Welcome to your citizen dashboard. Here is a summary of your local administrative profile.
              </p>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 550 }}>Pending Tax Bills</span>
                    <Receipt size={18} />
                  </div>
                  <div className="stat-val">{pendingTaxesCount}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>unpaid property/utility taxes</span>
                </div>

                <div className="card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 550 }}>Approved Permits</span>
                    <FileText size={18} />
                  </div>
                  <div className="stat-val">{approvedPermitsCount}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>active local trading/building permits</span>
                </div>

                <div className="card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 550 }}>Active Requests</span>
                    <Wrench size={18} />
                  </div>
                  <div className="stat-val">{requests.filter(r => r.status !== 'resolved').length}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>tracked service requests in progress</span>
                </div>
              </div>

              {/* Grid content */}
              <div className="dashboard-grid-2to1" style={{ marginTop: '2rem' }}>
                {/* Announcements */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <Megaphone style={{ color: 'var(--accent-color)' }} />
                    <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Recent Council Announcements</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {announcements.length === 0 ? (
                      <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                        No announcements posted by the council yet.
                      </div>
                    ) : (
                      announcements.slice(0, 3).map((ann, idx) => (
                        <div key={idx} className="card" style={{ borderLeft: `4px solid ${ann.type === 'urgent' ? 'var(--danger)' : ann.type === 'event' ? 'var(--accent-color)' : 'var(--border-color)'}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>{ann.title}</h4>
                            <span className={`badge ${ann.type === 'urgent' ? 'badge-danger' : ann.type === 'event' ? 'badge-pending' : 'badge-success'}`}>
                              {ann.type}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{ann.content}</p>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.75rem' }}>
                            Posted: {new Date(ann.date || ann.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Quick Actions</h3>
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => setActiveTab('requests')}>
                      🔧 Report a Pothole or Leak
                    </button>
                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => setActiveTab('taxes')}>
                      💳 Pay Property Tax Bill
                    </button>
                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => setActiveTab('permits')}>
                      📄 Apply for Trading Permit
                    </button>
                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => setActiveTab('events')}>
                      📅 Book Council Center Venue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 2: TAX PAYMENTS                      */}
          {/* ======================================== */}
          {activeTab === 'taxes' && (
            <div className="animated-fade">
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                Property Tax & Utilities Payment Portal
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Review outstanding levies, billing history, and download digital transaction receipts.
              </p>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tax Description</th>
                      <th>Billing Date</th>
                      <th>Amount Due</th>
                      <th>Status</th>
                      <th>Receipt #</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxes.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No tax records found.</td>
                      </tr>
                    ) : (
                      taxes.map(tax => (
                        <tr key={tax._id}>
                          <td style={{ fontWeight: 600 }}>{tax.taxType}</td>
                          <td>{new Date(tax.billingDate).toLocaleDateString()}</td>
                          <td style={{ fontWeight: 700 }}>${tax.amount.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${tax.status === 'paid' ? 'badge-success' : 'badge-pending'}`}>
                              {tax.status}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{tax.receiptNumber || 'N/A'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {tax.status === 'pending' ? (
                                <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => initiatePaystackPayment(tax)}>
                                  Pay Now
                                </button>
                              ) : (
                                <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem' }}>Paid ✓</span>
                              )}
                              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => { setActiveTimelineItem(tax); setTimelineType('tax'); }}>
                                Track
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 3: PERMITS                           */}
          {/* ======================================== */}
          {activeTab === 'permits' && (
            <div className="animated-fade dashboard-grid-2col">
              <div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                  Permit Applications
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Apply for residential building permits, street vendor licenses, and local trade approvals.
                </p>

                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Submit New Application</h3>
                  <form onSubmit={handleApplyPermit}>
                    <div className="form-group">
                      <label className="form-label">Permit Title / Reason</label>
                      <input type="text" className="form-input" required placeholder="e.g. Single Storey Kitchen Extension" value={permitTitle} onChange={(e) => setPermitTitle(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Permit Category Type</label>
                      <select className="form-input" value={permitType} onChange={(e) => setPermitType(e.target.value)}>
                        <option value="Building">Residential/Commercial Building Permit</option>
                        <option value="Trading">Municipal Street Trading License</option>
                        <option value="Event">Public Event Noise & Assembly Permit</option>
                        <option value="Other">Other Council Special Permit</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Detailed Project Specifications</label>
                      <textarea className="form-input" style={{ minHeight: '100px' }} required placeholder="Briefly describe the layout, materials, dates, and locations related to this request." value={permitDesc} onChange={(e) => setPermitDesc(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submittingPermit}>
                      {submittingPermit ? 'Submitting...' : 'Submit Permit Request'}
                    </button>
                  </form>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Application History</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {permits.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                      No permit applications submitted yet.
                    </div>
                  ) : (
                    permits.map(permit => (
                      <div key={permit._id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>{permit.title}</h4>
                          <span className={`badge ${permit.status === 'approved' ? 'badge-success' : permit.status === 'rejected' ? 'badge-danger' : 'badge-pending'}`}>
                            {permit.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{permit.description}</p>
                        {permit.comments && (
                          <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-tertiary)', borderLeft: '3px solid var(--border-focus)', fontSize: '0.8rem', borderRadius: '4px', marginBottom: '0.75rem' }}>
                            <strong>Council Response:</strong> {permit.comments}
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            <span>Type: {permit.permitType} | </span>
                            <span>Submitted: {new Date(permit.submittedAt).toLocaleDateString()}</span>
                          </div>
                          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setActiveTimelineItem(permit); setTimelineType('permit'); }}>
                            Track Status
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 4: EVENTS CALENDAR                   */}
          {/* ======================================== */}
          {activeTab === 'events' && (
            <div className="animated-fade">
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                Town Center Booking Calendar
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Browse approved municipal events or register to book assembly rooms, pavilions, or recreation centers.
              </p>
              <CalendarView events={bookings} onBookEvent={handleBookEvent} />

              <div style={{ marginTop: '3rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>My Reservation Requests</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Event/Purpose</th>
                        <th>Venue</th>
                        <th>Date & Time Slot</th>
                        <th>Attendees</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No bookings submitted by you yet.</td>
                        </tr>
                      ) : (
                        bookings.map(booking => (
                          <tr key={booking._id}>
                            <td style={{ fontWeight: 600 }}>{booking.title}</td>
                            <td>{booking.venue}</td>
                            <td>{booking.date} ({booking.timeSlot})</td>
                            <td>{booking.ticketsCount}</td>
                            <td>
                              <span className={`badge ${booking.status === 'approved' ? 'badge-success' : booking.status === 'cancelled' ? 'badge-danger' : 'badge-pending'}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => { setActiveTimelineItem(booking); setTimelineType('booking'); }}>
                                Track Status
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 5: SERVICE REQUESTS                  */}
          {/* ======================================== */}
          {activeTab === 'requests' && (
            <div className="animated-fade dashboard-grid-1to12">
              <div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                  Service Feedback & Requests
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Log utility reports, waste collection inquiries, road maintenance issues, or street light feedback.
                </p>

                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>File Feedback Report</h3>
                  <form onSubmit={handleCreateRequest}>
                    <div className="form-group">
                      <label className="form-label">Brief Title / Topic</label>
                      <input type="text" className="form-input" required placeholder="e.g. Major Pothole near Central Mall" value={requestTitle} onChange={(e) => setRequestTitle(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category Department</label>
                      <select className="form-input" value={requestCat} onChange={(e) => setRequestCat(e.target.value)}>
                        <option value="Waste">Garbage & Waste Disposal</option>
                        <option value="Road">Road & Sidewalk Damage</option>
                        <option value="Lighting">Street Lights & Grid Maintenance</option>
                        <option value="Water">Water Leaks & Drain Blockages</option>
                        <option value="Other">General Town Council Inquiries</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Urgency Priority</label>
                      <select className="form-input" value={requestPriority} onChange={(e) => setRequestPriority(e.target.value)}>
                        <option value="low">Low (General Feedback)</option>
                        <option value="medium">Medium (Standard Request)</option>
                        <option value="high">High (Immediate Hazard)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Specific Details / Location description</label>
                      <textarea className="form-input" style={{ minHeight: '100px' }} required placeholder="Please state full address details to help council workers locate the issue." value={requestDesc} onChange={(e) => setRequestDesc(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submittingRequest}>
                      {submittingRequest ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>My Active Reports & Timeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {requests.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                      No service requests submitted yet.
                    </div>
                  ) : (
                    requests.map(req => (
                      <div key={req._id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>{req.title}</h4>
                          <span className={`badge ${req.status === 'resolved' ? 'badge-success' : req.status === 'in-progress' ? 'badge-pending' : 'badge-danger'}`}>
                            {req.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{req.description}</p>
                        
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                          <span>Cat: {req.category}</span>
                          <span style={{ color: req.priority === 'high' ? 'var(--danger)' : 'inherit' }}>Priority: {req.priority}</span>
                          <span>Filed: {new Date(req.submittedAt).toLocaleDateString()}</span>
                        </div>

                        {req.updates && req.updates.length > 0 && (
                          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Action Timeline</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {req.updates.map((upd, uIdx) => (
                                <div key={uIdx} style={{ fontSize: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                  <span style={{ color: 'var(--accent-color)', fontWeight: 650 }}>●</span>
                                  <div>
                                    <span style={{ fontWeight: 600 }}>{upd.status.toUpperCase()}: </span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{upd.comment}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 6: PROFILE                           */}
          {/* ======================================== */}
          {activeTab === 'profile' && (
            <div className="animated-fade" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', textAlign: 'center' }}>
                Citizen Profile Account
              </h2>
              <div className="card" style={{ padding: '2.5rem' }}>
                {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Edit Profile Details</h3>
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        value={profileUsername} 
                        onChange={(e) => setProfileUsername(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        required 
                        value={profileEmail} 
                        onChange={(e) => setProfileEmail(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password (leave blank to keep current)</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showProfilePassword ? "text" : "password"} 
                          className="form-input" 
                          placeholder="••••••••" 
                          value={profilePassword} 
                          onChange={(e) => setProfilePassword(e.target.value)} 
                          style={{ paddingRight: '2.5rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowProfilePassword(!showProfilePassword)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {showProfilePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingProfile}>
                        {submittingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditingProfile(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800 }}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>{user.username}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 600, marginTop: '0.25rem', textTransform: 'uppercase' }}>
                          Official Resident ID Verified
                        </p>
                      </div>
                    </div>

                    <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)' }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Resident Account Type</span>
                        <span style={{ fontWeight: 600 }}>Citizen</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Digital Portal ID</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{user._id || user.id}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Profile Status</span>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>Active</span>
                      </div>
                    </div>
                    
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setIsEditingProfile(true)}>
                      Edit Profile Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Payment Gateway Modal */}
      {paymentModalTax && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animated-fade" style={{ width: '400px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--accent-color)' }}>
              <Receipt />
              <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>Secure Billing Checkout</h3>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              You are paying <strong>{paymentModalTax.taxType}</strong>.
            </p>
            
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Grand Total:</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>${paymentModalTax.amount.toFixed(2)}</span>
            </div>

            <form onSubmit={handlePayTax}>
              <div className="form-group">
                <label className="form-label">Debit / Credit Card Number</label>
                <input type="text" className="form-input" placeholder="4000 1234 5678 9010" required maxLength="19" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input type="text" className="form-input" placeholder="MM/YY" required maxLength="5" />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV Code</label>
                  <input type="text" className="form-input" placeholder="321" required maxLength="3" />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setPaymentModalTax(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Process Checkout</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Dynamic Status Tracking Vertical Timeline Modal */}
      {activeTimelineItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animated-fade" style={{ width: '500px', maxWidth: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', margin: 0 }}>
                Status Tracking Timeline
              </h3>
              <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => { setActiveTimelineItem(null); setTimelineType(''); }}>
                Close
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Tracking System Record: <strong>{activeTimelineItem.title || activeTimelineItem.taxType}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px dashed var(--border-color)', marginLeft: '0.5rem' }}>
              {/* PERMIT TIMELINE */}
              {timelineType === 'permit' && (
                <>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-2.15rem', top: '0.2rem', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                    <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.25rem 0', fontWeight: 650 }}>Application Received</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                      The permit request was logged in the municipal database on {new Date(activeTimelineItem.submittedAt).toLocaleDateString()} at {new Date(activeTimelineItem.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                    </p>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-2.15rem', 
                      top: '0.2rem', 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      backgroundColor: activeTimelineItem.status !== 'pending' ? 'var(--success)' : 'var(--pending)' 
                    }}></div>
                    <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.25rem 0', fontWeight: 650 }}>Zoning & Code Review</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Municipal engineers review safety, zoning code adherence, and environment regulations. 
                      Status: <strong style={{ color: activeTimelineItem.status !== 'pending' ? 'var(--success)' : 'var(--pending)' }}>{activeTimelineItem.status !== 'pending' ? 'Completed' : 'Under Review'}</strong>
                    </p>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-2.15rem', 
                      top: '0.2rem', 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      backgroundColor: activeTimelineItem.status === 'approved' ? 'var(--success)' : activeTimelineItem.status === 'rejected' ? 'var(--danger)' : 'var(--border-color)' 
                    }}></div>
                    <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.25rem 0', fontWeight: 650 }}>Final Council Board Decision</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {activeTimelineItem.status === 'approved' ? (
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>Approved: Permit issued for construction/trading operations.</span>
                      ) : activeTimelineItem.status === 'rejected' ? (
                        <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Rejected: Application declined. Details: {activeTimelineItem.comments || 'No comment provided.'}</span>
                      ) : (
                        <span>Awaiting final Board signature and certification.</span>
                      )}
                    </p>
                  </div>
                </>
              )}

              {/* BOOKING TIMELINE */}
              {timelineType === 'booking' && (
                <>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-2.15rem', top: '0.2rem', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                    <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.25rem 0', fontWeight: 650 }}>Reservation Filed</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Submitted request for venue <strong>{activeTimelineItem.venue}</strong> on {activeTimelineItem.date} ({activeTimelineItem.timeSlot}) for {activeTimelineItem.ticketsCount} estimated attendees.
                    </p>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-2.15rem', top: '0.2rem', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                    <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.25rem 0', fontWeight: 650 }}>Calendar Scheduling Validation</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Automatic conflicts scan completed. Venue availability registered successfully.
                    </p>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-2.15rem', 
                      top: '0.2rem', 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      backgroundColor: activeTimelineItem.status === 'approved' ? 'var(--success)' : activeTimelineItem.status === 'cancelled' ? 'var(--danger)' : 'var(--pending)' 
                    }}></div>
                    <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.25rem 0', fontWeight: 650 }}>Reservation Approval Status</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Current status: <strong style={{ textTransform: 'uppercase', color: activeTimelineItem.status === 'approved' ? 'var(--success)' : activeTimelineItem.status === 'cancelled' ? 'var(--danger)' : 'var(--pending)' }}>{activeTimelineItem.status}</strong>
                    </p>
                  </div>
                </>
              )}

              {/* TAX TIMELINE */}
              {timelineType === 'tax' && (
                <>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-2.15rem', top: '0.2rem', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                    <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.25rem 0', fontWeight: 650 }}>Billing Invoice Generated</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                      A new levy invoice of <strong>${activeTimelineItem.amount.toFixed(2)}</strong> was generated on {new Date(activeTimelineItem.billingDate).toLocaleDateString()}.
                    </p>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-2.15rem', 
                      top: '0.2rem', 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      backgroundColor: activeTimelineItem.status === 'paid' ? 'var(--success)' : 'var(--pending)' 
                    }}></div>
                    <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.25rem 0', fontWeight: 650 }}>Resident Settle State</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {activeTimelineItem.status === 'paid' ? (
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                          Setted on {activeTimelineItem.paymentDate ? new Date(activeTimelineItem.paymentDate).toLocaleDateString() : 'recently'}. Receipt: #{activeTimelineItem.receiptNumber || 'N/A'}.
                        </span>
                      ) : (
                        <span>Awaiting digital transaction checkout via standard debit/credit card.</span>
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
