import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getAnalytics,
  getAllUsers,
  updateUserRole,
  getAllRequests,
  updateServiceRequest,
  getAllPermits,
  updatePermitStatus,
  createAnnouncement,
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
router.post('/users/:id/role', updateUserRole);

router.get('/requests', getAllRequests);
router.post('/requests/:id/update', updateServiceRequest);

router.get('/permits', getAllPermits);
router.post('/permits/:id/status', updatePermitStatus);

router.post('/announcements', createAnnouncement);
router.post('/gis-zones', addGisPlot);

router.get('/reports/csv', exportRequestsCsv);

export default router;
