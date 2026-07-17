import { TaxPayment, PermitApplication, EventBooking, ServiceRequest, Announcement } from '../models/dbFactory.js';
import { createNotification } from './notificationController.js';

const notifyAdmins = async ({ title, message, category, linkTarget, actor }) => {
  try {
    await createNotification({
      recipientRole: 'admin',
      actorRole: 'citizen',
      actorId: actor?.id,
      actorName: actor?.username,
      title,
      message,
      category,
      linkTarget
    });
  } catch (err) {
    console.error('Admin Notification Error:', err.message);
  }
};

// ==========================================
// 1. Tax Payments
// ==========================================

// @desc    Get tax payments for current user
// @route   GET /api/services/taxes
// @access  Private
export const getMyTaxes = async (req, res) => {
  try {
    const taxes = await TaxPayment.find({ citizenId: req.user.id.toString() });
    res.status(200).json({ status: 'success', data: taxes });
  } catch (err) {
    console.error('Fetch Taxes Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching taxes' });
  }
};

// @desc    Pay a specific tax bill
// @route   POST /api/services/taxes/:id/pay
// @access  Private
export const payTax = async (req, res) => {
  try {
    const taxId = req.params.id;
    const tax = await TaxPayment.findById(taxId);

    if (!tax) {
      return res.status(404).json({ status: 'error', message: 'Tax bill not found' });
    }

    if (tax.citizenId !== req.user.id.toString()) {
      return res.status(403).json({ status: 'error', message: 'Not authorized to pay this tax bill' });
    }

    if (tax.status === 'paid') {
      return res.status(400).json({ status: 'error', message: 'Tax bill is already paid' });
    }

    // Mock payment confirmation or use Paystack reference if provided
    const reference = req.body.reference;
    const receiptNum = reference || ('REC-2026-' + Math.floor(100000 + Math.random() * 900000));
    const updatedTax = await TaxPayment.findByIdAndUpdate(taxId, {
      status: 'paid',
      paymentDate: new Date(),
      receiptNumber: receiptNum
    }, { new: true });

    await notifyAdmins({
      title: 'Tax payment received',
      message: `${req.user.username} paid ${tax.taxType}. Receipt: ${receiptNum}.`,
      category: 'tax',
      linkTarget: 'taxes',
      actor: req.user
    });

    res.status(200).json({
      status: 'success',
      message: 'Payment processed successfully',
      data: updatedTax
    });
  } catch (err) {
    console.error('Pay Tax Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error processing tax payment' });
  }
};

// ==========================================
// 2. Permit Applications
// ==========================================

// @desc    Get permit applications for current user
// @route   GET /api/services/permits
// @access  Private
export const getMyPermits = async (req, res) => {
  try {
    const permits = await PermitApplication.find({ citizenId: req.user.id.toString() });
    res.status(200).json({ status: 'success', data: permits });
  } catch (err) {
    console.error('Fetch Permits Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching permits' });
  }
};

// @desc    Apply for a permit
// @route   POST /api/services/permits
// @access  Private
export const applyForPermit = async (req, res) => {
  try {
    const { title, description, permitType } = req.body;

    if (!title || !description || !permitType) {
      return res.status(400).json({ status: 'error', message: 'Please provide title, description and permit type' });
    }

    const newPermit = await PermitApplication.create({
      citizenId: req.user.id.toString(),
      citizenName: req.user.username,
      title,
      description: inputMode === 'audio' ? (description || 'Voice recording attached') : description,
      permitType,
      status: 'pending'
    });

    await notifyAdmins({
      title: 'New permit application',
      message: `${req.user.username} submitted "${title}" for review.`,
      category: 'permit',
      linkTarget: 'permits',
      actor: req.user
    });

    res.status(201).json({ status: 'success', data: newPermit });
  } catch (err) {
    console.error('Apply Permit Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error submitting permit application' });
  }
};

// ==========================================
// 3. Event Bookings
// ==========================================

// @desc    Get event bookings for current user
// @route   GET /api/services/bookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await EventBooking.find({ citizenId: req.user.id.toString() });
    res.status(200).json({ status: 'success', data: bookings });
  } catch (err) {
    console.error('Fetch Bookings Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching event bookings' });
  }
};

// @desc    Book an event
// @route   POST /api/services/bookings
// @access  Private
export const bookEvent = async (req, res) => {
  try {
    const { title, description, date, timeSlot, venue, ticketsCount } = req.body;

    if (!title || !date || !timeSlot || !venue) {
      return res.status(400).json({ status: 'error', message: 'Please fill in all required calendar details' });
    }

    const newBooking = await EventBooking.create({
      citizenId: req.user.id.toString(),
      citizenName: req.user.username,
      title,
      description: description || '',
      date,
      timeSlot,
      venue,
      ticketsCount: ticketsCount || 1,
      status: 'approved' // Automatically approve bookings
    });

    await notifyAdmins({
      title: 'New event booking',
      message: `${req.user.username} booked "${title}" at ${venue}.`,
      category: 'booking',
      linkTarget: 'bookings',
      actor: req.user
    });

    res.status(201).json({ status: 'success', data: newBooking });
  } catch (err) {
    console.error('Book Event Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error creating event booking' });
  }
};

// @desc    Get all calendar bookings (for public calendar display)
// @route   GET /api/services/calendar-events
// @access  Private
export const getCalendarEvents = async (req, res) => {
  try {
    const bookings = await EventBooking.find({ status: 'approved' });
    res.status(200).json({ status: 'success', data: bookings });
  } catch (err) {
    console.error('Fetch Calendar Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching calendar' });
  }
};

// ==========================================
// 4. Service Requests
// ==========================================

// @desc    Get service requests for current user
// @route   GET /api/services/requests
// @access  Private
export const getMyRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ citizenId: req.user.id.toString() });
    res.status(200).json({ status: 'success', data: requests });
  } catch (err) {
    console.error('Fetch Requests Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching service requests' });
  }
};

// @desc    Submit a service request
// @route   POST /api/services/requests
// @access  Private
export const createServiceRequest = async (req, res) => {
  try {
    const { title, description, category, priority, language, inputMode, audioData } = req.body;

    if (!title || !category || (inputMode === 'audio' ? !audioData : !description)) {
      return res.status(400).json({ status: 'error', message: 'Please provide a title, category, and a typed or recorded description' });
    }

    const newRequest = await ServiceRequest.create({
      citizenId: req.user.id.toString(),
      citizenName: req.user.username,
      title,
      description,
      category,
      priority: priority || 'medium',
      language: language || 'English',
      inputMode: inputMode === 'audio' ? 'audio' : 'text',
      audioData: inputMode === 'audio' ? audioData : undefined,
      status: 'submitted',
      updates: [{
        status: 'submitted',
        comment: 'Request registered successfully.'
      }]
    });

    await notifyAdmins({
      title: 'New service request',
      message: `${req.user.username} filed "${title}" in ${category}.`,
      category: 'request',
      linkTarget: 'requests',
      actor: req.user
    });

    res.status(201).json({ status: 'success', data: newRequest });
  } catch (err) {
    console.error('Submit Request Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error submitting service request' });
  }
};

// ==========================================
// 5. Announcements
// ==========================================

// @desc    Get system announcements
// @route   GET /api/services/announcements
// @access  Private
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({});
    // Return sorted newest first
    const sorted = announcements.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    res.status(200).json({ status: 'success', data: sorted });
  } catch (err) {
    console.error('Fetch Announcements Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching announcements' });
  }
};
