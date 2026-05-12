import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { env } from '../../config/env';
import { BadRequestError } from '../errors';
import { s3Client } from '../../config/aws';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = env.upload.maxFileSizeMb * 1024 * 1024;

/**
 * Enterprise S3 Storage Engine Configuration
 */
const s3Storage = (folder: string) =>
  multerS3({
    s3: s3Client,
    bucket: env.aws.s3BucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { 
        fieldName: file.fieldname, 
        originalName: file.originalname,
        uploadedAt: new Date().toISOString()
      });
    },
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      // Phase 6 Strategy: [folder]/[YYYY-MM]/[UUID][ext]
      const datePrefix = new Date().toISOString().slice(0, 7); 
      const uniqueName = `${folder}/${datePrefix}/${uuidv4()}${ext}`;
      cb(null, uniqueName);
    },
  });

/**
 * Phase 5: Strict Image Validation Block
 */
const imageFilter = (_req: Request, file: any, cb: multer.FileFilterCallback) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Invalid image type [${file.mimetype}]. Only JPEG, PNG, and WebP are allowed.`));
  }
};

const documentFilter = (_req: Request, file: any, cb: multer.FileFilterCallback) => {
  if ([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Invalid file type. Only images and PDF documents are permitted.'));
  }
};

export const uploadImages = (folder: string, maxCount = 10) =>
  multer({
    storage: s3Storage(folder),
    fileFilter: imageFilter,
    limits: { fileSize: MAX_FILE_SIZE, files: maxCount },
  });

export const uploadSingleImage = (folder: string, fieldName = 'image') =>
  uploadImages(folder, 1).single(fieldName);

export const uploadMultipleImages = (folder: string, fieldName = 'images', maxCount = 10) =>
  uploadImages(folder, maxCount).array(fieldName, maxCount);

export const uploadDocument = (folder: string, fieldName = 'file') =>
  multer({
    storage: s3Storage(folder),
    fileFilter: documentFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  }).single(fieldName);

export const uploadCustomBlouseFiles = (folder: string) =>
  multer({
    storage: s3Storage(folder),
    fileFilter: imageFilter,
    limits: { fileSize: MAX_FILE_SIZE, files: 5 },
  }).array('references', 5);

// Keeping this stub for backwards compatibility during migration
// It will now just return the URL if passed, or fallback
export const getFileUrl = (req: Request, filePath: string): string => {
  if (filePath && filePath.startsWith('http')) return filePath;
  return filePath;
};
