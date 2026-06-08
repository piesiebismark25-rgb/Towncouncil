import { User, TaxPayment, PermitApplication, EventBooking, ServiceRequest, Announcement } from '../models/dbFactory.js';
import fs from 'fs';
import path from 'path';

// ==========================================
// 1. Data Analytics & Insights
// ==========================================

// @desc    Get dashboard metrics & analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const users = await User.find({});
    const taxes = await TaxPayment.find({});
    const permits = await PermitApplication.find({});
    const bookings = await EventBooking.find({});
    const requests = await ServiceRequest.find({});

    const citizenCount = users.filter(u => u.role === 'citizen').length;
    
    // Requests calculations
    const reqSubmitted = requests.filter(r => r.status === 'submitted').length;
    const reqInProgress = requests.filter(r => r.status === 'in-progress').length;
    const reqResolved = requests.filter(r => r.status === 'resolved').length;

    // Permits calculations
    const permitsPending = permits.filter(p => p.status === 'pending').length;
    const permitsApproved = permits.filter(p => p.status === 'approved').length;

    // Tax calculations
    const totalTaxBilled = taxes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalTaxCollected = taxes.filter(t => t.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);

    // Dynamic analytics: Requests per category
    const categories = ['Waste', 'Road', 'Lighting', 'Water', 'Other'];
    const requestsByCategory = categories.map(cat => ({
      name: cat,
      count: requests.filter(r => r.category === cat).length
    }));

    // Dynamic analytics: Tax collections by type
    const taxTypesMap = {};
    taxes.forEach(t => {
      const baseType = t.taxType.split(' ')[0]; // Group by e.g. "Property"
      taxTypesMap[baseType] = (taxTypesMap[baseType] || 0) + (t.status === 'paid' ? t.amount : 0);
    });
    const taxByType = Object.keys(taxTypesMap).map(type => ({
      name: type,
      value: taxTypesMap[type]
    }));

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          citizens: citizenCount,
          pendingPermits: permitsPending,
          approvedPermits: permitsApproved,
          serviceRequests: {
            total: requests.length,
            submitted: reqSubmitted,
            inProgress: reqInProgress,
            resolved: reqResolved
          },
          taxes: {
            billed: totalTaxBilled,
            collected: totalTaxCollected,
            pending: totalTaxBilled - totalTaxCollected
          },
          bookingsCount: bookings.length
        },
        requestsByCategory,
        taxByType
      }
    });
  } catch (err) {
    console.error('Analytics Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error retrieving analytics data' });
  }
};

// ==========================================
// 2. User Management
// ==========================================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    // Remove passwords from response
    const sanitized = users.map(u => ({
      _id: u._id,
      username: u.username,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    }));
    res.status(200).json({ status: 'success', data: sanitized });
  } catch (err) {
    console.error('Fetch Users Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error retrieving users' });
  }
};

// @desc    Update user role
// @route   POST /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['citizen', 'admin'].includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Invalid role specified' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { role });
    if (!updatedUser) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'User role updated successfully',
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role
      }
    });
  } catch (err) {
    console.error('Update User Role Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating user role' });
  }
};

// ==========================================
// 3. Service Request Management
// ==========================================

// @desc    Get all service requests
// @route   GET /api/admin/requests
// @access  Private/Admin
export const getAllRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({});
    // Sort by submission date (newest first)
    const sorted = requests.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    res.status(200).json({ status: 'success', data: sorted });
  } catch (err) {
    console.error('Fetch Admin Requests Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching requests' });
  }
};

// @desc    Update service request status / add update
// @route   POST /api/admin/requests/:id/update
// @access  Private/Admin
export const updateServiceRequest = async (req, res) => {
  try {
    const { status, comment } = req.body;

    if (!status || !['submitted', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status specified' });
    }

    const updateObj = {
      status,
      comment: comment || `Status updated to ${status}`
    };

    const updatedRequest = await ServiceRequest.findByIdAndUpdate(req.params.id, {
      status,
      $push: { updates: updateObj }
    });

    if (!updatedRequest) {
      return res.status(404).json({ status: 'error', message: 'Service request not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Service request updated successfully',
      data: updatedRequest
    });
  } catch (err) {
    console.error('Update Service Request Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating service request' });
  }
};

// ==========================================
// 4. Permit Management
// ==========================================

// @desc    Get all permits
// @route   GET /api/admin/permits
// @access  Private/Admin
export const getAllPermits = async (req, res) => {
  try {
    const permits = await PermitApplication.find({});
    res.status(200).json({ status: 'success', data: permits });
  } catch (err) {
    console.error('Fetch Admin Permits Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching permit applications' });
  }
};

