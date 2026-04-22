import { Router, Request, Response, NextFunction } from 'express';
import { Coupon } from './coupon.model';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../../common/responses';
import { PERMISSIONS } from '../../common/constants';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination';
import { NotFoundError } from '../../common/errors';

const router = Router();

// PUBLIC: Validate coupon (no details exposed)
router.post('/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
    if (!coupon) { res.status(200).json({ success: false, message: 'Invalid coupon code' }); return; }
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      res.status(200).json({ success: false, message: 'Coupon has expired' }); return;
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      res.status(200).json({ success: false, message: 'Coupon usage limit reached' }); return;
    }
    sendSuccess(res, {
      code: coupon.code, type: coupon.type, value: coupon.value,
      minOrderAmount: coupon.minOrderAmount, maxDiscountAmount: coupon.maxDiscountAmount,
      description: coupon.description,
    }, 'Coupon is valid');
  } catch (err) { next(err); }
});

// ADMIN CRUD
router.get('/', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_COUPONS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip } = parsePagination(req);
      const filter: Record<string, unknown> = {};
      if (req.query.isActive) filter.isActive = req.query.isActive === 'true';

      const [coupons, total] = await Promise.all([
        Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Coupon.countDocuments(filter),
      ]);
      sendPaginated(res, coupons, buildPaginationMeta(total, page, limit));
    } catch (err) { next(err); }
  }
);

router.post('/', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_COUPONS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coupon = await Coupon.create({ ...req.body, code: req.body.code?.toUpperCase(), createdBy: req.admin!.adminId });
      sendCreated(res, coupon, 'Coupon created');
    } catch (err) { next(err); }
  }
);

router.put('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_COUPONS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coupon = await Coupon.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.admin!.adminId }, { new: true });
      if (!coupon) throw new NotFoundError('Coupon');
      sendSuccess(res, coupon, 'Coupon updated');
    } catch (err) { next(err); }
  }
);

router.delete('/:id', authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_COUPONS),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const c = await Coupon.findByIdAndDelete(req.params.id);
      if (!c) throw new NotFoundError('Coupon');
      sendNoContent(res);
    } catch (err) { next(err); }
  }
);

export default router;
