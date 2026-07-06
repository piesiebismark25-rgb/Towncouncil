import { User, TaxPayment, PermitApplication, EventBooking, ServiceRequest, Announcement } from '../models/dbFactory.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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

// @desc    Create a new user
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ status: 'error', message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      status: 'success',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Create User Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error creating user' });
  }
};

// @desc    Edit user profile
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const editUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return res.status(400).json({ status: 'error', message: 'Email already taken by another account' });
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData);

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        _id: updatedUser._id,
        username: username || updatedUser.username,
        email: email || updatedUser.email,
        role: role || updatedUser.role
      }
    });
  } catch (err) {
    console.error('Edit User Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating user' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user && req.user.id && req.user.id.toString() === userId.toString()) {
      return res.status(400).json({ status: 'error', message: 'Self-deletion is forbidden' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete User Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting user' });
  }
};

// @desc    Get user full history details
// @route   GET /api/admin/users/:id/details
// @access  Private/Admin
export const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const [taxes, permits, bookings, requests] = await Promise.all([
      TaxPayment.find({ citizenId: userId }),
      PermitApplication.find({ citizenId: userId }),
      EventBooking.find({ citizenId: userId }),
      ServiceRequest.find({ citizenId: userId })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        },
        taxes,
        permits,
        bookings,
        requests
      }
    });
  } catch (err) {
    console.error('Get User Details Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching user details' });
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

// @desc    Create service request on behalf of a citizen
// @route   POST /api/admin/requests
// @access  Private/Admin
export const createRequestOnBehalf = async (req, res) => {
  try {
    const { citizenId, title, description, category, priority } = req.body;

    if (!citizenId || !title || !description || !category || !priority) {
      return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }

    const citizen = await User.findById(citizenId);
    if (!citizen) {
      return res.status(404).json({ status: 'error', message: 'Citizen not found' });
    }

    const request = await ServiceRequest.create({
      citizenId,
      citizenName: citizen.username,
      title,
      description,
      category,
      priority,
      status: 'submitted',
      updates: [{
        status: 'submitted',
        comment: 'Service request lodged by Admin on behalf of citizen.'
      }]
    });

    res.status(201).json({ status: 'success', data: request });
  } catch (err) {
    console.error('Create Request On Behalf Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error creating request' });
  }
};

// @desc    Edit service request details
// @route   PUT /api/admin/requests/:id
// @access  Private/Admin
export const editRequest = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const reqId = req.params.id;

    const request = await ServiceRequest.findById(reqId);
    if (!request) {
      return res.status(404).json({ status: 'error', message: 'Request not found' });
    }

    const updated = await ServiceRequest.findByIdAndUpdate(reqId, {
      title: title || request.title,
      description: description || request.description,
      category: category || request.category,
      priority: priority || request.priority
    }, { new: true });

    res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    console.error('Edit Request Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating request' });
  }
};

// @desc    Delete service request
// @route   DELETE /api/admin/requests/:id
// @access  Private/Admin
export const deleteRequest = async (req, res) => {
  try {
    const reqId = req.params.id;

    const deleted = await ServiceRequest.findByIdAndDelete(reqId);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Request not found' });
    }

    res.status(200).json({ status: 'success', message: 'Request deleted successfully' });
  } catch (err) {
    console.error('Delete Request Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting request' });
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

// @desc    Update announcement
// @route   PUT /api/admin/announcements/:id
// @access  Private/Admin
export const updateAnnouncement = async (req, res) => {
  try {
    const { title, content, type, targetAudience } = req.body;
    const ann = await Announcement.findById(req.params.id);
    if (!ann) {
      return res.status(404).json({ status: 'error', message: 'Announcement not found' });
    }

    const updated = await Announcement.findByIdAndUpdate(req.params.id, {
      title: title || ann.title,
      content: content || ann.content,
      type: type || ann.type,
      targetAudience: targetAudience || ann.targetAudience
    }, { new: true });

    res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    console.error('Update Announcement Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating announcement' });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/admin/announcements/:id
// @access  Private/Admin
export const deleteAnnouncement = async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Announcement not found' });
    }
    res.status(200).json({ status: 'success', message: 'Announcement deleted successfully' });
  } catch (err) {
    console.error('Delete Announcement Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting announcement' });
  }
};

