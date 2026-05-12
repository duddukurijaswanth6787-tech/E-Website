import { Router } from 'express';
import { productController } from './product.controller';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { PERMISSIONS, UPLOAD_FOLDER } from '../../common/constants';
import { uploadMultipleImages } from '../../common/middlewares/upload.middleware';
import { validateZod } from '../../common/middlewares/zodValidate.middleware';
import { createProductSchema, updateProductSchema } from '../../common/validation/enterprise.schemas';

const router = Router();

// ========== PUBLIC ROUTES ==========
router.get('/', productController.getAll.bind(productController));
router.get('/featured', productController.getFeatured.bind(productController));
router.get('/trending', productController.getTrending.bind(productController));
router.get('/slug/:slug', productController.getBySlug.bind(productController));
router.get('/:id/related', productController.getRelated.bind(productController));

// ========== ADMIN ROUTES ==========
router.get('/admin/all',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  productController.getAll.bind(productController),
);

router.get('/admin/low-stock',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  productController.getLowStock.bind(productController),
);

router.get('/admin/:id',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  productController.getById.bind(productController),
);

router.post('/',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  uploadMultipleImages(UPLOAD_FOLDER.PRODUCTS, 'images', 10),
  validateZod(createProductSchema),
  productController.create.bind(productController),
);

router.put('/:id',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  uploadMultipleImages(UPLOAD_FOLDER.PRODUCTS, 'images', 10),
  validateZod(updateProductSchema),
  productController.update.bind(productController),
);

router.delete('/:id',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  productController.delete.bind(productController),
);

export default router;
