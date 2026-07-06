import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getAnalytics,
  getAllUsers,
  updateUserRole,
  createUser,
  editUser,
  deleteUser,
  getUserDetails,
  getAllRequests,
  updateServiceRequest,
  createRequestOnBehalf,
  editRequest,
  deleteRequest,
  getAllPermits,
  updatePermitStatus,
  createPermitOnBehalf,
  editPermit,
  deletePermit,
  getAllBookings,
  createBookingOnBehalf,
  updateBooking,
  deleteBooking,
  getAllTaxes,
  createTaxBill,
  editTaxBill,
  deleteTaxBill,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getGisZones,
  addGisPlot,
  exportRequestsCsv
} from '../controllers/adminController.js';

const router = express.Router();

// Enforce authentication for all admin routes
router.use(protect);

// Allow any logged-in user to see GIS zones for planning & development updates
router.get('/gis-zones', getGisZones);

// Restrict all other routes to Admin role only
router.use(adminOnly);

router.get('/analytics', getAnalytics);

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', editUser);
router.delete('/users/:id', deleteUser);
router.get('/users/:id/details', getUserDetails);
router.post('/users/:id/role', updateUserRole);

router.get('/requests', getAllRequests);
router.post('/requests', createRequestOnBehalf);
router.put('/requests/:id', editRequest);
router.delete('/requests/:id', deleteRequest);
router.post('/requests/:id/update', updateServiceRequest);

router.get('/permits', getAllPermits);
router.post('/permits', createPermitOnBehalf);
router.put('/permits/:id', editPermit);
router.delete('/permits/:id', deletePermit);
router.post('/permits/:id/status', updatePermitStatus);

router.get('/bookings', getAllBookings);
router.post('/bookings', createBookingOnBehalf);
router.put('/bookings/:id', updateBooking);
router.delete('/bookings/:id', deleteBooking);

router.get('/taxes', getAllTaxes);
router.post('/taxes', createTaxBill);
router.put('/taxes/:id', editTaxBill);
router.delete('/taxes/:id', deleteTaxBill);

router.post('/announcements', createAnnouncement);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

router.post('/gis-zones', addGisPlot);

router.get('/reports/csv', exportRequestsCsv);

export default router;
