import { sendError } from '../utils/responseHandler.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[SERVER ERROR]', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'File size exceeds maximum limit of 10 MB.', 400);
    }
    return sendError(res, `Upload error: ${err.message}`, 400);
  }

  if (err.code === 'P2002') {
    return sendError(res, 'A record with this value already exists (Unique Constraint Violation).', 400);
  }

  if (err.code === 'P2025') {
    return sendError(res, 'Record not found.', 404);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
};
