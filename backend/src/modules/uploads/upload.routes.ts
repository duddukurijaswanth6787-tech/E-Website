import { Router, Request, Response, NextFunction } from 'express';
import { uploadSingleImage, uploadMultipleImages } from '../../common/middlewares/upload.middleware';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { sendSuccess } from '../../common/responses';
import { PERMISSIONS, UPLOAD_FOLDER } from '../../common/constants';
import { s3Client } from '../../config/aws';
import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../../config/env';
export interface MulterS3File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  bucket: string;
  key: string;
  acl: string;
  contentType: string;
  metadata: any;
  location: string;
  etag: string;
}

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
      const file = req.file as unknown as MulterS3File;
      sendSuccess(res, { url: file.location, key: file.key, size: file.size, mimetype: file.mimetype }, 'File uploaded');
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
      const files = (req.files as unknown as MulterS3File[]) || [];
      const uploadedFiles = files.map((f) => ({ url: f.location, key: f.key, size: f.size, mimetype: f.mimetype }));
      sendSuccess(res, uploadedFiles, 'Files uploaded');
    } catch (err) { next(err); }
  }
);

router.get('/library', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_MEDIA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const folder = (req.query.folder as string) || '';
      
      const command = new ListObjectsV2Command({
        Bucket: env.aws.s3BucketName,
        Prefix: folder ? `${folder}/` : undefined,
      });

      const response = await s3Client.send(command);
      
      const files = (response.Contents || []).map((item) => ({
        key: item.Key,
        url: `https://${env.aws.s3BucketName}.s3.${env.aws.region}.amazonaws.com/${item.Key}`,
        size: item.Size,
        lastModified: item.LastModified
      }));

      sendSuccess(res, files);
    } catch (err) { next(err); }
  }
);

router.delete('/', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_MEDIA),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key } = req.body;
      if (!key) { res.status(400).json({ success: false, message: 'File key is required' }); return; }

      const command = new DeleteObjectCommand({
        Bucket: env.aws.s3BucketName,
        Key: key,
      });

      await s3Client.send(command);
      sendSuccess(res, null, 'File deleted successfully');
    } catch (err) { next(err); }
  }
);

export default router;