// @desc    Create permit on behalf of citizen
// @route   POST /api/admin/permits
// @access  Private/Admin
export const createPermitOnBehalf = async (req, res) => {
  try {
    const { citizenId, title, description, permitType, status, comments } = req.body;
    if (!citizenId || !title || !description || !permitType) {
      return res.status(400).json({ status: 'error', message: 'Missing required permit fields' });
    }
    const citizen = await User.findById(citizenId);
    if (!citizen) {
      return res.status(404).json({ status: 'error', message: 'Citizen not found' });
    }

    const newPermit = await PermitApplication.create({
      citizenId,
      citizenName: citizen.username,
      title,
      description,
      permitType,
      status: status || 'pending',
      comments: comments || '',
      submittedAt: new Date(),
      updatedAt: new Date()
    });
    res.status(201).json({ status: 'success', data: newPermit });
  } catch (err) {
    console.error('Create Permit Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error creating permit application' });
  }
};

// @desc    Edit permit application
// @route   PUT /api/admin/permits/:id
// @access  Private/Admin
export const editPermit = async (req, res) => {
  try {
    const { title, description, permitType, status, comments } = req.body;
    const permit = await PermitApplication.findById(req.params.id);
    if (!permit) {
      return res.status(404).json({ status: 'error', message: 'Permit application not found' });
    }

    const updated = await PermitApplication.findByIdAndUpdate(req.params.id, {
      title: title || permit.title,
      description: description || permit.description,
      permitType: permitType || permit.permitType,
      status: status || permit.status,
      comments: comments !== undefined ? comments : permit.comments,
      updatedAt: new Date()
    }, { new: true });

    res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    console.error('Edit Permit Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating permit application' });
  }
};

// @desc    Delete permit application
// @route   DELETE /api/admin/permits/:id
// @access  Private/Admin
export const deletePermit = async (req, res) => {
  try {
    const deleted = await PermitApplication.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Permit application not found' });
    }
    res.status(200).json({ status: 'success', message: 'Permit application deleted successfully' });
  } catch (err) {
    console.error('Delete Permit Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting permit application' });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await EventBooking.find({});
    res.status(200).json({ status: 'success', data: bookings });
  } catch (err) {
    console.error('Fetch Bookings Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching event bookings' });
  }
};

// @desc    Create event booking on behalf of citizen
// @route   POST /api/admin/bookings
// @access  Private/Admin
export const createBookingOnBehalf = async (req, res) => {
  try {
    const { citizenId, title, description, date, timeSlot, venue, status, ticketsCount } = req.body;
    if (!citizenId || !title || !date || !timeSlot || !venue) {
      return res.status(400).json({ status: 'error', message: 'Missing required booking fields' });
    }
    const citizen = await User.findById(citizenId);
    if (!citizen) {
      return res.status(404).json({ status: 'error', message: 'Citizen not found' });
    }

    const newBooking = await EventBooking.create({
      citizenId,
      citizenName: citizen.username,
      title,
      description: description || '',
      date,
      timeSlot,
      venue,
      status: status || 'pending',
      ticketsCount: Number(ticketsCount) || 1,
      createdAt: new Date()
    });
    res.status(201).json({ status: 'success', data: newBooking });
  } catch (err) {
    console.error('Create Booking Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error creating event booking' });
  }
};

