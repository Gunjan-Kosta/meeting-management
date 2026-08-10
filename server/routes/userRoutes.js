import express from 'express';
import { getUsers, createUser, updateUserStatus, deleteUser } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateToken);
router.use(checkRole(['STATE_ADMIN']));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUserStatus);
router.delete('/:id', deleteUser);

export default router;
