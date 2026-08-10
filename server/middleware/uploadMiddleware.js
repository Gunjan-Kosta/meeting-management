import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { MAX_FILE_SIZE, ALLOWED_EXTENSIONS } from '../utils/fileValidator.js';

const getPersistentUploadDir = () => {
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR;
  if (fs.existsSync('/var/data')) return '/var/data/uploads';
  return './uploads';
};

const uploadDir = getPersistentUploadDir();
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${ext}. Permitted formats: PDF, XLSX, DOCX, JPEG, PNG.`), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});
