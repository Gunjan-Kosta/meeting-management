import path from 'path';
import fs from 'fs';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { recordAuditLog } from '../services/auditService.js';
import { MAX_FILE_COUNT } from '../utils/fileValidator.js';

export const uploadDocuments = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const { fileType } = req.body; // MOM, ATTENDANCE_SHEET, AGENDA, PROCEEDINGS, SUPPORTING

    if (!req.files || req.files.length === 0) {
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
    if (currentDocCount + req.files.length > MAX_FILE_COUNT) {
      return sendError(
        res,
        `Maximum file count exceeded. A meeting can hold up to ${MAX_FILE_COUNT} files. Current: ${currentDocCount}`,
        400
      );
    }

    const createdDocs = [];

    for (const file of req.files) {
      const doc = await prisma.meetingDocument.create({
        data: {
          meetingId,
          name: file.originalname,
          filePath: `/uploads/${file.filename}`,
          fileType: fileType || 'SUPPORTING',
          fileSize: file.size,
          uploadedById: req.user.id,
        },
      });
      createdDocs.push(doc);

      const isMoM = (fileType || 'SUPPORTING') === 'MOM';
      await recordAuditLog({
        userId: req.user.id,
        action: isMoM ? 'MOM_UPLOADED' : 'DOCUMENT_UPLOADED',
        details: `Uploaded ${fileType || 'SUPPORTING'} document "${file.originalname}" to meeting ${meeting.meetingCode}`,
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
    const { documentId } = req.params;

    const document = await prisma.meetingDocument.findUnique({
      where: { id: documentId },
      include: { meeting: true },
    });

    if (!document) {
      return sendError(res, 'Document not found.', 404);
    }

    if (req.user.role === 'DISTRICT_USER' && document.meeting.status === 'CLOSED') {
      return sendError(res, 'Cannot delete documents from a closed meeting.', 403);
    }

    // Attempt to remove file from disk
    const absolutePath = path.join(process.cwd(), document.filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await prisma.meetingDocument.delete({ where: { id: documentId } });

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
