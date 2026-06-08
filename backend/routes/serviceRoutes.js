import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getMyTaxes,
  payTax,
  getMyPermits,
  applyForPermit,
  getMyBookings,
  bookEvent,
  getCalendarEvents,
  getMyRequests,
  createServiceRequest,
  getAnnouncements
} from '../controllers/serviceController.js';

const router = express.Router();

// Protect all citizen service endpoints
router.use(protect);

router.get('/taxes', getMyTaxes);
router.post('/taxes/:id/pay', payTax);

router.get('/permits', getMyPermits);
router.post('/permits', applyForPermit);

router.get('/bookings', getMyBookings);
router.post('/bookings', bookEvent);
router.get('/calendar-events', getCalendarEvents);

router.get('/requests', getMyRequests);
router.post('/requests', createServiceRequest);

router.get('/announcements', getAnnouncements);

export default router;