// @desc    Update event booking details/status
// @route   PUT /api/admin/bookings/:id
// @access  Private/Admin
export const updateBooking = async (req, res) => {
  try {
    const { title, description, date, timeSlot, venue, status, ticketsCount } = req.body;
    const booking = await EventBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Event booking not found' });
    }

    const updated = await EventBooking.findByIdAndUpdate(req.params.id, {
      title: title || booking.title,
      description: description !== undefined ? description : booking.description,
      date: date || booking.date,
      timeSlot: timeSlot || booking.timeSlot,
      venue: venue || booking.venue,
      status: status || booking.status,
      ticketsCount: ticketsCount !== undefined ? Number(ticketsCount) : booking.ticketsCount
    }, { new: true });

    res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    console.error('Update Booking Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating event booking' });
  }
};

// @desc    Delete event booking
// @route   DELETE /api/admin/bookings/:id
// @access  Private/Admin
export const deleteBooking = async (req, res) => {
  try {
    const deleted = await EventBooking.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Event booking not found' });
    }
    res.status(200).json({ status: 'success', message: 'Event booking deleted successfully' });
  } catch (err) {
    console.error('Delete Booking Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting event booking' });
  }
};

// @desc    Get all taxes
// @route   GET /api/admin/taxes
// @access  Private/Admin
export const getAllTaxes = async (req, res) => {
  try {
    const taxes = await TaxPayment.find({});
    res.status(200).json({ status: 'success', data: taxes });
  } catch (err) {
    console.error('Fetch Taxes Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching tax records' });
  }
};

// @desc    Create tax bill for a citizen
// @route   POST /api/admin/taxes
// @access  Private/Admin
export const createTaxBill = async (req, res) => {
  try {
    const { citizenId, amount, taxType, status, billingDate } = req.body;
    if (!citizenId || !amount || !taxType) {
      return res.status(400).json({ status: 'error', message: 'Missing required tax fields' });
    }
    const citizen = await User.findById(citizenId);
    if (!citizen) {
      return res.status(404).json({ status: 'error', message: 'Citizen not found' });
    }

    const newTax = await TaxPayment.create({
      citizenId,
      citizenName: citizen.username,
      amount: Number(amount),
      taxType,
      status: status || 'pending',
      billingDate: billingDate || new Date()
    });
    res.status(201).json({ status: 'success', data: newTax });
  } catch (err) {
    console.error('Create Tax Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error creating tax bill' });
  }
};

// @desc    Edit tax bill details
// @route   PUT /api/admin/taxes/:id
// @access  Private/Admin
export const editTaxBill = async (req, res) => {
  try {
    const { amount, taxType, status, billingDate } = req.body;
    const tax = await TaxPayment.findById(req.params.id);
    if (!tax) {
      return res.status(404).json({ status: 'error', message: 'Tax record not found' });
    }

    const updated = await TaxPayment.findByIdAndUpdate(req.params.id, {
      amount: amount !== undefined ? Number(amount) : tax.amount,
      taxType: taxType || tax.taxType,
      status: status || tax.status,
      billingDate: billingDate || tax.billingDate
    }, { new: true });

    res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    console.error('Edit Tax Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating tax record' });
  }
};

// @desc    Delete tax bill
// @route   DELETE /api/admin/taxes/:id
// @access  Private/Admin
export const deleteTaxBill = async (req, res) => {
  try {
    const deleted = await TaxPayment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Tax record not found' });
    }
    res.status(200).json({ status: 'success', message: 'Tax record deleted successfully' });
  } catch (err) {
    console.error('Delete Tax Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting tax record' });
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
      { id: 'zone-1', name: 'Residential Zone A', color: 'rgba(52, 211, 153, 0.4)', type: 'residential', plots: [] },
      { id: 'zone-2', name: 'Commercial Zone B', color: 'rgba(96, 165, 250, 0.4)', type: 'commercial', plots: [] },
      { id: 'zone-3', name: 'Industrial Zone C', color: 'rgba(251, 191, 36, 0.4)', type: 'industrial', plots: [] },
      { id: 'zone-4', name: 'Green Space & Recreation', color: 'rgba(74, 222, 128, 0.6)', type: 'recreation', plots: [] }
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