// @desc    Approve/Reject a permit
// @route   POST /api/admin/permits/:id/status
// @access  Private/Admin
export const updatePermitStatus = async (req, res) => {
  try {
    const { status, comments } = req.body;

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid permit status' });
    }

    const updatedPermit = await PermitApplication.findByIdAndUpdate(req.params.id, {
      status,
      comments: comments || '',
      updatedAt: new Date()
    });

    if (!updatedPermit) {
      return res.status(404).json({ status: 'error', message: 'Permit application not found' });
    }

    res.status(200).json({
      status: 'success',
      message: `Permit application marked as ${status}`,
      data: updatedPermit
    });
  } catch (err) {
    console.error('Update Permit Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating permit' });
  }
};

// ==========================================
// 5. Announcements Management
// ==========================================

// @desc    Create announcement
// @route   POST /api/admin/announcements
// @access  Private/Admin
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, type, targetAudience } = req.body;

    if (!title || !content) {
      return res.status(400).json({ status: 'error', message: 'Please provide title and content' });
    }

    const newAnnouncement = await Announcement.create({
      title,
      content,
      type: type || 'general',
      targetAudience: targetAudience || 'all',
      date: new Date()
    });

    res.status(201).json({ status: 'success', data: newAnnouncement });
  } catch (err) {
    console.error('Create Announcement Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error creating announcement' });
  }
};

// ==========================================
// 6. GIS Zones Data
// ==========================================

// Seed GIS database structure in memory / local JSON
const getGisFilePath = () => path.join(process.cwd(), 'data', 'gis.json');

const loadGisData = () => {
  const filePath = getGisFilePath();
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    const defaultGis = [
      { id: 'zone-1', name: 'Residential Zone A', color: 'rgba(52, 211, 153, 0.4)', type: 'residential', plots: [{ x: 50, y: 50, w: 80, h: 60, status: 'allocated', owner: 'Jane Doe' }] },
      { id: 'zone-2', name: 'Commercial Zone B', color: 'rgba(96, 165, 250, 0.4)', type: 'commercial', plots: [{ x: 180, y: 50, w: 100, h: 80, status: 'available', owner: '' }] },
      { id: 'zone-3', name: 'Industrial Zone C', color: 'rgba(251, 191, 36, 0.4)', type: 'industrial', plots: [{ x: 50, y: 180, w: 120, h: 90, status: 'allocated', owner: 'BuildCorp Inc.' }] },
      { id: 'zone-4', name: 'Green Space & Recreation', color: 'rgba(74, 222, 128, 0.6)', type: 'recreation', plots: [{ x: 220, y: 180, w: 80, h: 80, status: 'reserved', owner: 'Town Council' }] }
    ];
    fs.writeFileSync(filePath, JSON.stringify(defaultGis, null, 2));
    return defaultGis;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

// @desc    Get GIS mapping data
// @route   GET /api/admin/gis-zones
// @access  Private
export const getGisZones = async (req, res) => {
  try {
    const data = loadGisData();
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    console.error('GIS Fetch Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error retrieving GIS data' });
  }
};

// @desc    Add a plot to a GIS zone
// @route   POST /api/admin/gis-zones
// @access  Private/Admin
export const addGisPlot = async (req, res) => {
  try {
    const { zoneId, plot } = req.body;
    if (!zoneId || !plot || !plot.x || !plot.y || !plot.w || !plot.h) {
      return res.status(400).json({ status: 'error', message: 'Invalid zone ID or plot specs' });
    }

    const data = loadGisData();
    const zoneIndex = data.findIndex(z => z.id === zoneId);
    if (zoneIndex === -1) {
      return res.status(404).json({ status: 'error', message: 'GIS Zone not found' });
    }

    const newPlot = {
      id: 'plot-' + Date.now(),
      x: Number(plot.x),
      y: Number(plot.y),
      w: Number(plot.w),
      h: Number(plot.h),
      status: plot.status || 'available',
      owner: plot.owner || ''
    };

    data[zoneIndex].plots.push(newPlot);
    fs.writeFileSync(getGisFilePath(), JSON.stringify(data, null, 2));

    res.status(201).json({ status: 'success', data: data[zoneIndex] });
  } catch (err) {
    console.error('GIS Plot Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error adding GIS plot' });
  }
};

// ==========================================
// 7. Report Exports (CSV)
// ==========================================

// @desc    Export service requests CSV report
// @route   GET /api/admin/reports/csv
// @access  Private/Admin
export const exportRequestsCsv = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({});

    let csvContent = 'ID,Citizen Name,Title,Category,Priority,Status,Submitted At\n';
    
    requests.forEach(r => {
      const id = r._id || r.id;
      const citizen = r.citizenName.replace(/,/g, ' ');
      const title = r.title.replace(/,/g, ' ');
      const category = r.category;
      const priority = r.priority;
      const status = r.status;
      const date = new Date(r.submittedAt).toISOString().split('T')[0];
      
      csvContent += `${id},${citizen},${title},${category},${priority},${status},${date}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=service_requests_report.csv');
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('CSV Export Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error exporting report' });
  }
};
