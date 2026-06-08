import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import GISMap from '../components/GISMap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, 
  FileText, 
  Wrench, 
  Receipt, 
  Download, 
  Megaphone,
  CheckCircle,
  XCircle,
  HelpCircle,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const { API_BASE_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  // Backend state
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [permits, setPermits] = useState([]);

  // Form inputs
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState('general');
  const [annAudience, setAnnAudience] = useState('all');

  // Request update state
  const [activeRequest, setActiveRequest] = useState(null);
  const [requestStatus, setRequestStatus] = useState('in-progress');
  const [requestComment, setRequestComment] = useState('');

  // Permit status state
  const [activePermit, setActivePermit] = useState(null);
  const [permitStatus, setPermitStatus] = useState('approved');
  const [permitComment, setPermitComment] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resAnal, resUsers, resReq, resPermits] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/analytics`, { headers }),
        fetch(`${API_BASE_URL}/admin/users`, { headers }),
        fetch(`${API_BASE_URL}/admin/requests`, { headers }),
        fetch(`${API_BASE_URL}/admin/permits`, { headers })
      ]);

      if (resAnal.ok) setAnalytics((await resAnal.json()).data);
      if (resUsers.ok) setUsers((await resUsers.json()).data);
      if (resReq.ok) setRequests((await resReq.json()).data);
      if (resPermits.ok) setPermits((await resPermits.json()).data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
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

  const handleUpdateRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'citizen' : 'admin';
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        showNotification('User role updated successfully.');
        fetchData();
      }
    } catch (err) {
      showNotification('Error updating role.', 'error');
    }
  };

  const handleUpdateRequestStatus = async (e) => {
    e.preventDefault();
    if (!activeRequest) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/requests/${activeRequest._id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: requestStatus, comment: requestComment })
      });

      if (response.ok) {
        showNotification('Service request updated successfully.');
        setActiveRequest(null);
        setRequestComment('');
        fetchData();
      }
    } catch (err) {
      showNotification('Error updating request.', 'error');
    }
  };

  const handleUpdatePermitStatus = async (e) => {
    e.preventDefault();
    if (!activePermit) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/permits/${activePermit._id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: permitStatus, comments: permitComment })
      });

      if (response.ok) {
        showNotification(`Permit application set to ${permitStatus}.`);
        setActivePermit(null);
        setPermitComment('');
        fetchData();
      }
    } catch (err) {
      showNotification('Error processing permit status.', 'error');
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: annTitle, content: annContent, type: annType, targetAudience: annAudience })
      });

      if (response.ok) {
        showNotification('Announcement posted successfully.');
        setAnnTitle('');
        setAnnContent('');
        fetchData();
      }
    } catch (err) {
      showNotification('Error submitting announcement.', 'error');
    }
  };

  const downloadCSVReport = () => {
    const token = localStorage.getItem('token');
    window.open(`${API_BASE_URL}/admin/reports/csv?token=${token}`, '_blank');
  };

  // Pie chart variables
  const COLORS = ['#10b981', '#ef4444'];
  const pieData = analytics ? [
    { name: 'Collected', value: analytics.summary.taxes.collected },
    { name: 'Outstanding', value: analytics.summary.taxes.pending }
  ] : [];

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role="admin" />
      
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
          {/* TAB 1: ANALYTICS & INSIGHTS              */}
          {/* ======================================== */}
          {activeTab === 'analytics' && analytics && (
            <div className="animated-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                    Analytics & Governance Insights
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Visual reporting, administrative metrics, and database management exports.
                  </p>
                </div>
                <button className="btn btn-primary" onClick={downloadCSVReport}>
                  <Download size={18} /> Export CSV Report
                </button>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 550 }}>Registered Citizens</span>
                    <Users size={18} />
                  </div>
                  <div className="stat-val">{analytics.summary.citizens}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>active resident portal accounts</span>
                </div>

                <div className="card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 550 }}>Pending Permits</span>
                    <FileText size={18} />
                  </div>
                  <div className="stat-val">{analytics.summary.pendingPermits}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>awaiting zoning/building approval</span>
                </div>

                <div className="card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 550 }}>Service Requests Resolve Rate</span>
                    <Wrench size={18} />
                  </div>
                  <div className="stat-val">
                    {analytics.summary.serviceRequests.total > 0 
                      ? Math.round((analytics.summary.serviceRequests.resolved / analytics.summary.serviceRequests.total) * 100)
                      : 0}%
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {analytics.summary.serviceRequests.resolved} resolved of {analytics.summary.serviceRequests.total} total
                  </span>
                </div>

                <div className="card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 550 }}>Taxes Collected</span>
                    <Receipt size={18} />
                  </div>
                  <div className="stat-val" style={{ color: 'var(--success)' }}>
                    ${analytics.summary.taxes.collected.toFixed(2)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    of ${analytics.summary.taxes.billed.toFixed(2)} billed (outstanding: ${analytics.summary.taxes.pending.toFixed(2)})
                  </span>
                </div>
              </div>

              {/* Recharts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginTop: '2.5rem' }}>
                <div className="card" style={{ padding: '1.5rem', minHeight: '350px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Service Requests by Category</h3>
                  <div style={{ width: '100%', height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.requestsByCategory}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                        <YAxis stroke="var(--text-secondary)" fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="count" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Taxes Revenue Breakdown</h3>
                  <div style={{ width: '100%', height: '220px', display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '3px' }} />
                      <span>Collected: 78%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '3px' }} />
                      <span>Outstanding: 22%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 2: USER MANAGEMENT                   */}
          {/* ======================================== */}
          {activeTab === 'users' && (
            <div className="animated-fade">
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                User Portal Account Management
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Verify resident credentials, edit authority permissions, and switch administrator roles.
              </p>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Account Name</th>
                      <th>Email Address</th>
                      <th>Database ID</th>
                      <th>Current Role</th>
                      <th>Registered On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 600 }}>{u.username}</td>
                        <td>{u.email}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{u._id}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-success'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleUpdateRole(u._id, u.role)}>
                            Change permissions to {u.role === 'admin' ? 'Citizen' : 'Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 3: SERVICE REQUEST APPROVAL          */}
          {/* ======================================== */}
          {activeTab === 'requests' && (
            <div className="animated-fade">
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                Municipal Service Inquiries & Feedback
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Review, allocate maintenance teams, and add timeline comments to citizen utility reports.
              </p>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Citizen Name</th>
                      <th>Feedback Title</th>
                      <th>Dept Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Submission Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No reports filed.</td>
                      </tr>
                    ) : (
                      requests.map(req => (
                        <tr key={req._id}>
                          <td style={{ fontWeight: 600 }}>{req.citizenName}</td>
                          <td>{req.title}</td>
                          <td>{req.category}</td>
                          <td>
                            <span style={{ color: req.priority === 'high' ? 'var(--danger)' : 'inherit', fontWeight: req.priority === 'high' ? 700 : 'normal' }}>
                              {req.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${req.status === 'resolved' ? 'badge-success' : req.status === 'in-progress' ? 'badge-pending' : 'badge-danger'}`}>
                              {req.status}
                            </span>
                          </td>
                          <td>{new Date(req.submittedAt).toLocaleDateString()}</td>
                          <td>
                            <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => { setActiveRequest(req); setRequestStatus(req.status); }}>
                              Update Status
                            </button>
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
          {/* TAB 4: PERMITS APPROVAL                  */}
          {/* ======================================== */}
          {activeTab === 'permits' && (
            <div className="animated-fade">
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                Building & Trade Permits Review Board
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Review architectural zoning specifications and approve/reject resident applications.
              </p>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Citizen Name</th>
                      <th>Application Title</th>
                      <th>Permit Category</th>
                      <th>Submission Date</th>
                      <th>Status</th>
                      <th>Action Decisions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permits.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No permit applications found.</td>
                      </tr>
                    ) : (
                      permits.map(permit => (
                        <tr key={permit._id}>
                          <td style={{ fontWeight: 600 }}>{permit.citizenName}</td>
                          <td>{permit.title}</td>
                          <td>{permit.permitType}</td>
                          <td>{new Date(permit.submittedAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${permit.status === 'approved' ? 'badge-success' : permit.status === 'rejected' ? 'badge-danger' : 'badge-pending'}`}>
                              {permit.status}
                            </span>
                          </td>
                          <td>
                            {permit.status === 'pending' ? (
                              <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => setActivePermit(permit)}>
                                Review & Decide
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Reviewed ✓</span>
                            )}
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
          {/* TAB 5: GIS TOWN PLANNING                 */}
          {/* ======================================== */}
          {activeTab === 'gis' && (
            <div className="animated-fade">
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                GIS Town Planning Zoning Board
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Review spatial zone boundaries and allocate property plots inside local sectors.
              </p>
              <GISMap />
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 6: ANNOUNCEMENTS MANAGEMENT          */}
          {/* ======================================== */}
          {activeTab === 'announcements' && (
            <div className="animated-fade" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)', textAlign: 'center' }}>
                Post System-Wide Announcements
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
                Publish urgent maintenance alerts, public assembly dates, or council updates to citizen dashboards.
              </p>

              <div className="card">
                <form onSubmit={handlePostAnnouncement}>
                  <div className="form-group">
                    <label className="form-label">Alert Header / Title</label>
                    <input type="text" className="form-input" required placeholder="e.g. Garbage collection delays" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Classification Type</label>
                      <select className="form-input" value={annType} onChange={(e) => setAnnType(e.target.value)}>
                        <option value="general">General Advisory</option>
                        <option value="event">Council Meeting / Event</option>
                        <option value="urgent">Urgent Notice (Emergency)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Target View Audience</label>
                      <select className="form-input" value={annAudience} onChange={(e) => setAnnAudience(e.target.value)}>
                        <option value="all">Publish to All Users</option>
                        <option value="citizens">Citizens Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Announcement Content Text</label>
                    <textarea className="form-input" style={{ minHeight: '120px' }} required placeholder="Describe full details of the notice..." value={annContent} onChange={(e) => setAnnContent(e.target.value)} />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    <Megaphone size={18} /> Publish Announcement
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Request Update Modal */}
      {activeRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animated-fade" style={{ width: '450px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Update Service Request</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Updating: <strong>{activeRequest.title}</strong>
            </p>
            
            <form onSubmit={handleUpdateRequestStatus}>
              <div className="form-group">
                <label className="form-label">New Status Classification</label>
                <select className="form-input" value={requestStatus} onChange={(e) => setRequestStatus(e.target.value)}>
                  <option value="submitted">Submitted (Awaiting Action)</option>
                  <option value="in-progress">In-Progress (Team Dispatched)</option>
                  <option value="resolved">Resolved (Completed)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Timeline Comment / Update Details</label>
                <textarea className="form-input" style={{ minHeight: '100px' }} required placeholder="e.g. Maintenance crew dispatched to fix pothole." value={requestComment} onChange={(e) => setRequestComment(e.target.value)} />
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveRequest(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permit Review Modal */}
      {activePermit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animated-fade" style={{ width: '450px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Review Permit Application</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Reviewing: <strong>{activePermit.title}</strong> by {activePermit.citizenName}
            </p>
            <p style={{ fontSize: '0.85rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.25rem' }}>
              {activePermit.description}
            </p>

            <form onSubmit={handleUpdatePermitStatus}>
              <div className="form-group">
                <label className="form-label">Decision Outcome</label>
                <select className="form-input" value={permitStatus} onChange={(e) => setPermitStatus(e.target.value)}>
                  <option value="approved">Approved (Issue License)</option>
                  <option value="rejected">Rejected (Decline Application)</option>
                  <option value="pending">Hold (Pending Updates)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Decision Notes / Comments</label>
                <textarea className="form-input" style={{ minHeight: '100px' }} required placeholder="State spatial arguments or approval conditions..." value={permitComment} onChange={(e) => setPermitComment(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActivePermit(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Decision</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
