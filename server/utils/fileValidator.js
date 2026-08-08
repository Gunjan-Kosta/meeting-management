import path from 'path';

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.jpg', '.jpeg', '.png', '.webp'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
export const MAX_FILE_COUNT = 10;

export const validateFileExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
};

export const validateFileSize = (size) => {
  return size <= MAX_FILE_SIZE;
};
