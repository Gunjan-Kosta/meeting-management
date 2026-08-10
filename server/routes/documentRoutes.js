import express from 'express';
import { uploadDocuments, deleteDocument } from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/rbacMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post(
  '/upload/:meetingId',
  checkRole(['STATE_ADMIN', 'DISTRICT_USER']),
  upload.any(),
  uploadDocuments
);

router.delete('/:documentId', checkRole(['STATE_ADMIN', 'DISTRICT_USER']), deleteDocument);

export default router;
