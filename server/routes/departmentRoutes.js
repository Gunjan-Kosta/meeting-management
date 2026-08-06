import express from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getDepartments);
router.post('/', checkRole(['STATE_ADMIN']), createDepartment);
router.put('/:id', checkRole(['STATE_ADMIN']), updateDepartment);
router.delete('/:id', checkRole(['STATE_ADMIN']), deleteDepartment);

export default router;
