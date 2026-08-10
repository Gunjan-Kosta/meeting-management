import path from 'path';

export const ALLOWED_EXTENSIONS = ['.pdf', '.xlsx', '.docx', '.jpg', '.jpeg', '.png'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
export const MAX_FILE_COUNT = 10;

export const validateFileExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
};

export const validateFileSize = (size) => {
  return size <= MAX_FILE_SIZE;
};

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
