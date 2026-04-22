import { Router, Request, Response, NextFunction } from 'express';
import { uploadSingleImage, uploadMultipleImages, getFileUrl } from '../../common/middlewares/upload.middleware';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { sendSuccess } from '../../common/responses';
import { PERMISSIONS, UPLOAD_FOLDER } from '../../common/constants';
import path from 'path';
import fs from 'fs';
import { env } from '../../config/env';

const router = Router();

router.post('/single',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_MEDIA),
  (req, res, next) => {
    const folder = (req.query.folder as string) || UPLOAD_FOLDER.MISC;
    uploadSingleImage(folder)(req, res, next);
  },
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }
      const url = getFileUrl(req, req.file.path);
      sendSuccess(res, { url, filename: req.file.filename, size: req.file.size }, 'File uploaded');
    } catch (err) { next(err); }
  }
);

router.post('/multiple',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_MEDIA),
  (req, res, next) => {
    const folder = (req.query.folder as string) || UPLOAD_FOLDER.MISC;
    uploadMultipleImages(folder, 'images', 10)(req, res, next);
  },
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      const urls = files.map((f) => ({ url: getFileUrl(req, f.path), filename: f.filename, size: f.size }));
      sendSuccess(res, urls, 'Files uploaded');
    } catch (err) { next(err); }
  }
);

router.get('/library', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_MEDIA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const folder = (req.query.folder as string) || '';
      const dirPath = path.resolve(env.upload.uploadDir, folder);

      if (!fs.existsSync(dirPath)) { sendSuccess(res, []); return; }

      const files = fs.readdirSync(dirPath)
        .filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
        .map((f) => ({
          filename: f,
          url: `${req.protocol}://${req.get('host')}/uploads/${folder ? folder + '/' : ''}${f}`,
          path: path.join(dirPath, f),
        }));

      sendSuccess(res, files);
    } catch (err) { next(err); }
  }
);

export default router;
