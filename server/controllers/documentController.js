import path from 'path';
import fs from 'fs';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { recordAuditLog } from '../services/auditService.js';
import { MAX_FILE_COUNT } from '../utils/fileValidator.js';

export const getMimeType = (filename = '') => {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };
  return map[ext] || 'application/octet-stream';
};

export const uploadDocuments = async (req, res, next) => {
  try {
    const meetingId = req.params.meetingId || req.params.id;
    let rawType = req.body.fileType || req.body.category || 'SUPPORTING';
    if (rawType === 'ATTENDANCE') rawType = 'ATTENDANCE_SHEET';
    const fileType = ['MOM', 'ATTENDANCE_SHEET', 'AGENDA', 'PROCEEDINGS', 'SUPPORTING'].includes(rawType)
      ? rawType
      : 'SUPPORTING';

    const files = req.files && Array.isArray(req.files) && req.files.length > 0
      ? req.files
      : (req.file ? [req.file] : []);

    if (files.length === 0) {
      return sendError(res, 'No files were uploaded.', 400);
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { _count: { select: { documents: true } } },
    });

    if (!meeting) {
      return sendError(res, 'Meeting not found.', 404);
    }

    // Role check: District users cannot upload to closed meetings
    if (req.user.role === 'DISTRICT_USER' && meeting.status === 'CLOSED') {
      return sendError(res, 'Cannot upload documents to a closed meeting.', 403);
    }

    const currentDocCount = meeting._count.documents;
    if (currentDocCount + files.length > MAX_FILE_COUNT) {
      return sendError(
        res,
        `Maximum file count exceeded. A meeting can hold up to ${MAX_FILE_COUNT} files. Current: ${currentDocCount}`,
        400
      );
    }

    const createdDocs = [];

    for (const file of files) {
      let fileBuffer = null;
      if (file.buffer) {
        fileBuffer = file.buffer;
      } else if (file.path && fs.existsSync(file.path)) {
        fileBuffer = fs.readFileSync(file.path);
      }

      const mimeType = file.mimetype || getMimeType(file.originalname);

      const doc = await prisma.meetingDocument.create({
        data: {
          meetingId,
          name: file.originalname,
          filePath: `/uploads/${file.filename}`,
          fileType: fileType,
          fileSize: file.size,
          mimeType: mimeType,
          fileData: fileBuffer ? Buffer.from(fileBuffer) : undefined,
          uploadedById: req.user.id,
        },
        select: {
          id: true,
          meetingId: true,
          name: true,
          filePath: true,
          fileType: true,
          fileSize: true,
          mimeType: true,
          uploadedById: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      createdDocs.push(doc);

      const isMoM = fileType === 'MOM';
      await recordAuditLog({
        userId: req.user.id,
        action: isMoM ? 'MOM_UPLOADED' : 'DOCUMENT_UPLOADED',
        details: `Uploaded ${fileType} document "${file.originalname}" to meeting ${meeting.meetingCode}`,
        ipAddress: req.ip,
      });
    }

    return sendSuccess(res, 'Documents uploaded successfully', createdDocs, 201);
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { documentId, id } = req.params;
    const targetDocId = documentId || id;

    const document = await prisma.meetingDocument.findUnique({
      where: { id: targetDocId },
      include: { meeting: true },
    });

    if (!document) {
      return sendError(res, 'Document not found.', 404);
    }

    if (req.user.role === 'DISTRICT_USER' && document.meeting.status === 'CLOSED') {
      return sendError(res, 'Cannot delete documents from a closed meeting.', 403);
    }

    // Attempt to remove file from disk cache if present
    const localUploadsDir = process.env.UPLOAD_DIR || './uploads';
    const filename = path.basename(document.filePath);
    const localPath = path.join(localUploadsDir, filename);
    if (fs.existsSync(localPath)) {
      try {
        fs.unlinkSync(localPath);
      } catch (err) {
        console.warn('[Storage unlink warning]', err.message);
      }
    }

    await prisma.meetingDocument.delete({ where: { id: targetDocId } });

    await recordAuditLog({
      userId: req.user.id,
      action: 'DOCUMENT_DELETED',
      details: `Deleted document "${document.name}" from meeting ${document.meeting.meetingCode}`,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const serveDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isDownload = req.query.download === 'true' || req.path.includes('/download');

    const document = await prisma.meetingDocument.findUnique({
      where: { id },
    });

    if (!document) {
      return sendError(res, 'Document not found.', 404);
    }

    const mimeType = document.mimeType || getMimeType(document.name);
    const disposition = isDownload ? 'attachment' : 'inline';

    if (document.fileData && document.fileData.length > 0) {
      const buffer = Buffer.from(document.fileData);

      // Cache locally on disk for high performance
      try {
        const localUploadsDir = process.env.UPLOAD_DIR || './uploads';
        if (!fs.existsSync(localUploadsDir)) fs.mkdirSync(localUploadsDir, { recursive: true });
        const localPath = path.join(localUploadsDir, path.basename(document.filePath));
        if (!fs.existsSync(localPath)) {
          fs.writeFileSync(localPath, buffer);
        }
      } catch (cacheErr) {
        console.warn('[Cache warning]', cacheErr.message);
      }

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(document.name)}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Content-Security-Policy', "frame-ancestors *");
      res.removeHeader('X-Frame-Options');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    }

    // Fallback: check local disk
    const filename = path.basename(document.filePath);
    const localUploadsDir = process.env.UPLOAD_DIR || './uploads';
    const localPath = path.join(localUploadsDir, filename);

    if (fs.existsSync(localPath)) {
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(document.name)}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Content-Security-Policy', "frame-ancestors *");
      res.removeHeader('X-Frame-Options');
      return res.sendFile(path.resolve(localPath));
    }

    return sendError(res, 'Document file data is not available.', 404);
  } catch (error) {
    next(error);
  }
};
