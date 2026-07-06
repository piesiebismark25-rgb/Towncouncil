import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  Calendar, 
  Wrench, 
  Map, 
  Users, 
  Megaphone,
  UserCog
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, role }) => {
  const citizenItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'taxes', label: 'Tax Payments', icon: Receipt },
    { id: 'permits', label: 'Permits', icon: FileText },
    { id: 'events', label: 'Events Calendar', icon: Calendar },
    { id: 'requests', label: 'Service Requests', icon: Wrench },
    { id: 'profile', label: 'My Profile', icon: UserCog }
  ];

  const adminItems = [
    { id: 'analytics', label: 'Analytics Insights', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'requests', label: 'Service Requests', icon: Wrench },
    { id: 'permits', label: 'Permits Approval', icon: FileText },
    { id: 'bookings', label: 'Event Bookings', icon: Calendar },
    { id: 'taxes', label: 'Tax Billing', icon: Receipt },
    { id: 'gis', label: 'GIS Planning', icon: Map },
    { id: 'announcements', label: 'Announcements', icon: Megaphone }
  ];

  const items = role === 'admin' ? adminItems : citizenItems;

  return (
    <div className="sidebar">
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          color: 'var(--text-tertiary)',
          paddingLeft: '0.75rem'
        }}>
          {role} Menu
        </p>
      </div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => {
                  setActiveTab(item.id);
                  document.body.classList.remove('mobile-sidebar-open');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
                  color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.925rem',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--accent-color)' : 'var(--text-tertiary)' }} />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
