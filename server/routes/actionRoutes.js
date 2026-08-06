import express from 'express';
import { createActionItem, getActionItems, updateActionItem } from '../controllers/actionTrackerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', checkRole(['STATE_ADMIN', 'DISTRICT_USER']), createActionItem);
router.get('/', getActionItems);
router.put('/:id', checkRole(['STATE_ADMIN', 'DISTRICT_USER']), updateActionItem);

export default router;
