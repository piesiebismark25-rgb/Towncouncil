import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';

const CalendarView = ({ events, onBookEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // Seed to May 2026
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 - 12:00');
  const [venue, setVenue] = useState('Town Hall Center');
  const [tickets, setTickets] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleCellClick = (day) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setDate(formattedDate);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !date) return;
    setSubmitting(true);
    try {
      await onBookEvent({ title, description, date, timeSlot, venue, ticketsCount: Number(tickets) });
      setTitle('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter events for specific calendar cells
  const getCellEvents = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  // Build grid blocks
  const gridCells = [];
  // Blanks
  for (let i = 0; i < firstDayIndex; i++) {
    gridCells.push(<div key={`blank-${i}`} className="calendar-cell blank" style={{ minHeight: '90px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', opacity: 0.4 }}></div>);
  }
  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getCellEvents(day);
    gridCells.push(
      <div 
        key={`day-${day}`} 
        className="calendar-cell"
        onClick={() => handleCellClick(day)}
        style={{ 
          minHeight: '90px', 
          border: '1px solid var(--border-color)', 
          padding: '0.5rem', 
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'background-color var(--transition-fast)'
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{day}</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
          {dayEvents.map((evt, idx) => (
            <div 
              key={idx} 
              style={{ 
                fontSize: '0.7rem', 
                backgroundColor: 'var(--accent-light)', 
                color: 'var(--accent-color)', 
                padding: '2px 4px', 
                borderRadius: '3px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: 650,
                borderLeft: '2px solid var(--border-focus)'
              }}
              title={`${evt.title} (${evt.timeSlot})`}
            >
              {evt.title}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <CalendarIcon style={{ color: 'var(--accent-color)' }} />
          <select 
            value={month} 
            onChange={(e) => setCurrentDate(new Date(year, parseInt(e.target.value), 1))}
            className="form-input"
            style={{ width: '130px', padding: '0.35rem 0.5rem', fontSize: '0.9rem', height: 'auto', border: '1px solid var(--border-color)', margin: 0 }}
          >
            {monthNames.map((name, index) => (
              <option key={index} value={index}>{name}</option>
            ))}
          </select>
          <select 
            value={year} 
            onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), month, 1))}
            className="form-input"
            style={{ width: '95px', padding: '0.35rem 0.5rem', fontSize: '0.9rem', height: 'auto', border: '1px solid var(--border-color)', margin: 0 }}
          >
            {[2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={prevMonth} style={{ padding: '0.5rem' }}><ChevronLeft size={16} /></button>
          <button className="btn btn-secondary" onClick={nextMonth} style={{ padding: '0.5rem' }}><ChevronRight size={16} /></button>
          <button className="btn btn-primary" onClick={() => { setDate(`${year}-${String(month + 1).padStart(2, '0')}-01`); setShowForm(true); }} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Book Event
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.75rem 0' }}>
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: 'var(--bg-secondary)' }}>
          {gridCells}
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animated-fade" style={{ width: '450px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Book a Local Event / Center Venue</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Event / Booking Purpose</label>
                <input type="text" className="form-input" required placeholder="e.g. Wedding Reception, Club Meeting" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Short Description</label>
                <input type="text" className="form-input" placeholder="Optional details..." value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Date (YYYY-MM-DD)</label>
                <input type="date" className="form-input" required value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Time Slot</label>
                <select className="form-input" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                  <option value="09:00 - 12:00">Morning (09:00 AM - 12:00 PM)</option>
                  <option value="13:00 - 17:00">Afternoon (01:00 PM - 05:00 PM)</option>
                  <option value="18:00 - 22:00">Evening (06:00 PM - 10:00 PM)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Select Venue</label>
                <select className="form-input" value={venue} onChange={(e) => setVenue(e.target.value)}>
                  <option value="Town Hall Center">Town Hall Main Assembly Center</option>
                  <option value="Community Park Pavilion">Community Park Recreation Pavilion</option>
                  <option value="Municipal Sports Arena">Municipal Multi-Purpose Sports Arena</option>
                  <option value="Council Conference Room">Town Council Conference Room B</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Attendance / Tickets</label>
                <input type="number" min="1" className="form-input" value={tickets} onChange={(e) => setTickets(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
