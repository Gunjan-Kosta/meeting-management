import express from 'express';
import {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  submitMeeting,
  closeMeeting,
  deleteMeeting,
} from '../controllers/meetingController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', checkRole(['STATE_ADMIN', 'DISTRICT_USER']), createMeeting);
router.get('/', getMeetings);
router.get('/:id', getMeetingById);
router.put('/:id', checkRole(['STATE_ADMIN', 'DISTRICT_USER']), updateMeeting);
router.patch('/:id/submit', checkRole(['STATE_ADMIN', 'DISTRICT_USER']), submitMeeting);
router.patch('/:id/close', checkRole(['STATE_ADMIN']), closeMeeting);
router.delete('/:id', checkRole(['STATE_ADMIN']), deleteMeeting);

export default router;
