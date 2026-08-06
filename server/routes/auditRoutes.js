import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateToken);
router.use(checkRole(['STATE_ADMIN']));

router.get('/', getAuditLogs);

export default router;
