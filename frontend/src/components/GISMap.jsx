import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Map, Plus, HelpCircle, CheckCircle } from 'lucide-react';

const GISMap = () => {
  const { user, API_BASE_URL } = useAuth();
  const canvasRef = useRef(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add plot state
  const [selectedZoneId, setSelectedZoneId] = useState('zone-1');
  const [plotX, setPlotX] = useState(50);
  const [plotY, setPlotY] = useState(50);
  const [plotW, setPlotW] = useState(80);
  const [plotH, setPlotH] = useState(60);
  const [status, setStatus] = useState('available');
  const [owner, setOwner] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [hoverInfo, setHoverInfo] = useState('');

  const fetchGisZones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/gis-zones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        setZones(resData.data);
      }
    } catch (err) {
      console.error('Fetch GIS Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGisZones();
  }, []);

  // Draw Canvas
  useEffect(() => {
    if (loading || zones.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Reset Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    const step = 20;
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Zones
    zones.forEach(zone => {
      // Define boundaries based on ID
      let zx = 20, zy = 20, zw = 210, zh = 160;
      if (zone.id === 'zone-1') { zx = 20; zy = 20; zw = 210; zh = 160; }
      else if (zone.id === 'zone-2') { zx = 250; zy = 20; zw = 210; zh = 160; }
      else if (zone.id === 'zone-3') { zx = 20; zy = 200; zw = 210; zh = 160; }
      else if (zone.id === 'zone-4') { zx = 250; zy = 200; zw = 210; zh = 160; }

      // Fill Zone Box
      ctx.fillStyle = zone.color;
      ctx.fillRect(zx, zy, zw, zh);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(zx, zy, zw, zh);

      // Label Zone
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 9px var(--font-sans)';
      ctx.fillText(zone.name.toUpperCase(), zx + 10, zy + 15);

      // Draw Plots
      zone.plots.forEach(plot => {
        // Color based on status
        if (plot.status === 'allocated') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.35)'; // Red
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        } else if (plot.status === 'reserved') {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.35)'; // Orange
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
        } else {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.35)'; // Green
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
        }

        ctx.lineWidth = 1;
        ctx.fillRect(plot.x, plot.y, plot.w, plot.h);
        ctx.strokeRect(plot.x, plot.y, plot.w, plot.h);

        // Draw text
        ctx.fillStyle = 'var(--text-primary)';
        ctx.font = 'bold 8px var(--font-sans)';
        ctx.fillText(plot.owner ? plot.owner.substring(0, 10) : 'Available', plot.x + 5, plot.y + 15);
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '7px var(--font-sans)';
        ctx.fillText(`${plot.w}m x ${plot.h}m`, plot.x + 5, plot.y + 25);
      });
    });
  }, [zones, loading]);

  const handleCanvasClick = (e) => {
    if (user.role !== 'admin') return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // Auto classify click into zones
    let zoneId = 'zone-1';
    if (x < 240 && y < 190) zoneId = 'zone-1';
    else if (x >= 240 && y < 190) zoneId = 'zone-2';
    else if (x < 240 && y >= 190) zoneId = 'zone-3';
    else zoneId = 'zone-4';

    setSelectedZoneId(zoneId);
    setPlotX(x - 20); // offset to center under cursor
    setPlotY(y - 20);
    setShowForm(true);
  };

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // Find if hover lies over a plot
    let foundPlot = null;
    let foundZone = null;
    for (const zone of zones) {
      for (const plot of zone.plots) {
        if (x >= plot.x && x <= plot.x + plot.w && y >= plot.y && y <= plot.y + plot.h) {
          foundPlot = plot;
          foundZone = zone;
          break;
        }
      }
    }

    if (foundPlot) {
      setHoverInfo(`${foundZone.name} | Plot owner: ${foundPlot.owner || 'Vacant'} | Dim: ${foundPlot.w}m x ${foundPlot.h}m | Status: ${foundPlot.status}`);
    } else {
      setHoverInfo(`X: ${x}px, Y: ${y}px`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/gis-zones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          zoneId: selectedZoneId,
          plot: { x: Number(plotX), y: Number(plotY), w: Number(plotW), h: Number(plotH), status, owner }
        })
      });

      if (response.ok) {
        setShowForm(false);
        setOwner('');
        fetchGisZones();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <Map style={{ color: 'var(--accent-color)' }} />
        <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Interactive GIS Town Zoning Portal</h3>
      </div>

      <div className="gis-grid animated-fade">
        <div className="gis-canvas-container card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', width: '100%' }}>
          <canvas
            ref={canvasRef}
            width={480}
            height={380}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              cursor: user.role === 'admin' ? 'crosshair' : 'default',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
            }}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontStyle: 'italic', height: '15px' }}>
            {hoverInfo || 'Move cursor over the map to inspect coordinates & plot owners'}
          </div>
        </div>

        <div className="card">
          <h4 style={{ fontSize: '1rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Zoning Legend</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="gis-legend-item">
              <div className="gis-legend-color" style={{ backgroundColor: 'rgba(52, 211, 153, 0.4)' }} />
              <div>Residential Area (A)</div>
            </div>
            <div className="gis-legend-item">
              <div className="gis-legend-color" style={{ backgroundColor: 'rgba(96, 165, 250, 0.4)' }} />
              <div>Commercial Zone (B)</div>
            </div>
            <div className="gis-legend-item">
              <div className="gis-legend-color" style={{ backgroundColor: 'rgba(251, 191, 36, 0.4)' }} />
              <div>Industrial Park (C)</div>
            </div>
            <div className="gis-legend-item">
              <div className="gis-legend-color" style={{ backgroundColor: 'rgba(74, 222, 128, 0.6)' }} />
              <div>Green Space & Recreation</div>
            </div>
            
            <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', my: '0.5rem' }} />
            
            <h4 style={{ fontSize: '0.9rem', margin: '0.5rem 0', fontFamily: 'var(--font-heading)' }}>Plot Status</h4>
            <div className="gis-legend-item">
              <div className="gis-legend-color" style={{ backgroundColor: 'rgba(16, 185, 129, 0.35)', border: '1px solid rgba(16, 185, 129, 0.7)' }} />
              <div>Available (Vacant)</div>
            </div>
            <div className="gis-legend-item">
              <div className="gis-legend-color" style={{ backgroundColor: 'rgba(239, 68, 68, 0.35)', border: '1px solid rgba(239, 68, 68, 0.7)' }} />
              <div>Allocated (Sold)</div>
            </div>
            <div className="gis-legend-item">
              <div className="gis-legend-color" style={{ backgroundColor: 'rgba(245, 158, 11, 0.35)', border: '1px solid rgba(245, 158, 11, 0.7)' }} />
              <div>Reserved (Council)</div>
            </div>
          </div>
          {user.role === 'admin' && (
            <div style={{ marginTop: '1.5rem', padding: '0.75rem', backgroundColor: 'var(--accent-light)', border: '1px dashed var(--border-focus)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                💡 Admin Tip: Click anywhere inside the canvas boundaries to create and allocate a new plot.
              </p>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card animated-fade" style={{ width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Allocate GIS Plot</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Selected Zone</label>
                <select className="form-input" value={selectedZoneId} onChange={(e) => setSelectedZoneId(e.target.value)}>
                  <option value="zone-1">Residential Zone A</option>
                  <option value="zone-2">Commercial Zone B</option>
                  <option value="zone-3">Industrial Zone C</option>
                  <option value="zone-4">Recreation Area D</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Position X (px)</label>
                  <input type="number" className="form-input" value={plotX} onChange={(e) => setPlotX(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Position Y (px)</label>
                  <input type="number" className="form-input" value={plotY} onChange={(e) => setPlotY(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Width (meters)</label>
                  <input type="number" className="form-input" value={plotW} onChange={(e) => setPlotW(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Height (meters)</label>
                  <input type="number" className="form-input" value={plotH} onChange={(e) => setPlotH(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Allocation Status</label>
                <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="available">Available (Vacant)</option>
                  <option value="allocated">Allocated (Sold)</option>
                  <option value="reserved">Reserved (Council)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Plot Owner Name</label>
                <input type="text" className="form-input" placeholder="e.g. Acme Corp, Jane Doe" value={owner} onChange={(e) => setOwner(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Allocate Plot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GISMap;
