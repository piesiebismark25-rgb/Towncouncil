import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCheck, LogOut, Landmark, Menu } from 'lucide-react';

const Navbar = () => {
  const { user, logout, API_BASE_URL } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleMobileSidebar = () => {
    document.body.classList.toggle('mobile-sidebar-open');
  };

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        setNotifications(resData.data || []);
      }
    } catch (err) {
      console.error('Notification fetch error:', err);
    }
  }, [API_BASE_URL, user]);

  useEffect(() => {
    if (!user) return undefined;

    const timeoutId = window.setTimeout(fetchNotifications, 0);
    const intervalId = window.setInterval(fetchNotifications, 30000);
    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [fetchNotifications, user]);

  const markRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((items) => items.map((item) => (
        item._id === notificationId ? { ...item, isRead: true } : item
      )));
    } catch (err) {
      console.error('Notification read error:', err);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      console.error('Notification read-all error:', err);
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

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
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowNotifications((value) => !value)}
              aria-label="Open notifications"
              title="Notifications"
              style={{ padding: '0.45rem', width: '40px', height: '40px', position: 'relative' }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 5px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--danger)',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-primary)'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="card animated-fade"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 0.75rem)',
                  width: 'min(360px, calc(100vw - 2rem))',
                  maxHeight: '420px',
                  overflowY: 'auto',
                  zIndex: 100,
                  padding: 0,
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.9rem 1rem',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <strong style={{ fontSize: '0.95rem' }}>Notifications</strong>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={markAllRead}
                    title="Mark all as read"
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    <CheckCheck size={15} />
                    Read
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <div style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 20).map((notification) => (
                    <button
                      type="button"
                      key={notification._id}
                      onClick={() => markRead(notification._id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        border: 0,
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: notification.isRead ? 'transparent' : 'var(--accent-light)',
                        padding: '0.9rem 1rem',
                        cursor: 'pointer',
                        display: 'block'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.86rem' }}>{notification.title}</strong>
                        {!notification.isRead && (
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', flex: '0 0 auto', marginTop: '0.25rem' }} />
                        )}
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.45, margin: 0 }}>
                        {notification.message}
                      </p>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', display: 'block', marginTop: '0.45rem' }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

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
