import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request } from 'express';
import { env } from '../../config/env';
import { BadRequestError } from '../errors';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = env.upload.maxFileSizeMb * 1024 * 1024;

const ensureUploadDir = (folder: string): string => {
  const dir = path.resolve(env.upload.uploadDir, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const localStorage = (folder: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = ensureUploadDir(folder);
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
      cb(null, uniqueName);
    },
  });

const imageFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.`));
  }
};

const documentFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if ([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Invalid file type'));
  }
};

export const uploadImages = (folder: string, maxCount = 10) =>
  multer({
    storage: localStorage(folder),
    fileFilter: imageFilter,
    limits: { fileSize: MAX_FILE_SIZE, files: maxCount },
  });

export const uploadSingleImage = (folder: string, fieldName = 'image') =>
  uploadImages(folder, 1).single(fieldName);

export const uploadMultipleImages = (folder: string, fieldName = 'images', maxCount = 10) =>
  uploadImages(folder, maxCount).array(fieldName, maxCount);

export const uploadDocument = (folder: string, fieldName = 'file') =>
  multer({
    storage: localStorage(folder),
    fileFilter: documentFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  }).single(fieldName);

export const uploadCustomBlouseFiles = (folder: string) =>
  multer({
    storage: localStorage(folder),
    fileFilter: imageFilter,
    limits: { fileSize: MAX_FILE_SIZE, files: 5 },
  }).array('references', 5);

export const getFileUrl = (req: Request, filePath: string): string => {
  const proto = req.protocol;
  const host = req.get('host');
  const relative = filePath.replace(/\\/g, '/').replace(env.upload.uploadDir, '');
  return `${proto}://${host}/uploads${relative}`;
};
