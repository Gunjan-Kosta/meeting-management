import express from 'express';
import {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  submitMeeting,
  closeMeeting,
  reopenMeeting,
  deleteMeeting,
} from '../controllers/meetingController.js';
import { uploadDocuments } from '../controllers/documentController.js';
import { createActionItem } from '../controllers/actionTrackerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/rbacMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', checkRole(['STATE_ADMIN', 'DISTRICT_USER']), createMeeting);
router.get('/', getMeetings);
router.get('/:id', getMeetingById);
router.put('/:id', checkRole(['STATE_ADMIN', 'DISTRICT_USER']), updateMeeting);
router.patch('/:id/submit', checkRole(['STATE_ADMIN', 'DISTRICT_USER']), submitMeeting);
router.patch('/:id/close', checkRole(['STATE_ADMIN']), closeMeeting);
router.patch('/:id/reopen', checkRole(['STATE_ADMIN']), reopenMeeting);
router.delete('/:id', checkRole(['STATE_ADMIN']), deleteMeeting);

// Nested meeting resources
router.post('/:id/documents', checkRole(['STATE_ADMIN', 'DISTRICT_USER']), upload.any(), uploadDocuments);
router.post('/:id/actions', checkRole(['STATE_ADMIN', 'DISTRICT_USER']), createActionItem);

export default router;
