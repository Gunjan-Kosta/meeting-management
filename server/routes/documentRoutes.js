import express from 'express';
import {
  uploadDocuments,
  deleteDocument,
  serveDocumentById,
} from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/rbacMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public / Authenticated File Viewing & Downloading
router.get('/:id/file', serveDocumentById);
router.get('/:id/download', serveDocumentById);
router.get('/file/:id', serveDocumentById);
router.get('/view/:id', serveDocumentById);

router.use(authenticateToken);

router.post(
  '/upload/:meetingId',
  checkRole(['STATE_ADMIN', 'DISTRICT_USER']),
  upload.any(),
  uploadDocuments
);

router.delete('/:documentId', checkRole(['STATE_ADMIN', 'DISTRICT_USER']), deleteDocument);
router.delete('/delete/:id', checkRole(['STATE_ADMIN', 'DISTRICT_USER']), deleteDocument);

export default router;
